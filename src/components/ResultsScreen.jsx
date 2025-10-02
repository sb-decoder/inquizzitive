// src/components/ResultsScreen.jsx

export default function ResultsScreen({ score, quiz, answers, onReset }) {
  return (
    <div className="results-section">
      <div className="glass-card results-header">
        <h2>🎉 Quiz Completed!</h2>
        <div className="score-display">
          <div className="score-circle">
            <span className="score-percentage">{score.percentage}%</span>
            <span className="score-fraction">{score.correct}/{score.total}</span>
          </div>
        </div>
      </div>
      <div className="answers-review">
        <h3 className="review-title">📝 Answer Review</h3>
        {quiz.map((q, idx) => (
          <div key={idx} className={`glass-card answer-card ${answers[idx] === q.answer ? "correct" : "incorrect"}`}>
            <p className="answer-question">Q{idx + 1}. {q.question}</p>
            <div className="answer-details">
              <p>Your Answer: {answers[idx] || "Not answered"}</p>
              <p>Correct Answer: {q.answer}</p>
              <p className="explanation-text">💡 {q.explanation}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="results-actions">
        <button onClick={onReset} className="new-quiz-btn">🔄 Start New Quiz</button>
      </div>
    </div>
  );
}