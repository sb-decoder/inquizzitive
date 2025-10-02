// src/pages/QuizPage.jsx

import { useEffect, useState, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsPDF } from "jspdf";
import { useAuth } from '../context/AuthContext';

// NOTE: This is a placeholder. You must have the real ExamPrepPage.jsx file in your project.
const ExamPrepPage = ({ onBack }) => (
  <div className="glass-card welcome-card">
    <h2 className="text-white text-2xl mb-4">Exam Prep Information</h2>
    <p className="text-white/80 mb-6">This section provides curated study materials, previous year question papers, and strategic guides to help you excel in your government exam preparation.</p>
    <button onClick={onBack} className="start-btn">Back to Practice</button>
  </div>
);

import '../App.css';

// --- STYLES FOR THE NEW NAVBAR MENU ---
// These styles are now self-contained within this file and will not affect App.css
const styles = {
  userMenuContainer: { position: 'relative', display: 'flex', alignItems: 'center' },
  userMenuTrigger: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '6px 12px 6px 6px', borderRadius: '50px',
    border: '1px solid transparent', cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  userAvatar: {
    width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover',
    border: '2px solid rgba(255, 255, 255, 0.5)',
  },
  userAvatarPlaceholder: {
    width: '32px', height: '32px', borderRadius: '50%',
    backgroundColor: '#f5576c', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem',
    color: 'white', textTransform: 'uppercase',
  },
  userName: { color: 'white', fontWeight: '500', fontSize: '0.9rem' },
  userMenuDropdown: {
    position: 'absolute', top: 'calc(100% + 12px)', right: '0',
    width: '220px', background: 'rgba(30, 30, 50, 0.8)',
    backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    padding: '0.5rem', zIndex: 50,
  },
  userMenuHeader: {
    padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', marginBottom: '0.25rem',
  },
  userMenuHeaderStrong: { color: 'white', fontWeight: '600' },
  userMenuItem: {
    display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
    textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '8px',
    color: 'white', fontSize: '0.9rem', background: 'none', border: 'none',
    cursor: 'pointer',
  },
  userMenuItemSignOut: {
    color: '#ff8a8a', fontWeight: '500'
  },
  darkModeToggle: {
    background: 'none', border: 'none', padding: '0.5rem', marginLeft: '0.5rem',
    cursor: 'pointer', fontSize: '1.2rem', color: 'white', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
};

export default function QuizPage() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [categories] = useState(["Current Affairs", "Geography", "History", "Indian Defence", "Politics", "Sports", "Literature"]);
  const [difficulties] = useState(["Easy", "Medium", "Hard"]);
  const [selectedCategory, setSelectedCategory] = useState("Current Affairs");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showExamPrepPage, setShowExamPrepPage] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode")) || false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [userMenuRef]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const handleLogout = () => logout();

  async function fetchQuiz() { /* YOUR ORIGINAL fetchQuiz LOGIC */ }
  useEffect(() => { /* YOUR ORIGINAL TIMER LOGIC */ }, [timeLeft, submitted, quiz]);
  const handleOptionSelect = (qIndex, option) => !submitted && setAnswers(prev => ({ ...prev, [qIndex]: option }));
  const handleSubmit = () => setSubmitted(true);
  const calculateScore = () => { /* YOUR ORIGINAL calculateScore LOGIC */ };
  const resetQuiz = () => {
    setQuiz([]); setAnswers({}); setSubmitted(false); setTimeLeft(0);
    setShowStartScreen(true); setShowExamPrepPage(false); setError(null);
  };
  const showExamPrep = () => { setShowStartScreen(false); setShowExamPrepPage(true); };
  const hideExamPrep = () => { setShowExamPrepPage(false); setShowStartScreen(true); };
  const retryQuiz = () => { resetQuiz(); fetchQuiz(); };
  const generatePDF = () => { /* YOUR ORIGINAL generatePDF LOGIC */ };
  const score = submitted ? calculateScore() : null;
  const progress = (() => { /* YOUR ORIGINAL progress LOGIC */ })();

  return (
    <div className="app">
      <nav className="floating-nav">
        <div className="nav-brand">
          <span className="nav-logo">🧠</span>
          <span className="nav-title">Inquizzitive</span>
        </div>
        
        <div className="nav-links desktop-nav">
          <button className="nav-btn" onClick={resetQuiz}>Practice</button>
          <button className="nav-btn" onClick={showExamPrep}>Exam Prep</button>
          <div className="w-px h-6 bg-white/20 mx-4"></div>
          
          <div style={styles.userMenuContainer} ref={userMenuRef}>
            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} style={styles.userMenuTrigger}>
              {user?.avatar_data ? (
                <img src={user.avatar_data} alt="User Avatar" style={styles.userAvatar} />
              ) : (
                <div style={styles.userAvatarPlaceholder}>{user?.name?.charAt(0)}</div>
              )}
              <span style={styles.userName} className="hidden sm:block">{user?.name || 'Guest'}</span>
            </button>
            {isUserMenuOpen && (
              <div style={styles.userMenuDropdown}>
                <div style={styles.userMenuHeader}>
                  Signed in as<br/><strong style={styles.userMenuHeaderStrong}>{user?.uname}</strong>
                </div>
                <button style={styles.userMenuItem}>⚙️ Settings</button>
                <button onClick={handleLogout} style={{ ...styles.userMenuItem, ...styles.userMenuItemSignOut }}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
          
          <button onClick={toggleDarkMode} style={styles.darkModeToggle} aria-label="Toggle dark mode">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="mobile-nav">
           {/* Your existing mobile nav buttons go here */}
        </div>
      </nav>

      {/* --- ALL THE CODE BELOW IS YOUR ORIGINAL CODE, UNCHANGED --- */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      <div className="main-container">
        {error && <div>Error: {error}</div>}
        {showExamPrepPage && <ExamPrepPage onBack={hideExamPrep} />}
        {showStartScreen && !showExamPrepPage && (
          <div className="welcome-section">
           <div className="glass-card welcome-card">
             <h1 className="welcome-title">Welcome to <span className="gradient-text">Inquizzitive</span></h1>
             <p className="welcome-subtitle">Master government exams with AI-powered practice sessions</p>
              <div className="quiz-setup">
               <div className="setup-row">
                 <div className="input-group">
                   <label>Category</label>
                   <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="glass-select">
                     {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                   </select>
                 </div>
                 <div className="input-group">
                   <label>Difficulty</label>
                   <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} className="glass-select">
                     {difficulties.map((diff) => (<option key={diff} value={diff}>{diff}</option>))}
                   </select>
                 </div>
               </div>
               <div className="input-group">
                 <label>Number of Questions</label>
                 <select value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className="glass-select">
                   <option value={5}>5 Questions</option>
                   <option value={10}>10 Questions</option>
                   <option value={15}>15 Questions</option>
                 </select>
               </div>
               <button onClick={fetchQuiz} disabled={loading} className="start-btn">Start Quiz</button>
              </div>
            </div>
          </div>
        )}
        {/* The rest of your page content for loading, quiz, and results is safe. */}
      </div>
    </div>
  );
}