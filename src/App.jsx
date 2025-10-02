

import { useState, useEffect } from "react";
import { useQuiz } from "./hooks/useQuiz";
import  "./index.css";
import QuizSetupScreen from "./components/QuizSetupScreen";
import ActiveQuiz from "./components/ActiveQuiz";
import ResultsScreen from "./components/ResultsScreen";
import LoadingScreen from "./components/LoadingScreen";
import Dashboard from "./components/Dashboard"; // Import the new component

export default function App() {
  const { status, loading, quiz, answers, timeLeft, score, startQuiz, handleOptionSelect, handleSubmit, resetQuiz } = useQuiz();
  
  const [view, setView] = useState("practice"); 
  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode") || "false"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const renderContent = () => {
    
    if (view === "dashboard") {
      return <Dashboard onBackToPractice={() => setView("practice")} />;
    }
    
    
    if (status === "loading" || loading) {
      return <LoadingScreen />;
    }
    if (status === "active") {
      return <ActiveQuiz quiz={quiz} answers={answers} onSelect={handleOptionSelect} onSubmit={handleSubmit} timeLeft={timeLeft} />;
    }
    if (status === "submitted") {
      return <ResultsScreen score={score} quiz={quiz} answers={answers} onReset={resetQuiz} />;
    }
    return <QuizSetupScreen onStartQuiz={startQuiz} loading={loading} />;
  };

  return (
    <div className="app">
      <nav className="floating-nav">
        <div className="nav-brand">🧠 Inquizzitive</div>
        <div className="nav-links">
          <button onClick={() => { setView("practice"); resetQuiz(); }} className="nav-btn">Practice</button>
          <button onClick={() => setView("dashboard")} className="nav-btn">Dashboard</button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="ml-2 p-2 rounded-lg bg-white/10">{isDarkMode ? "☀️" : "🌙"}</button>
        </div>
      </nav>
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>
      <main className="main-container">
        {renderContent()}
      </main>
    </div>
  );
}