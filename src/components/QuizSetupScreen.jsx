// src/components/QuizSetupScreen.jsx

import { useState } from "react";

const categories = ["Current Affairs", "Geography", "History", "Indian Defence", "Politics", "Sports", "Literature"];
const difficulties = ["Easy", "Medium", "Hard"];

export default function QuizSetupScreen({ onStartQuiz, loading }) {
  const [category, setCategory] = useState(categories[0]);
  const [difficulty, setDifficulty] = useState(difficulties[1]);
  const [numQuestions, setNumQuestions] = useState(10);

  const handleStart = () => {
    onStartQuiz(category, difficulty, numQuestions);
  };

  return (
    <div className="welcome-section">
      <div className="glass-card welcome-card">
        <h1 className="welcome-title">Welcome to <span className="gradient-text">Inquizzitive</span></h1>
        <p className="welcome-subtitle">Master government exams with AI-powered practice sessions</p>
        <div className="quiz-setup">
          {/* Category Select */}
          <div className="input-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="glass-select">
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          {/* Difficulty Select */}
          <div className="input-group">
            <label>Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="glass-select">
              {difficulties.map((diff) => <option key={diff} value={diff}>{diff}</option>)}
            </select>
          </div>
          {/* Number of Questions Select */}
          <div className="input-group">
            <label>Number of Questions</label>
            <select value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className="glass-select">
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
            </select>
          </div>
          <button onClick={handleStart} disabled={loading} className="start-btn">
            <span>🚀</span> Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}