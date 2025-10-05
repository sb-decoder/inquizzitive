import { supabase } from '../lib/supabase'


export const analyticsService = {

    async getPerformanceChartData(userId, days = 30) {
    try {
      console.log('📊 Fetching performance chart data for user:', userId, 'days:', days)
      
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - days)
      
      const { data: quizHistory, error } = await supabase
        .from('quiz_history')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      if (!quizHistory || quizHistory.length === 0) {
        return {
          overall: [],
          categoryTrends: {},
          totalQuizzes: 0,
          error: null
        }
      }

      const dailyData = {}
      const categoryData = {}

      quizHistory.forEach(quiz => {
        const date = quiz.created_at.split('T')[0]
        const category = quiz.category || 'General'
        const score = parseFloat(quiz.score_percentage) || 0

        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            scores: [],
            totalQuestions: 0,
            correctAnswers: 0
          }
        }
        dailyData[date].scores.push(score)
        dailyData[date].totalQuestions += quiz.total_questions || 0
        dailyData[date].correctAnswers += quiz.correct_answers || 0

        if (!categoryData[category]) {
          categoryData[category] = []
        }
        categoryData[category].push({
          date,
          score,
          quiz_id: quiz.id
        })
      })

      const overallData = Object.values(dailyData).map(day => ({
        date: day.date,
        averageScore: day.scores.reduce((sum, score) => sum + score, 0) / day.scores.length,
        accuracy: day.totalQuestions > 0 ? (day.correctAnswers / day.totalQuestions) * 100 : 0,
        quizCount: day.scores.length
      }))

      const categoryTrends = {}
      Object.keys(categoryData).forEach(category => {
        const categoryQuizzes = categoryData[category]
        const dailyAvg = {}
        
        categoryQuizzes.forEach(quiz => {
          if (!dailyAvg[quiz.date]) {
            dailyAvg[quiz.date] = []
          }
          dailyAvg[quiz.date].push(quiz.score)
        })

        categoryTrends[category] = Object.keys(dailyAvg).map(date => ({
          date,
          averageScore: dailyAvg[date].reduce((sum, score) => sum + score, 0) / dailyAvg[date].length,
          quizCount: dailyAvg[date].length
        })).sort((a, b) => new Date(a.date) - new Date(b.date))
      })

      return {
        overall: overallData,
        categoryTrends,
        totalQuizzes: quizHistory.length,
        error: null
      }

    } catch (error) {
      console.error('Error getting performance chart data:', error)
      return {
        overall: [],
        categoryTrends: {},
        totalQuizzes: 0,
        error: error.message
      }
    }
  },

  // Analyze user's performance patterns and identify weak areas
  async analyzeWeakness(userId) {
    try {
      console.log('🔎 Fetching quiz history for user:', userId)
      
      const { data: quizHistory, error } = await supabase
        .from('quiz_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      console.log('📚 Quiz history data:', quizHistory)
      console.log('❓ Quiz history error:', error)

      if (error) throw error

      if (!quizHistory || quizHistory.length === 0) {
        console.log('📭 No quiz history found')
        return {
          weakAreas: [],
          strengths: [],
          recommendations: [],
          overallProgress: null,
          categoryAnalysis: {},
          difficultyAnalysis: {},
          recentTrend: 'no-data'
        }
      }

      console.log(`📊 Found ${quizHistory.length} quizzes, analyzing...`)

      // Category-wise analysis
      const categoryStats = {}
      const difficultyStats = {}
      const timeBasedStats = []

      quizHistory.forEach(quiz => {
        const category = quiz.category
        const difficulty = quiz.difficulty
        const scorePercentage = parseFloat(quiz.score_percentage)
        const accuracy = (quiz.correct_answers / quiz.total_questions) * 100

        // Category analysis
        if (!categoryStats[category]) {
          categoryStats[category] = {
            totalQuizzes: 0,
            totalScore: 0,
            totalQuestions: 0,
            totalCorrect: 0,
            averageScore: 0,
            averageAccuracy: 0,
            trend: [],
            lastScore: 0,
            bestScore: 0,
            worstScore: 100,
            improvementRate: 0
          }
        }

        const catStat = categoryStats[category]
        catStat.totalQuizzes++
        catStat.totalScore += scorePercentage
        catStat.totalQuestions += quiz.total_questions
        catStat.totalCorrect += quiz.correct_answers
        catStat.trend.push({ date: quiz.created_at, score: scorePercentage })
        catStat.lastScore = scorePercentage
        catStat.bestScore = Math.max(catStat.bestScore, scorePercentage)
        catStat.worstScore = Math.min(catStat.worstScore, scorePercentage)

        // Difficulty analysis
        if (!difficultyStats[difficulty]) {
          difficultyStats[difficulty] = {
            totalQuizzes: 0,
            averageScore: 0,
            totalScore: 0
          }
        }

        difficultyStats[difficulty].totalQuizzes++
        difficultyStats[difficulty].totalScore += scorePercentage

        // Time-based analysis for trend detection
        timeBasedStats.push({
          date: new Date(quiz.created_at),
          score: scorePercentage,
          category: category
        })
      })

      // Calculate averages and improvement rates
      Object.keys(categoryStats).forEach(category => {
        const stat = categoryStats[category]
        stat.averageScore = stat.totalScore / stat.totalQuizzes
        stat.averageAccuracy = (stat.totalCorrect / stat.totalQuestions) * 100

        // Calculate improvement rate (recent vs old performance)
        if (stat.trend.length >= 3) {
          const recentScores = stat.trend.slice(0, 3).map(t => t.score)
          const oldScores = stat.trend.slice(-3).map(t => t.score)
          const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
          const oldAvg = oldScores.reduce((a, b) => a + b, 0) / oldScores.length
          stat.improvementRate = recentAvg - oldAvg
        }
      })

      Object.keys(difficultyStats).forEach(difficulty => {
        const stat = difficultyStats[difficulty]
        stat.averageScore = stat.totalScore / stat.totalQuizzes
      })

      // Identify weak areas (below 70% average)
      const weakAreas = Object.entries(categoryStats)
        .filter(([_, stats]) => stats.averageScore < 70)
        .map(([category, stats]) => ({
          category,
          averageScore: stats.averageScore.toFixed(1),
          totalQuizzes: stats.totalQuizzes,
          improvementRate: stats.improvementRate.toFixed(1),
          priority: this.calculatePriority(stats),
          issues: this.identifyIssues(stats)
        }))
        .sort((a, b) => b.priority - a.priority)

      // Identify strengths (above 80% average)
      const strengths = Object.entries(categoryStats)
        .filter(([_, stats]) => stats.averageScore >= 80)
        .map(([category, stats]) => ({
          category,
          averageScore: stats.averageScore.toFixed(1),
          totalQuizzes: stats.totalQuizzes,
          consistency: this.calculateConsistency(stats)
        }))
        .sort((a, b) => b.averageScore - a.averageScore)

      // Calculate overall progress trend
      const recentTrend = this.calculateRecentTrend(timeBasedStats)

      // Generate smart recommendations
      const recommendations = this.generateRecommendations(
        weakAreas, 
        strengths, 
        categoryStats, 
        difficultyStats, 
        recentTrend
      )

      return {
        weakAreas,
        strengths,
        recommendations,
        overallProgress: {
          totalQuizzes: quizHistory.length,
          averageScore: (quizHistory.reduce((sum, quiz) => sum + parseFloat(quiz.score_percentage), 0) / quizHistory.length).toFixed(1),
          recentTrend,
          improvementRate: this.calculateOverallImprovement(timeBasedStats)
        },
        categoryAnalysis: categoryStats,
        difficultyAnalysis: difficultyStats,
        detailedInsights: this.generateDetailedInsights(categoryStats, quizHistory)
      }
    } catch (error) {
      console.error('Error analyzing weakness:', error)
      return { error }
    }
  },

  // Calculate priority score for weak areas
  calculatePriority(stats) {
    const scoreWeight = (70 - stats.averageScore) * 2 // Higher weight for lower scores
    const frequencyWeight = Math.min(stats.totalQuizzes * 5, 25) // More quizzes = higher priority
    const improvementWeight = stats.improvementRate < 0 ? 20 : 0 // Declining performance gets priority
    
    return scoreWeight + frequencyWeight + improvementWeight
  },

  // Identify specific issues with performance
  identifyIssues(stats) {
    const issues = []
    
    if (stats.averageScore < 50) issues.push('Very low accuracy')
    else if (stats.averageScore < 60) issues.push('Below average performance')
    else if (stats.averageScore < 70) issues.push('Needs improvement')
    
    if (stats.improvementRate < -5) issues.push('Declining performance')
    else if (stats.improvementRate < 0) issues.push('Stagnant progress')
    
    if (stats.totalQuizzes < 3) issues.push('Insufficient practice')
    
    const consistency = this.calculateConsistency(stats)
    if (consistency < 0.7) issues.push('Inconsistent performance')
    
    return issues
  },

  // Calculate consistency of performance
  calculateConsistency(stats) {
    if (stats.trend.length < 3) return 1
    
    const scores = stats.trend.map(t => t.score)
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    const standardDeviation = Math.sqrt(variance)
    
    // Lower standard deviation = higher consistency
    return Math.max(0, 1 - (standardDeviation / 100))
  },

  // Calculate recent performance trend
  calculateRecentTrend(timeBasedStats) {
    if (timeBasedStats.length < 5) return 'insufficient-data'
    
    // Sort by date (most recent first)
    const sortedStats = timeBasedStats.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    const recent = sortedStats.slice(0, 5) // Last 5 quizzes
    const earlier = sortedStats.slice(5, 10) // Previous 5 quizzes
    
    if (earlier.length === 0) return 'insufficient-data'
    
    const recentAvg = recent.reduce((sum, stat) => sum + stat.score, 0) / recent.length
    const earlierAvg = earlier.reduce((sum, stat) => sum + stat.score, 0) / earlier.length
    
    const improvement = recentAvg - earlierAvg
    
    if (improvement > 10) return 'improving-fast'
    if (improvement > 5) return 'improving'
    if (improvement > -5) return 'stable'
    if (improvement > -10) return 'declining'
    return 'declining-fast'
  },

  // Calculate overall improvement rate
  calculateOverallImprovement(timeBasedStats) {
    if (timeBasedStats.length < 10) return null
    
    const sortedStats = timeBasedStats.sort((a, b) => new Date(a.date) - new Date(b.date))
    const firstHalf = sortedStats.slice(0, Math.floor(sortedStats.length / 2))
    const secondHalf = sortedStats.slice(Math.floor(sortedStats.length / 2))
    
    const firstAvg = firstHalf.reduce((sum, stat) => sum + stat.score, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, stat) => sum + stat.score, 0) / secondHalf.length
    
    return ((secondAvg - firstAvg) / firstHalf.length * 100).toFixed(1)
  },

  // Generate smart recommendations
  generateRecommendations(weakAreas, strengths, categoryStats, difficultyStats, recentTrend) {
    const recommendations = []

    // Weak area recommendations
    weakAreas.slice(0, 3).forEach(weak => {
      const category = weak.category
      const stats = categoryStats[category]
      
      if (weak.averageScore < 50) {
        recommendations.push({
          type: 'urgent',
          category: category,
          priority: 'high',
          title: `Focus on ${category} Basics`,
          description: `Your ${category} score is ${weak.averageScore}%. Start with Easy difficulty and build fundamentals.`,
          action: `Take 5 Easy ${category} quizzes this week`,
          icon: '🎯',
          estimatedImprovement: '15-20%'
        })
      } else if (weak.averageScore < 65) {
        recommendations.push({
          type: 'improvement',
          category: category,
          priority: 'medium',
          title: `Strengthen ${category} Knowledge`,
          description: `You're close to good performance in ${category}. Focus on consistent practice.`,
          action: `Take 3 Medium ${category} quizzes, review explanations carefully`,
          icon: '📈',
          estimatedImprovement: '10-15%'
        })
      }
    })

    // Practice frequency recommendations
    const totalQuizzes = Object.values(categoryStats).reduce((sum, stat) => sum + stat.totalQuizzes, 0)
    if (totalQuizzes < 20) {
      recommendations.push({
        type: 'practice',
        category: 'general',
        priority: 'medium',
        title: 'Increase Practice Frequency',
        description: 'More practice leads to better retention and performance.',
        action: 'Take at least 1 quiz daily',
        icon: '⏰',
        estimatedImprovement: 'Better retention'
      })
    }

    // Difficulty progression recommendations
    const easyAvg = difficultyStats['Easy']?.averageScore || 0
    const mediumAvg = difficultyStats['Medium']?.averageScore || 0
    const hardAvg = difficultyStats['Hard']?.averageScore || 0

    if (easyAvg > 80 && mediumAvg < 60) {
      recommendations.push({
        type: 'progression',
        category: 'general',
        priority: 'medium',
        title: 'Level Up Your Difficulty',
        description: 'You\'ve mastered Easy questions. Time to challenge yourself with Medium difficulty.',
        action: 'Focus on Medium difficulty quizzes',
        icon: '🚀',
        estimatedImprovement: 'Skill advancement'
      })
    }

    // Trend-based recommendations
    if (recentTrend === 'declining' || recentTrend === 'declining-fast') {
      recommendations.push({
        type: 'recovery',
        category: 'general',
        priority: 'high',
        title: 'Reverse the Decline',
        description: 'Your recent performance has dropped. Let\'s get back on track.',
        action: 'Review your weak areas and take easier quizzes to rebuild confidence',
        icon: '🔄',
        estimatedImprovement: 'Performance recovery'
      })
    }

    // Consistency recommendations
    const inconsistentCategories = Object.entries(categoryStats)
      .filter(([_, stats]) => this.calculateConsistency(stats) < 0.7)
      .map(([category, _]) => category)

    if (inconsistentCategories.length > 0) {
      recommendations.push({
        type: 'consistency',
        category: inconsistentCategories[0],
        priority: 'medium',
        title: 'Improve Consistency',
        description: `Your performance in ${inconsistentCategories[0]} varies significantly.`,
        action: 'Focus on understanding concepts rather than memorizing answers',
        icon: '🎲',
        estimatedImprovement: 'Stable performance'
      })
    }

    // Success reinforcement
    if (strengths.length > 0) {
      const topStrength = strengths[0]
      recommendations.push({
        type: 'maintenance',
        category: topStrength.category,
        priority: 'low',
        title: `Maintain ${topStrength.category} Excellence`,
        description: `Great job! You're scoring ${topStrength.averageScore}% in ${topStrength.category}.`,
        action: 'Take 1 quiz weekly to maintain your edge',
        icon: '🏆',
        estimatedImprovement: 'Skill maintenance'
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  },

  // Generate detailed insights
  generateDetailedInsights(categoryStats, quizHistory) {
    const insights = []

    // Most improved category
    const improvedCategories = Object.entries(categoryStats)
      .filter(([_, stats]) => stats.improvementRate > 5)
      .sort((a, b) => b[1].improvementRate - a[1].improvementRate)

    if (improvedCategories.length > 0) {
      const [category, stats] = improvedCategories[0]
      insights.push({
        type: 'improvement',
        title: 'Most Improved Category',
        description: `Your ${category} performance has improved by ${stats.improvementRate.toFixed(1)}% recently!`,
        icon: '📈',
        positive: true
      })
    }

    // Best streak
    const streakData = this.calculateLongestStreak(quizHistory)
    if (streakData.longest > 3) {
      insights.push({
        type: 'achievement',
        title: 'Great Consistency',
        description: `Your longest practice streak is ${streakData.longest} days. ${streakData.current > 0 ? `Current streak: ${streakData.current} days.` : ''}`,
        icon: '🔥',
        positive: true
      })
    }

    // Time analysis
    const timeInsights = this.analyzeStudyTime(quizHistory)
    if (timeInsights.averageTime > 0) {
      insights.push({
        type: 'time',
        title: 'Study Time Analysis',
        description: `You average ${timeInsights.averageTime} seconds per question. ${timeInsights.suggestion}`,
        icon: '⏱️',
        positive: timeInsights.averageTime <= 45
      })
    }

    return insights
  },

  // Calculate longest practice streak
  calculateLongestStreak(quizHistory) {
    if (quizHistory.length === 0) return { longest: 0, current: 0 }

    const dates = quizHistory
      .map(quiz => new Date(quiz.created_at).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b) - new Date(a))

    let longestStreak = 1
    let currentStreak = 1
    let actualCurrentStreak = 0

    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    // Check if there's activity today or yesterday for current streak
    if (dates[0] === today) {
      actualCurrentStreak = 1
    } else if (dates[0] === yesterday) {
      actualCurrentStreak = 1
    }

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1])
      const currDate = new Date(dates[i])
      const diffTime = prevDate - currDate
      const diffDays = diffTime / (1000 * 60 * 60 * 24)

      if (diffDays === 1) {
        currentStreak++
        if (i === 1 && (dates[0] === today || dates[0] === yesterday)) {
          actualCurrentStreak = currentStreak
        }
      } else {
        longestStreak = Math.max(longestStreak, currentStreak)
        currentStreak = 1
        actualCurrentStreak = 0
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak)

    return { longest: longestStreak, current: actualCurrentStreak }
  },

  // Analyze study time patterns
  analyzeStudyTime(quizHistory) {
    const timeTaken = quizHistory
      .filter(quiz => quiz.time_taken && quiz.time_taken > 0)
      .map(quiz => ({
        timePerQuestion: quiz.time_taken / quiz.total_questions,
        totalQuestions: quiz.total_questions
      }))

    if (timeTaken.length === 0) {
      return { averageTime: 0, suggestion: '' }
    }

    const totalTime = timeTaken.reduce((sum, quiz) => sum + (quiz.timePerQuestion * quiz.totalQuestions), 0)
    const totalQuestions = timeTaken.reduce((sum, quiz) => sum + quiz.totalQuestions, 0)
    const averageTime = Math.round(totalTime / totalQuestions)

    let suggestion = ''
    if (averageTime > 60) {
      suggestion = 'Try to speed up your answers for better exam performance.'
    } else if (averageTime < 20) {
      suggestion = 'You\'re fast! Make sure you\'re reading questions carefully.'
    } else {
      suggestion = 'Good pace! Keep maintaining this speed.'
    }

    return { averageTime, suggestion }
  },

  // Get performance data for charts
  async getPerformanceChartData(userId, days = 30) {
    try {
      const { data: quizHistory, error } = await supabase
        .from('quiz_history')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by date and category
      const chartData = {}
      const categoryTrends = {}

      quizHistory.forEach(quiz => {
        const date = new Date(quiz.created_at).toISOString().split('T')[0]
        const category = quiz.category
        const score = parseFloat(quiz.score_percentage)

        if (!chartData[date]) {
          chartData[date] = {
            date,
            averageScore: 0,
            totalQuizzes: 0,
            totalScore: 0
          }
        }

        chartData[date].totalQuizzes++
        chartData[date].totalScore += score
        chartData[date].averageScore = chartData[date].totalScore / chartData[date].totalQuizzes

        if (!categoryTrends[category]) {
          categoryTrends[category] = []
        }

        categoryTrends[category].push({
          date,
          score,
          quizId: quiz.id
        })
      })

      return {
        overallTrend: Object.values(chartData),
        categoryTrends,
        error: null
      }
    } catch (error) {
      console.error('Error getting chart data:', error)
      return { overallTrend: [], categoryTrends: {}, error }
    }
  }
}