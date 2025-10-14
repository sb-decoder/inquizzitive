import { useState, useEffect } from "react";

export default function NotificationBadge({ user, onCategorySelect }) {
  const [insights, setInsights] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  // Load insights from localStorage
  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user]);

  const loadInsights = () => {
    try {
      const storedInsights = localStorage.getItem(
        `insights_${user?.id || "guest"}`,
      );
      if (storedInsights) {
        const parsedInsights = JSON.parse(storedInsights);
        setInsights(parsedInsights);
        // Only show badge if there are unread insights
        setShowBadge(parsedInsights.length > 0);
      } else {
        setShowBadge(false);
      }
    } catch (error) {
      console.error("Error loading insights:", error);
      setShowBadge(false);
    }
  };

  const deleteInsight = (index) => {
    const updatedInsights = insights.filter((_, i) => i !== index);
    setInsights(updatedInsights);

    // Save to localStorage
    try {
      if (updatedInsights.length > 0) {
        localStorage.setItem(
          `insights_${user?.id || "guest"}`,
          JSON.stringify(updatedInsights),
        );
      } else {
        // Remove from localStorage if no insights left
        localStorage.removeItem(`insights_${user?.id || "guest"}`);
        setShowBadge(false);
        setShowPanel(false);
      }
    } catch (error) {
      console.error("Error saving insights:", error);
    }
  };

  const clearAllInsights = () => {
    setInsights([]);
    try {
      localStorage.removeItem(`insights_${user?.id || "guest"}`);
    } catch (error) {
      console.error("Error clearing insights:", error);
    }
    setShowBadge(false);
    setShowPanel(false);
  };

  const handleInsightClick = (insight) => {
    if (onCategorySelect && insight.category) {
      onCategorySelect(insight.category);
      setShowPanel(false);
    }
  };

  // Don't render anything if there are no insights or badge should be hidden
  if (!showBadge || insights.length === 0) {
    return null;
  }

  return (
    <>
      {/* Notification Badge Button */}
      <div className="notification-badge">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="notification-badge-btn"
          aria-label="View insights"
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {insights.length > 0 && (
            <span className="badge-count">{insights.length}</span>
          )}
        </button>
      </div>

      {/* Notification Panel */}
      {showPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />

          {/* Panel */}
          <div className="notification-panel">
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold text-lg">
                  Smart Insights
                </h3>
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label="Close panel"
                >
                  <svg
                    className="w-5 h-5"
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
              {insights.length > 1 && (
                <button
                  onClick={clearAllInsights}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {insights.length === 0 ? (
                <div className="text-white/60 text-center py-8">
                  No insights available
                </div>
              ) : (
                insights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">
                            {insight.icon || "💡"}
                          </span>
                          <h4 className="text-white font-medium text-sm">
                            {insight.title}
                          </h4>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed mb-3">
                          {insight.message}
                        </p>
                        {insight.category && (
                          <button
                            onClick={() => handleInsightClick(insight)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg transition-all"
                          >
                            Practice {insight.category}
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => deleteInsight(index)}
                        className="text-white/50 hover:text-red-400 transition-colors flex-shrink-0"
                        aria-label="Delete insight"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
