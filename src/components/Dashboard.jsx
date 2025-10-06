import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { quizService } from "../services/quizService";
import WeaknessAnalysis from "./WeaknessAnalysis";
import PerformanceCharts from "./PerformanceCharts";
import BookmarkedQuestions from "./BookmarkedQuestions";

const Dashboard = ({ onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("analysis");
  const [quizHistory, setQuizHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load quiz history and stats
      const [historyResult, statsResult] = await Promise.all([
        quizService.getQuizHistory(20), // Get last 20 quizzes
        quizService.getQuizStats(),
      ]);

      if (historyResult.error) throw historyResult.error;
      if (statsResult.error) throw statsResult.error;

      setQuizHistory(historyResult.data || []);
      setStats(statsResult.data);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBadge = (percentage) => {
    if (percentage >= 90) return { text: "Excellent", color: "bg-green-500" };
    if (percentage >= 80) return { text: "Good", color: "bg-blue-500" };
    if (percentage >= 60) return { text: "Average", color: "bg-yellow-500" };
    return { text: "Needs Work", color: "bg-red-500" };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50">
        <div className="glass-card p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="text-gray-300">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="dashboard-modal glass-card w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="dashboard-header flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Dashboard</h2>
            <p className="text-gray-400">
              Welcome back, {user?.user_metadata?.full_name || user?.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs flex border-b border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab("analysis")}
            className={`dashboard-tab px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === "analysis"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🎯 Smart Analysis
          </button>
          <button
            onClick={() => setActiveTab("charts")}
            className={`dashboard-tab px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === "charts"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📈 Performance Charts
          </button>
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "bookmarks"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🔖 Bookmarks
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`dashboard-tab px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === "history"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📝 Quiz History
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`dashboard-tab px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === "stats"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📊 Statistics
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`dashboard-tab px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === "profile"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            👤 Profile
          </button>
        </div>

        {/* Content */}
        <div className="dashboard-content p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Smart Analysis Tab */}
          {activeTab === "analysis" && <WeaknessAnalysis user={user} />}

          {/* Performance Charts Tab */}
          {activeTab === "charts" && <PerformanceCharts user={user} />}

          {/* Bookmarks Tab */}
          {activeTab === "bookmarks" && <BookmarkedQuestions user={user} />}

          {/* Quiz History Tab */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4">
                Recent Quiz Results
              </h3>
              {quizHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">
                    No Quiz History
                  </h3>
                  <p className="text-gray-400">
                    Take your first quiz to see your results here!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {quizHistory.map((quiz) => {
                    const badge = getScoreBadge(quiz.score_percentage);
                    return (
                      <div
                        key={quiz.id}
                        className="bg-white/5 rounded-lg p-4 border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${badge.color} text-white`}
                            >
                              {badge.text}
                            </span>
                            <h4 className="font-semibold text-white">
                              {quiz.category}
                            </h4>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-400">
                              {quiz.difficulty}
                            </span>
                          </div>
                          <span className="text-sm text-gray-400">
                            {formatDate(quiz.created_at)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Score</span>
                            <div
                              className={`font-semibold ${getScoreColor(quiz.score_percentage)}`}
                            >
                              {quiz.score_percentage}%
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Questions</span>
                            <div className="font-semibold text-white">
                              {quiz.correct_answers}/{quiz.total_questions}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Time</span>
                            <div className="font-semibold text-white">
                              {quiz.time_taken
                                ? formatTime(quiz.time_taken)
                                : "N/A"}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Accuracy</span>
                            <div className="font-semibold text-white">
                              {Math.round(
                                (quiz.correct_answers / quiz.total_questions) *
                                  100,
                              )}
                              %
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === "stats" && stats && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Your Statistics
              </h3>

              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {stats.totalQuizzes}
                  </div>
                  <div className="text-sm text-gray-400">Total Quizzes</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {stats.averageScore}%
                  </div>
                  <div className="text-sm text-gray-400">Average Score</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {stats.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-400">
                    Questions Answered
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {stats.totalCorrect}
                  </div>
                  <div className="text-sm text-gray-400">Correct Answers</div>
                </div>
              </div>

              {/* Category Performance */}
              {Object.keys(stats.categoryStats).length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Performance by Category
                  </h4>
                  <div className="grid gap-3">
                    {Object.entries(stats.categoryStats).map(
                      ([category, data]) => (
                        <div
                          key={category}
                          className="bg-white/5 rounded-lg p-4 border border-white/10"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">
                              {category}
                            </span>
                            <div className="text-right">
                              <div
                                className={`font-semibold ${getScoreColor(data.averageScore)}`}
                              >
                                {data.averageScore}%
                              </div>
                              <div className="text-xs text-gray-400">
                                {data.count} quizzes
                              </div>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Difficulty Performance */}
              {Object.keys(stats.difficultyStats).length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Performance by Difficulty
                  </h4>
                  <div className="grid gap-3">
                    {Object.entries(stats.difficultyStats).map(
                      ([difficulty, data]) => (
                        <div
                          key={difficulty}
                          className="bg-white/5 rounded-lg p-4 border border-white/10"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">
                              {difficulty}
                            </span>
                            <div className="text-right">
                              <div
                                className={`font-semibold ${getScoreColor(data.averageScore)}`}
                              >
                                {data.averageScore}%
                              </div>
                              <div className="text-xs text-gray-400">
                                {data.count} quizzes
                              </div>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Profile Information
              </h3>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {(
                        user?.user_metadata?.full_name.charAt(0) ||
                        user?.user_metadata?.full_name?.charAt(0) ||
                        ""
                      ).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {user?.user_metadata?.full_name || user?.email}
                    </h4>
                    <p className="text-gray-400">
                      Member since {formatDate(user?.created_at || new Date())}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                      {user?.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      User ID
                    </label>
                    <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm">
                      {user?.id?.slice(0, 8)}...
                    </div>
                  </div>
                </div>

                {stats && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h5 className="text-lg font-semibold text-white mb-4">
                      Quick Stats
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-400">
                          {stats.totalQuizzes}
                        </div>
                        <div className="text-xs text-gray-400">
                          Quizzes Taken
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-400">
                          {stats.averageScore}%
                        </div>
                        <div className="text-xs text-gray-400">Avg Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-400">
                          {Object.keys(stats.categoryStats).length}
                        </div>
                        <div className="text-xs text-gray-400">Categories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-yellow-400">
                          {stats.totalQuestions > 0
                            ? Math.round(
                                (stats.totalCorrect / stats.totalQuestions) *
                                  100,
                              )
                            : 0}
                          %
                        </div>
                        <div className="text-xs text-gray-400">Accuracy</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
