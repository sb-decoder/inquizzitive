import { useState, useEffect } from "react";

export default function Dashboard({ onBackToPractice }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load history from localStorage when the component mounts
    const savedHistory = JSON.parse(localStorage.getItem("quizHistory") || "[]");
    setHistory(savedHistory);
  }, []);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire quiz history? This cannot be undone.")) {
      localStorage.removeItem("quizHistory");
      setHistory([]);
    }
  };
  
  return (
    <div className="dashboard-section">
      <div className="glass-card dashboard-header">
        <h1 className="welcome-title"><span className="gradient-text">Your Dashboard</span></h1>
        <p className="welcome-subtitle">Review your past performance and track your progress.</p>
      </div>

      {history.length > 0 ? (
        <div className="history-list">
          {history.map((item, index) => (
            <div key={index} className="glass-card history-item">
              <div className="history-item-header">
                <span className="history-category">{item.category}</span>
                <span className="history-date">{new Date(item.date).toLocaleDateString()}</span>
              </div>
              <div className="history-item-body">
                <div className="score-circle-small">
                  <span className="score-percentage-small">{item.percentage}%</span>
                </div>
                <div className="history-score-details">
                  <p>Score: <strong>{item.score} / {item.total}</strong></p>
                  <p>Accuracy: <strong>{item.percentage}%</strong></p>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clearHistory} className="clear-history-btn">Clear History</button>
        </div>
      ) : (
        <div className="glass-card no-history">
          <p>You haven't completed any quizzes yet.</p>
          <p>Click "Practice" to get started!</p>
        </div>
      )}
      <button onClick={onBackToPractice} className="start-btn" style={{marginTop: '20px'}}>
        <span>🧠</span> Back to Practice
      </button>
    </div>
  );
}