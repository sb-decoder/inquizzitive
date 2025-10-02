import { supabase } from '../lib/supabase'

export const quizService = {
  // Save quiz result to database
  async saveQuizResult(quizData) {
    try {
      const { data, error } = await supabase
        .from('quiz_history')
        .insert([
          {
            category: quizData.category,
            difficulty: quizData.difficulty,
            total_questions: quizData.totalQuestions,
            correct_answers: quizData.correctAnswers,
            score_percentage: quizData.scorePercentage,
            time_taken: quizData.timeTaken,
            quiz_data: {
              questions: quizData.questions,
              userAnswers: quizData.userAnswers,
              timestamp: new Date().toISOString()
            }
          }
        ])
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error saving quiz result:', error)
      return { data: null, error }
    }
  },

  // Get user's quiz history
  async getQuizHistory(limit = 10, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('quiz_history')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching quiz history:', error)
      return { data: null, error }
    }
  },

  // Get quiz statistics
  async getQuizStats() {
    try {
      const { data, error } = await supabase
        .from('quiz_history')
        .select('category, difficulty, score_percentage, total_questions, correct_answers, created_at')

      if (error) throw error

      // Calculate statistics
      const stats = {
        totalQuizzes: data.length,
        averageScore: data.length > 0 ? (data.reduce((sum, quiz) => sum + parseFloat(quiz.score_percentage), 0) / data.length).toFixed(1) : 0,
        totalQuestions: data.reduce((sum, quiz) => sum + quiz.total_questions, 0),
        totalCorrect: data.reduce((sum, quiz) => sum + quiz.correct_answers, 0),
        categoryStats: {},
        difficultyStats: {},
        recentActivity: data.slice(0, 5)
      }

      // Group by category
      data.forEach(quiz => {
        if (!stats.categoryStats[quiz.category]) {
          stats.categoryStats[quiz.category] = {
            count: 0,
            totalScore: 0,
            averageScore: 0
          }
        }
        stats.categoryStats[quiz.category].count++
        stats.categoryStats[quiz.category].totalScore += parseFloat(quiz.score_percentage)
      })

      // Calculate average scores for categories
      Object.keys(stats.categoryStats).forEach(category => {
        const categoryData = stats.categoryStats[category]
        categoryData.averageScore = (categoryData.totalScore / categoryData.count).toFixed(1)
      })

      // Group by difficulty
      data.forEach(quiz => {
        if (!stats.difficultyStats[quiz.difficulty]) {
          stats.difficultyStats[quiz.difficulty] = {
            count: 0,
            totalScore: 0,
            averageScore: 0
          }
        }
        stats.difficultyStats[quiz.difficulty].count++
        stats.difficultyStats[quiz.difficulty].totalScore += parseFloat(quiz.score_percentage)
      })

      // Calculate average scores for difficulties
      Object.keys(stats.difficultyStats).forEach(difficulty => {
        const difficultyData = stats.difficultyStats[difficulty]
        difficultyData.averageScore = (difficultyData.totalScore / difficultyData.count).toFixed(1)
      })

      return { data: stats, error: null }
    } catch (error) {
      console.error('Error fetching quiz stats:', error)
      return { data: null, error }
    }
  },

  // Get quiz history by category
  async getQuizHistoryByCategory(category, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('quiz_history')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching quiz history by category:', error)
      return { data: null, error }
    }
  },

  // Delete a quiz result
  async deleteQuizResult(quizId) {
    try {
      const { error } = await supabase
        .from('quiz_history')
        .delete()
        .eq('id', quizId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error deleting quiz result:', error)
      return { error }
    }
  }
}
