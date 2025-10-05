import { useState, useEffect } from "react";
import { analyticsService } from "../services/analyticsService";
import SmartNotifications from "./SmartNotifications";

const NotificationBadge = ({ user, onCategorySelect }) => {
  const [hasNotifications, setHasNotifications] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [urgentCount, setUrgentCount] = useState(0);

  useEffect(() => {
    if (user) {
      checkForNotifications();
    }
  }, [user]);

  const checkForNotifications = async () => {
    try {
      const analysis = await analyticsService.analyzeWeakness(user.id);
      if (analysis && !analysis.error) {
        const urgentRecs =
          analysis.recommendations?.filter(
            (rec) => rec.priority === "high" || rec.type === "urgent",
          ) || [];

        const declining =
          analysis.overallProgress?.recentTrend === "declining-fast";

        const totalUrgent = urgentRecs.length + (declining ? 1 : 0);
        setUrgentCount(totalUrgent);
        setHasNotifications(totalUrgent > 0);
      }
    } catch (error) {
      console.error("Error checking notifications:", error);
    }
  };

  const handleRecommendationClick = (category) => {
    setShowPanel(false);
    onCategorySelect?.(category);
  };

  if (!user || !hasNotifications) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Notification Panel */}
      {showPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPanel(false)}
          />

          {/* Panel */}
          <div className="absolute bottom-16 right-0 w-96 max-w-[90vw] bg-gray-900/95 backdrop-blur-lg rounded-lg border border-white/20 shadow-2xl">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Smart Insights</h3>
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <SmartNotifications
                user={user}
                onRecommendationClick={handleRecommendationClick}
              />
            </div>
          </div>
        </>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
        aria-label="Smart recommendations"
      >
        <div className="text-xl">🧠</div>

        {/* Notification Badge */}
        {urgentCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {urgentCount > 9 ? "9+" : urgentCount}
          </div>
        )}

        {/* Pulse animation for urgent notifications */}
        {urgentCount > 0 && (
          <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></div>
        )}
      </button>
    </div>
  );
};

export default NotificationBadge;
