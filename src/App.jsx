// src/App.jsx
import { useEffect, useState } from "react";
import ExamPrepPage from "./ExamPrepPage";
import ScrollTop from "./components/ScrollTop";
import NotificationBadge from "./components/NotificationBadge";
import GlassmorphicDropdown from "./components/GlassmorphicDropdown";
import { bookmarkService } from "./services/bookmarkService";

import { jsPDF } from "jspdf"; // Import jsPDF
import "./components/Result.css";

const QUESTION_OPTIONS = [
  { value: 5, label: "5 Questions (2.5 min)" },
  { value: 10, label: "10 Questions (5 min)" },
  { value: 15, label: "15 Questions (7.5 min)" },
  { value: 20, label: "20 Questions (10 min)" },
];
const QUESTION_LABELS = QUESTION_OPTIONS.map((opt) => opt.label);
const getQuestionValue = (label) =>
  QUESTION_OPTIONS.find((opt) => opt.label === label)?.value;
const getQuestionLabel = (value) =>
  QUESTION_OPTIONS.find((opt) => opt.value === value)?.label;

export default function App({
  user,
  onSignIn,
  onSignOut,
  onShowDashboard,
  saveQuizResult,
}) {
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState(null);
  const [categories] = useState([
    "Current Affairs",
    "Geography",
    "History",
    "Indian Defence",
    "Politics",
    "Sports",
    "Literature",
  ]);
  const [difficulties] = useState(["Easy", "Medium", "Hard"]);
  const [selectedCategory, setSelectedCategory] = useState("Current Affairs");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [originalQuiz, setOriginalQuiz] = useState([]);
  const [showExamPrepPage, setShowExamPrepPage] = useState(false);

  // Bookmark states
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());
  const [bookmarkLoading, setBookmarkLoading] = useState(new Set());

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Fetch Quiz
  async function fetchQuiz() {
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    setError(null);
    setShowStartScreen(false);

    try {
      // Use custom questions if available for the selected category
      // if (customQuestions[selectedCategory]) {
      //   const questions = customQuestions[selectedCategory].slice(0, numQuestions);
      //   setQuiz(questions);
      //   setTimeLeft(questions.length * 30);
      //   setShowStartScreen(false);
      //   setLoading(false);
      //   return;
      // }
      // Otherwise, use AI-generated questions
      const requestUrl = `${import.meta.env.VITE_API_BASE_URL || ""}/api/getGeminiResponse?qcount=${numQuestions}&category=${selectedCategory}&difficulty=${selectedDifficulty}`;
      const result = await fetch(requestUrl, {
        method: "GET",
      });
      let text = await result.text();
      text = text.replace(/```json|```/g, "").trim();

      console.log("Raw AI response:", text); // Debug log

      if (!text) {
        throw new Error("The AI returned an empty response. Please try again.");
      }

      let questions;
      try {
        questions = JSON.parse(text);
      } catch {
        throw new Error(
          "Couldn't understand the quiz format. Please try again.",
        );
      }

      // Validate and clean the data
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("No questions were generated. Please try again.");
      }

      const cleanedQuestions = questions.map((q) => ({
        ...q,
        answer: q.answer?.trim(),
        options: q.options?.map((opt) => opt?.trim()),
      }));

      console.log("Cleaned questions:", cleanedQuestions); // Debug log

      // Basic shape check
      const first = cleanedQuestions[0];
      if (
        !first ||
        !first.question ||
        !Array.isArray(first.options) ||
        typeof first.answer !== "string"
      ) {
        throw new Error("The quiz data was malformed. Please try again.");
      }

      setQuiz(cleanedQuestions);
      setOriginalQuiz(cleanedQuestions);
      setTimeLeft(cleanedQuestions.length * 30);
      setShowStartScreen(false);
    } catch (err) {
      console.error("Error generating quiz:", err);
      setQuiz([]);
      const friendly =
        err?.message ||
        "We couldn't generate your quiz. Please try again in a moment.";
      setError(friendly);
    }
    setLoading(false);
  }

  function retryQuiz() {
    setQuiz([...originalQuiz]);
    setAnswers({});
    setSubmitted(false);
    setTimeLeft(originalQuiz.length * 30);
  }

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !submitted && quiz.length > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && quiz.length > 0 && !submitted) handleSubmit();
  }, [timeLeft, submitted, quiz]);

  function handleOptionSelect(qIndex, option) {
    if (!submitted) setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  }

  async function handleSubmit() {
    setSubmitted(true);

    // Save quiz result to database if user is authenticated
    if (user && saveQuizResult) {
      const score = calculateScore();
      const timeTaken = quiz.length * 30 - timeLeft; // Calculate time taken

      const quizData = {
        category: selectedCategory,
        difficulty: selectedDifficulty,
        totalQuestions: quiz.length,
        correctAnswers: score.correct,
        scorePercentage: parseFloat(score.percentage),
        timeTaken: timeTaken,
        questions: quiz,
        userAnswers: answers,
      };

      try {
        const result = await saveQuizResult(quizData);
        if (result.error) {
          console.error("Failed to save quiz result:", result.error);
        } else {
          console.log("Quiz result saved successfully");
        }
      } catch (error) {
        console.error("Error saving quiz result:", error);
      }
    }
  }

  function calculateScore() {
    let correct = 0;
    quiz.forEach((q, i) => {
      const userAnswer = answers[i]?.trim();
      const correctAnswer = q.answer?.trim();

      if (
        userAnswer &&
        correctAnswer &&
        userAnswer.toLowerCase() === correctAnswer.toLowerCase()
      ) {
        correct++;
      }
    });
    return {
      correct,
      total: quiz.length,
      percentage: ((correct / quiz.length) * 100).toFixed(1),
    };
  }

  function resetQuiz() {
    setQuiz([]);
    setAnswers({});
    setSubmitted(false);
    setTimeLeft(0);
    setShowStartScreen(true);

    setError(null);
    setShowExamPrepPage(false);
  }

  function showExamPrep() {
    setShowExamPrepPage(true);
    setShowStartScreen(false);
  }

  function hideExamPrep() {
    setShowExamPrepPage(false);
    setShowStartScreen(true);
  }

  // Bookmark functions
  const checkBookmarkStatus = async (question) => {
    if (!user) return;

    try {
      const result = await bookmarkService.isBookmarked(
        question.question,
        question.answer,
      );
      if (result.isBookmarked) {
        setBookmarkedQuestions(
          (prev) =>
            new Set([...prev, `${question.question}-${question.answer}`]),
        );
      }
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };

  const handleBookmarkToggle = async (questionIndex) => {
    if (!user) {
      // Show sign-in prompt or modal
      alert("Please sign in to bookmark questions");
      return;
    }

    const question = quiz[questionIndex];
    const questionKey = `${question.question}-${question.answer}`;

    setBookmarkLoading((prev) => new Set([...prev, questionIndex]));

    try {
      const isCurrentlyBookmarked = bookmarkedQuestions.has(questionKey);

      if (isCurrentlyBookmarked) {
        // Remove bookmark
        const result = await bookmarkService.removeBookmarkByQuestion(
          question.question,
          question.answer,
        );
        if (result.success) {
          setBookmarkedQuestions((prev) => {
            const newSet = new Set(prev);
            newSet.delete(questionKey);
            return newSet;
          });
        } else {
          console.error("Error removing bookmark:", result.error);
        }
      } else {
        // Add bookmark
        const bookmarkData = {
          question: question.question,
          options: question.options,
          answer: question.answer,
          explanation: question.explanation,
          category: selectedCategory,
          difficulty: selectedDifficulty,
        };

        const result = await bookmarkService.saveBookmark(bookmarkData);
        if (result.data) {
          setBookmarkedQuestions((prev) => new Set([...prev, questionKey]));
        } else if (result.error === "Question already bookmarked") {
          // Question was already bookmarked, update UI state
          setBookmarkedQuestions((prev) => new Set([...prev, questionKey]));
        } else {
          console.error("Error saving bookmark:", result.error);
        }
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setBookmarkLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(questionIndex);
        return newSet;
      });
    }
  };

  // Check bookmark status when quiz loads
  useEffect(() => {
    if (quiz.length > 0 && user) {
      quiz.forEach((question) => {
        checkBookmarkStatus(question);
      });
    }
  }, [quiz, user]);

  // PDF Generation Function
  const generatePDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Set font and colors for glassmorphic theme
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(40, 40, 40);

      // Add title
      doc.setFontSize(18);
      doc.text("Inquizzitive Quiz Results", 20, 20);

      // Add score summary
      doc.setFontSize(14);
      doc.text(`Score: ${score.percentage}%`, 20, 40);
      doc.text(`Total Questions: ${score.total}`, 20, 50);
      doc.text(`Correct Answers: ${score.correct}`, 20, 60);
      doc.text(`Incorrect Answers: ${score.total - score.correct}`, 20, 70);

      // Add question-wise feedback
      if (quiz.length > 0) {
        doc.setFontSize(12);
        doc.text("Question-wise Performance:", 20, 90);
        let yPosition = 100;

        quiz.forEach((q, index) => {
          // Check for page overflow
          if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
          }

          const userAnswer = answers[index] || "Not answered";
          const isCorrect = userAnswer.toLowerCase() === q.answer.toLowerCase();

          doc.setFontSize(10);

          // Split question text to fit page width
          const questionLines = doc.splitTextToSize(
            `${index + 1}. ${q.question}`,
            170,
          );
          doc.text(questionLines, 20, yPosition);
          yPosition += questionLines.length * 5;

          const answerLines = doc.splitTextToSize(
            `Your Answer: ${userAnswer}`,
            170,
          );
          doc.text(answerLines, 20, yPosition);
          yPosition += answerLines.length * 5;

          const correctLines = doc.splitTextToSize(
            `Correct Answer: ${q.answer}`,
            170,
          );
          doc.text(correctLines, 20, yPosition);
          yPosition += correctLines.length * 5;

          const statusLines = doc.splitTextToSize(
            `Status: ${isCorrect ? "Correct" : "Incorrect"}`,
            170,
          );
          doc.text(statusLines, 20, yPosition);
          yPosition += statusLines.length * 5;

          if (q.explanation) {
            const explanationLines = doc.splitTextToSize(
              `Explanation: ${q.explanation}`,
              170,
            );
            doc.text(explanationLines, 20, yPosition);
            yPosition += explanationLines.length * 5;
          }

          yPosition += 5;
        });
      }

      // Add footer
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Generated by Inquizzitive - Powered by xAI",
        20,
        doc.internal.pageSize.height - 10,
      );

      // Save PDF
      doc.save(
        `Inquizzitive_Quiz_Results_${new Date().toISOString().split("T")[0]}.pdf`,
      );
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const score = submitted ? calculateScore() : null;

  function calculateProgress() {
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = quiz.length;
    const percentage =
      totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
    return {
      answered: answeredCount,
      total: totalQuestions,
      percentage: Math.round(percentage),
    };
  }

  const progress = calculateProgress();

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        !event.target.closest(".mobile-menu") &&
        !event.target.closest(".hamburger-btn")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("mobile-menu-open");
    } else {
      document.body.classList.remove("mobile-menu-open");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("mobile-menu-open");
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="app">
      {/* Floating Navbar */}
      <nav className="floating-nav">
        <div className="nav-brand">
          <span className="nav-logo">🧠</span>
          <span className="nav-title">Inquizzitive</span>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links desktop-nav">
          <button className="nav-btn" onClick={resetQuiz}>
            Practice
          </button>
          <button className="nav-btn" onClick={showExamPrep}>
            Exam Prep
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <button className="nav-btn" onClick={onShowDashboard}>
                Dashboard
              </button>
              <span className="text-sm text-gray-300">
                {user.user_metadata?.full_name || user.email}
              </span>
              <button className="nav-btn" onClick={onSignOut}>
                Sign Out
              </button>
            </div>
          ) : (
            <button className="nav-btn nav-btn-primary" onClick={onSignIn}>
              Sign In
            </button>
          )}
          <button
            onClick={toggleDarkMode}
            className="ml-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/30"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <svg
                className="w-5 h-5 text-yellow-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="mobile-nav">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/30"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <svg
                className="w-4 h-4 text-yellow-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="hamburger-btn p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/30"
            aria-label="Toggle menu"
          >
            <div className="hamburger-icon">
              <span
                className={`hamburger-line ${isMobileMenuOpen ? "open" : ""}`}
              ></span>
              <span
                className={`hamburger-line ${isMobileMenuOpen ? "open" : ""}`}
              ></span>
              <span
                className={`hamburger-line ${isMobileMenuOpen ? "open" : ""}`}
              ></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <button
              className="mobile-menu-item"
              onClick={() => {
                resetQuiz();
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="mobile-menu-icon">🎯</span>
              Practice
            </button>
            <button
              className="mobile-menu-item"
              onClick={() => {
                showExamPrep();
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="mobile-menu-icon">📚</span>
              Exam Prep
            </button>
            {user ? (
              <>
                <button
                  className="mobile-menu-item"
                  onClick={() => {
                    onShowDashboard();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span className="mobile-menu-icon">📊</span>
                  Dashboard
                </button>
                <button
                  className="mobile-menu-item"
                  onClick={() => {
                    onSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span className="mobile-menu-icon">👋</span>
                  Sign Out
                </button>
              </>
            ) : (
              <button
                className="mobile-menu-item primary"
                onClick={() => {
                  onSignIn();
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="mobile-menu-icon">👤</span>
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

      {/* Background Elements */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="main-container">
        {/* Error Banner */}
        {error && (
          <div className="alert alert-error" role="alert">
            <div className="alert-content">
              <div className="alert-icon">⚠️</div>
              <div className="alert-text">
                <div className="alert-title">We hit a snag</div>
                <div className="alert-desc">{error}</div>
              </div>
            </div>
            <div className="alert-actions">
              <button
                className="btn-retry"
                disabled={loading}
                onClick={fetchQuiz}
              >
                {loading ? "Retrying..." : "Retry"}
              </button>
              <button
                className="alert-close"
                aria-label="Dismiss error"
                onClick={() => setError(null)}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Exam Prep Page */}
        {showExamPrepPage && <ExamPrepPage onBack={hideExamPrep} />}

        {/* Welcome Screen */}
        {showStartScreen && (
          <div className="welcome-section">
            <div className="glass-card welcome-card">
              <h1 className="welcome-title">
                Welcome to <span className="gradient-text">Inquizzitive</span>
              </h1>
              <p className="welcome-subtitle">
                Master government exams with AI-powered practice sessions
              </p>

              <div className="welcome-actions">
                <button onClick={showExamPrep} className="info-btn">
                  📚 Learn About Exam Prep
                </button>
              </div>

              <div className="quiz-setup">
                <div className="setup-row">
                  <div className="input-group">
                    <label>Category</label>
                    <GlassmorphicDropdown
                      options={categories}
                      defaultOption={selectedCategory}
                      onSelect={setSelectedCategory}
                      className="w-full"
                    />
                  </div>
                  <div className="input-group">
                    <label>Difficulty</label>
                    <GlassmorphicDropdown
                      options={difficulties}
                      defaultOption={selectedDifficulty}
                      onSelect={setSelectedDifficulty}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>Number of Questions</label>
                  <GlassmorphicDropdown
                    options={QUESTION_LABELS}
                    defaultOption={getQuestionLabel(numQuestions)}
                    onSelect={(label) =>
                      setNumQuestions(getQuestionValue(label))
                    }
                    className="w-full"
                  />
                </div>
                <button
                  onClick={fetchQuiz}
                  disabled={loading}
                  className="start-btn"
                >
                  <span>🚀</span>
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="relative">
              <div className="absolute inset-0 animate-ping opacity-20">
                <div className="h-32 w-32 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
              </div>
              <div className="relative flex flex-col items-center gap-6">
                <div className="relative h-32 w-32">
                  <div className="absolute inset-0 animate-spin rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-1">
                    <div className="h-full w-full rounded-full bg-gray-900"></div>
                  </div>
                  <div
                    className="absolute inset-0 animate-spin"
                    style={{ animationDuration: "1.5s" }}
                  >
                    <div className="h-full w-full rounded-full border-4 border-transparent border-t-purple-400"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl animate-pulse">🧠</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    Generating Your Quiz
                  </h3>
                  <p className="text-gray-400 animate-pulse">
                    Crafting {numQuestions} questions on {selectedCategory}...
                  </p>
                  <div className="flex gap-2 mt-2">
                    <div
                      className="h-2 w-2 rounded-full bg-purple-500 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 rounded-full bg-pink-500 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 rounded-full bg-blue-500 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Section */}
        {quiz.length > 0 && !submitted && (
          <div className="quiz-section">
            <div className="glass-card quiz-header-card">
              <div className="quiz-info">
                <h2>{selectedCategory} Quiz</h2>
                <span className="quiz-meta">
                  {selectedDifficulty} • {quiz.length} Questions
                </span>
              </div>
              <div className="timer">
                <span className="timer-icon">⏱️</span>
                <span className="timer-text">
                  {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
            <div className="glass-card progress-card">
              <div className="progress-header">
                <span className="progress-text">
                  Progress: {progress.answered} of {progress.total} questions
                  answered
                </span>
                <span className="progress-percentage">
                  {progress.percentage}%
                </span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
            </div>
            <div className="questions-container">
              {quiz.map((q, idx) => (
                <div key={idx} className="glass-card question-card">
                  <div className="question-header">
                    <div className="question-header-left">
                      <span className="question-number">Q{idx + 1}</span>
                      <p className="question-text">{q.question}</p>
                    </div>
                    {user && (
                      <button
                        onClick={() => handleBookmarkToggle(idx)}
                        disabled={bookmarkLoading.has(idx)}
                        className={`bookmark-btn ${
                          bookmarkedQuestions.has(`${q.question}-${q.answer}`)
                            ? "bookmarked"
                            : ""
                        }`}
                        title={
                          bookmarkedQuestions.has(`${q.question}-${q.answer}`)
                            ? "Remove bookmark"
                            : "Bookmark this question"
                        }
                      >
                        {bookmarkLoading.has(idx) ? (
                          <span className="bookmark-loading">⟳</span>
                        ) : bookmarkedQuestions.has(
                            `${q.question}-${q.answer}`,
                          ) ? (
                          <span className="bookmark-icon bookmarked">🔖</span>
                        ) : (
                          <span className="bookmark-icon">📌</span>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="options-grid">
                    {q.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionSelect(idx, opt)}
                        className={`option-btn ${
                          answers[idx] === opt ? "selected" : ""
                        }`}
                      >
                        <span className="option-letter">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="option-text">{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="quiz-actions">
              <button onClick={handleSubmit} className="submit-btn">
                Submit Quiz
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {submitted && score && (
          <div className="results-section">
            <div className="glass-card results-header">
              <div className="results-celebration">
                <span className="celebration-emoji">🎉</span>
                <h2>Quiz Completed!</h2>
              </div>
              <div className="score-display">
                <div className="score-circle">
                  <span className="score-percentage">{score.percentage}%</span>
                  <span className="score-fraction">
                    {score.correct}/{score.total}
                  </span>
                </div>
                <div className="score-details">
                  <div className="score-item">
                    <span className="score-label">Correct</span>
                    <span className="score-value correct">{score.correct}</span>
                  </div>
                  <div className="score-item">
                    <span className="score-label">Wrong</span>
                    <span className="score-value wrong">
                      {score.total - score.correct}
                    </span>
                  </div>
                  <div className="score-item">
                    <span className="score-label">Total</span>
                    <span className="score-value total">{score.total}</span>
                  </div>
                </div>
                <button className="retry-btn" onClick={retryQuiz}>
                  🔄️ Retry
                </button>
              </div>
            </div>

            <div className="answers-review">
              <h3 className="review-title">📝 Answer Review</h3>
              {quiz.map((q, idx) => {
                const userAnswer = answers[idx];
                const isCorrect = userAnswer === q.answer;

                return (
                  <div
                    key={idx}
                    className={`glass-card answer-card ${
                      isCorrect ? "correct" : "incorrect"
                    }`}
                  >
                    <div className="answer-header">
                      <span className="answer-number">Q{idx + 1}</span>
                      <span
                        className={`answer-status ${
                          isCorrect ? "correct" : "incorrect"
                        }`}
                      >
                        {isCorrect ? "✅" : "❌"}
                      </span>
                    </div>
                    <p className="answer-question">{q.question}</p>
                    <div className="answer-details">
                      <div className="answer-row">
                        <span className="answer-label">Your Answer:</span>
                        <span
                          className={`answer-value ${
                            isCorrect ? "correct" : "incorrect"
                          }`}
                        >
                          {userAnswer || "Not answered"}
                        </span>
                      </div>
                      <div className="answer-row">
                        <span className="answer-label">Correct Answer:</span>
                        <span className="answer-value correct">{q.answer}</span>
                      </div>
                      {q.explanation && (
                        <div className="explanation">
                          <span className="explanation-icon">💡</span>
                          <p className="explanation-text">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="results-actions">
              <button onClick={resetQuiz} className="new-quiz-btn">
                🔄 Start New Quiz
              </button>
              <button onClick={generatePDF} className="download-pdf-btn">
                📄 Download Results as PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Top Button */}
      <ScrollTop />

      {/* Smart Notification Badge */}
      <NotificationBadge
        user={user}
        onCategorySelect={(category) => {
          setSelectedCategory(category);
          setShowStartScreen(true);
        }}
      />
    </div>
  );
}
