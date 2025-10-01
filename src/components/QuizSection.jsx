import { calculateProgress, formatTime } from "../utils/quizUtils.jsx";

export default function QuizSection({
  quiz,
  selectedCategory,
  selectedDifficulty,
  timeLeft,
  answers,
  onOptionSelect,
  onSubmit,
  submitted
}) {
  const progress = calculateProgress(answers, quiz.length);

  return (
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
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass-card progress-card">
        <div className="progress-header">
          <span className="progress-text">
            Progress: {progress.answered} of {progress.total} questions answered
          </span>
          <span className="progress-percentage">{progress.percentage}%</span>
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
              <span className="question-number">Q{idx + 1}</span>
              <p className="question-text">{q.question}</p>
            </div>

            <div className="options-grid">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => onOptionSelect(idx, opt)}
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
        <button onClick={onSubmit} className="submit-btn">
          Submit Quiz
        </button>
      </div>
    </div>
  );
}
