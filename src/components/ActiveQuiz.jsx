// src/components/ActiveQuiz.jsx

export default function ActiveQuiz({ quiz, answers, onSelect, onSubmit, timeLeft }) {
  const answeredCount = Object.keys(answers).length;
  const progress = quiz.length > 0 ? (answeredCount / quiz.length) * 100 : 0;

  return (
    <div className="quiz-section">
      <div className="glass-card quiz-header-card">
        <h2>Quiz in Progress</h2>
        <div className="timer">⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</div>
      </div>
      <div className="glass-card progress-card">
        <span>Progress: {Math.round(progress)}%</span>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <div className="questions-container">
        {quiz.map((q, idx) => (
          <div key={idx} className="glass-card question-card">
            <p className="question-text">Q{idx + 1}. {q.question}</p>
            <div className="options-grid">
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => onSelect(idx, opt)} className={`option-btn ${answers[idx] === opt ? "selected" : ""}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="quiz-actions">
        <button onClick={onSubmit} className="submit-btn">Submit Quiz</button>
      </div>
    </div>
  );
}
