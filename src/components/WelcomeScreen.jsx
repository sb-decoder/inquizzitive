import { CATEGORIES, DIFFICULTIES, QUESTION_OPTIONS } from "../constants/quiz.jsx";

export default function WelcomeScreen({
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  numQuestions,
  setNumQuestions,
  onStartQuiz,
  loading
}) {
  return (
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
                {CATEGORIES.map((cat) => (
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
                {DIFFICULTIES.map((diff) => (
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
              {QUESTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onStartQuiz}
            disabled={loading}
            className="start-btn"
          >
            <span>🚀</span>
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
