import { useState, useEffect } from "react";
import { analyticsService } from "../services/analyticsService";

const SmartNotifications = ({ user, onRecommendationClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    setLoading(true);

    try {
      const analysis = await analyticsService.analyzeWeakness(user.id);
      if (analysis && !analysis.error) {
        const smartNotifications = [];

        // High priority recommendations become notifications
        const urgentRecommendations =
          analysis.recommendations?.filter(
            (rec) => rec.priority === "high" || rec.type === "urgent",
          ) || [];

        urgentRecommendations.slice(0, 2).forEach((rec) => {
          smartNotifications.push({
            id: `rec_${rec.category}_${rec.type}`,
            type: "recommendation",
            priority: "high",
            title: rec.title,
            message: rec.description,
            action: rec.action,
            category: rec.category,
            icon: rec.icon || "💡",
            timestamp: new Date(),
          });
        });

        // Declining performance alerts
        if (analysis.overallProgress?.recentTrend === "declining-fast") {
          smartNotifications.push({
            id: "trend_declining",
            type: "alert",
            priority: "high",
            title: "Performance Alert",
            message:
              "Your recent scores have dropped significantly. Time to refocus!",
            action: "Review your weak areas and take practice quizzes",
            icon: "⚠️",
            timestamp: new Date(),
          });
        }

        // Streak encouragement
        const streakData = analysis.detailedInsights?.find(
          (insight) =>
            insight.type === "achievement" && insight.title.includes("streak"),
        );

        if (streakData) {
          smartNotifications.push({
            id: "streak_motivation",
            type: "motivation",
            priority: "medium",
            title: "Keep Your Streak Going!",
            message: streakData.description,
            action: "Take a quiz today to maintain your streak",
            icon: "🔥",
            timestamp: new Date(),
          });
        }

        // Study reminder based on last activity
        const lastQuizDate =
          analysis.overallProgress?.totalQuizzes > 0 ? new Date() : null; // Simplified - would use actual last quiz date

        if (lastQuizDate) {
          const daysSinceLastQuiz = Math.floor(
            (new Date() - lastQuizDate) / (1000 * 60 * 60 * 24),
          );

          if (daysSinceLastQuiz >= 2) {
            smartNotifications.push({
              id: "study_reminder",
              type: "reminder",
              priority: "medium",
              title: "Time to Practice!",
              message: `It's been ${daysSinceLastQuiz} days since your last quiz. Regular practice improves retention.`,
              action: "Take a quick 5-question quiz",
              icon: "📚",
              timestamp: new Date(),
            });
          }
        }

        // Celebration for achievements
        const improvements =
          analysis.detailedInsights?.filter(
            (insight) => insight.type === "improvement" && insight.positive,
          ) || [];

        if (improvements.length > 0) {
          smartNotifications.push({
            id: "celebration",
            type: "celebration",
            priority: "low",
            title: "Great Progress!",
            message: improvements[0].description,
            action: "Keep up the excellent work!",
            icon: "🎉",
            timestamp: new Date(),
          });
        }

        setNotifications(
          smartNotifications.filter((n) => !dismissed.has(n.id)),
        );
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const dismissNotification = (notificationId) => {
    setDismissed((prev) => new Set([...prev, notificationId]));
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-red-500/50 bg-red-500/10";
      case "medium":
        return "border-yellow-500/50 bg-yellow-500/10";
      case "low":
        return "border-green-500/50 bg-green-500/10";
      default:
        return "border-blue-500/50 bg-blue-500/10";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "alert":
        return "text-red-400";
      case "recommendation":
        return "text-purple-400";
      case "reminder":
        return "text-blue-400";
      case "motivation":
        return "text-orange-400";
      case "celebration":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/20 rounded mb-2"></div>
                  <div className="h-3 bg-white/10 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">✨</div>
        <p className="text-gray-300">All caught up!</p>
        <p className="text-gray-400 text-sm">
          No new recommendations or alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Smart Notifications
        </h3>
        <span className="text-sm text-gray-400">
          {notifications.length} new
        </span>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`rounded-lg p-4 border ${getPriorityColor(notification.priority)} transition-all hover:bg-white/5`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{notification.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4
                      className={`font-semibold ${getTypeColor(notification.type)}`}
                    >
                      {notification.title}
                    </h4>
                    <p className="text-gray-300 text-sm mt-1">
                      {notification.message}
                    </p>
                  </div>
                  <button
                    onClick={() => dismissNotification(notification.id)}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                    aria-label="Dismiss notification"
                  >
                    ×
                  </button>
                </div>

                {notification.action && (
                  <div className="mt-3 p-2 bg-white/5 rounded border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">
                      Suggested Action:
                    </div>
                    <div className="text-sm text-white">
                      {notification.action}
                    </div>
                  </div>
                )}

                {notification.category &&
                  notification.type === "recommendation" && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() =>
                          onRecommendationClick?.(notification.category)
                        }
                        className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs rounded border border-purple-500/30 transition-colors"
                      >
                        Practice {notification.category}
                      </button>
                    </div>
                  )}

                <div className="mt-2 text-xs text-gray-500">
                  {notification.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => setNotifications([])}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Clear All Notifications
        </button>
      </div>
    </div>
  );
};

export default SmartNotifications;
