import { calculateScore } from "../utils/quizUtils.jsx";

export default function ResultsSection({ quiz, answers, onNewQuiz }) {
  const score = calculateScore(quiz, answers);

  return (
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
        <button onClick={onNewQuiz} className="new-quiz-btn">
          🔄 Start New Quiz
        </button>
      </div>
    </div>
  );
}
