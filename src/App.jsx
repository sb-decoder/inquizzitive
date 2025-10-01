import { useState } from "react";
import { useDarkMode } from "./hooks/useDarkMode.jsx";
import { useQuiz } from "./hooks/useQuiz.jsx";
import Navbar from "./components/Navbar.jsx";
import WelcomeScreen from "./components/WelcomeScreen.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import QuizSection from "./components/QuizSection.jsx";
import ResultsSection from "./components/ResultsSection.jsx";

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("Current Affairs");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [showStartScreen, setShowStartScreen] = useState(true);

  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const {
    loading,
    quiz,
    answers,
    submitted,
    timeLeft,
    fetchQuiz,
    handleOptionSelect,
    handleSubmit,
    resetQuiz
  } = useQuiz();

  const handleStartQuiz = () => {
    setShowStartScreen(false);
    fetchQuiz(selectedCategory, selectedDifficulty, numQuestions);
  };

  const handleResetQuiz = () => {
    resetQuiz();
    setShowStartScreen(true);
  };

  return (
    <div className="app">
      <Navbar 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
        onResetQuiz={handleResetQuiz} 
      />

      {/* Background Elements */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="main-container">
        {showStartScreen && (
          <WelcomeScreen
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            numQuestions={numQuestions}
            setNumQuestions={setNumQuestions}
            onStartQuiz={handleStartQuiz}
            loading={loading}
          />
        )}

        {loading && (
          <LoadingScreen 
            numQuestions={numQuestions} 
            selectedCategory={selectedCategory} 
          />
        )}

        {quiz.length > 0 && !submitted && (
          <QuizSection
            quiz={quiz}
            selectedCategory={selectedCategory}
            selectedDifficulty={selectedDifficulty}
            timeLeft={timeLeft}
            answers={answers}
            onOptionSelect={handleOptionSelect}
            onSubmit={handleSubmit}
            submitted={submitted}
          />
        )}

        {submitted && (
          <ResultsSection
            quiz={quiz}
            answers={answers}
            onNewQuiz={handleResetQuiz}
          />
        )}
      </div>
    </div>
  );
}
