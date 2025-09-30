import { GoogleGenerativeAI } from "@google/generative-ai";
import { useEffect, useState } from "react";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [categories] = useState([
    "Current Affairs",
    "Geography",
    "History",
    "Indian Defence",
    "Politics",
  ]);
  const [difficulties] = useState(["Easy", "Medium", "Hard"]);
  const [selectedCategory, setSelectedCategory] = useState("Current Affairs");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [showStartScreen, setShowStartScreen] = useState(true);

  // Fetch Quiz
  async function fetchQuiz() {
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    setShowStartScreen(false);

    try {
      // Replace this with your actual Gemini API call

      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
      Generate ${numQuestions} multiple choice questions on ${selectedCategory} for ${selectedDifficulty} difficulty level.
      
      IMPORTANT: The "answer" field must contain the EXACT same text as one of the options.
      
      Respond strictly in JSON format like:
      [
        {
          "question": "Who is the current Prime Minister of India?",
          "options": ["Narendra Modi", "Rahul Gandhi", "Amit Shah", "Yogi Adityanath"],
          "answer": "Narendra Modi",
          "explanation": "Narendra Modi has been the Prime Minister of India since 2014."
        }
      ]
      
      Make sure the answer field exactly matches one of the options (including capitalization and spacing).`;
      const result = await model.generateContent(prompt);
      let text = await result.response.text();
      text = text.replace(/```json|```/g, "").trim();

      console.log("Raw AI response:", text); // Debug log

      const questions = JSON.parse(text);

      // Validate and clean the data
      const cleanedQuestions = questions.map((q) => ({
        ...q,
        answer: q.answer?.trim(),
        options: q.options?.map((opt) => opt?.trim()),
      }));

      console.log("Cleaned questions:", cleanedQuestions); // Debug log

      setQuiz(cleanedQuestions);
      // Set timer based on number of questions (30 seconds per question)
      setTimeLeft(cleanedQuestions.length * 30);
    } catch (err) {
      console.error("Error generating quiz:", err);
      alert("Failed to generate quiz. Check console.");
    }
    setLoading(false);
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

  function handleSubmit() {
    setSubmitted(true);
  }

  function calculateScore() {
    let correct = 0;
    quiz.forEach((q, i) => {
      // Trim whitespace and do case-insensitive comparison
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
  }

  const score = submitted ? calculateScore() : null;

  return (
    <div className="app">
      {/* Floating Navbar */}
      <nav className="floating-nav">
        <div className="nav-brand">
          <span className="nav-logo">🧠</span>
          <span className="nav-title">Inquizzitive</span>
        </div>
        <div className="nav-links">
          <button className="nav-btn" onClick={resetQuiz}>
            Practice
          </button>
          <button className="nav-btn">Dashboard</button>
          <button className="nav-btn nav-btn-primary">Sign In</button>
        </div>
      </nav>

      {/* Background Elements */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="main-container">
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

              <div className="quiz-setup">
                <div className="setup-row">
                  <div className="input-group">
                    <label>Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="glass-select"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Difficulty</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="glass-select"
                    >
                      {difficulties.map((diff) => (
                        <option key={diff} value={diff}>
                          {diff}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Number of Questions</label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="glass-select"
                  >
                    <option value={5}>5 Questions (2.5 min)</option>
                    <option value={10}>10 Questions (5 min)</option>
                    <option value={15}>15 Questions (7.5 min)</option>
                    <option value={20}>20 Questions (10 min)</option>
                  </select>
                </div>

                <button
                  onClick={fetchQuiz}
                  disabled={loading}
                  className="start-btn"
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      Start Quiz
                    </>
                  )}
                </button>
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

            <div className="questions-container">
              {quiz.map((q, idx) => (
                <div key={idx} className="glass-card question-card">
                  <div className="question-header">
                    <span className="question-number">Q{idx + 1}</span>
                    <p className="question-text">{q.question}</p>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
