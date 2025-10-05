import { supabase } from '../lib/supabase'

export const studyBuddyService = {
  // Send message to AI study buddy
  async sendMessage(message, conversationContext = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'User not authenticated' }
      }

      // Prepare context for AI
      let contextPrompt = ''
      if (conversationContext) {
        contextPrompt = `\nUser's study context: ${JSON.stringify(conversationContext)}`
      }

      // Use the correct API base URL from environment variables
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${apiBaseUrl}/api/studyBuddy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: user.id,
          context: contextPrompt
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error('Error sending message to study buddy:', error)
      return { error: error.message }
    }
  },

  // Save conversation to database
  async saveConversation(userMessage, aiResponse, context = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('study_conversations')
        .insert([{
          user_id: user.id,
          user_message: userMessage,
          ai_response: aiResponse,
          context: context,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return { data }
    } catch (error) {
      console.error('Error saving conversation:', error)
      return { error: error.message }
    }
  },

  // Get conversation history
  async getConversationHistory(limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('study_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      
      // Reverse to show oldest first
      return { data: data.reverse() }
    } catch (error) {
      console.error('Error fetching conversation history:', error)
      return { error: error.message }
    }
  },

  // Clear conversation history
  async clearHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('study_conversations')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error clearing conversation history:', error)
      return { error: error.message }
    }
  },

  // Get study suggestions based on user's quiz performance
  async getStudySuggestions() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'User not authenticated' }
      }

      // Get recent quiz performance
      const { data: recentQuizzes, error } = await supabase
        .from('quiz_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      if (!recentQuizzes || recentQuizzes.length === 0) {
        return {
          data: [
            "Welcome to your AI Study Buddy! 🤖",
            "Take a few quizzes first, and I'll provide personalized study suggestions!",
            "You can ask me questions like:",
            "• 'Explain this concept to me'",
            "• 'How do I remember important dates?'",
            "• 'What are the best study techniques?'",
            "• 'Help me understand this topic better'"
          ]
        }
      }

      // Analyze performance and provide suggestions
      const averageScore = recentQuizzes.reduce((sum, quiz) => sum + quiz.score_percentage, 0) / recentQuizzes.length
      const categories = [...new Set(recentQuizzes.map(quiz => quiz.category))]
      const weakCategories = recentQuizzes
        .filter(quiz => quiz.score_percentage < 70)
        .map(quiz => quiz.category)

      const suggestions = [
        `Hi! I've analyzed your recent performance (${averageScore.toFixed(1)}% average). Here's what I suggest:`,
      ]

      if (weakCategories.length > 0) {
        suggestions.push(`💡 Focus areas: ${[...new Set(weakCategories)].join(', ')}`)
      }

      if (averageScore >= 80) {
        suggestions.push("🎉 Great job! You're performing well. Try harder difficulty levels!")
      } else if (averageScore >= 60) {
        suggestions.push("📚 You're making progress! Focus on understanding concepts rather than memorizing.")
      } else {
        suggestions.push("💪 Let's work on building your foundation. Start with easier questions and focus on explanations.")
      }

      suggestions.push("Ask me anything about your study topics! I'm here to help! 🚀")

      return { data: suggestions }
    } catch (error) {
      console.error('Error getting study suggestions:', error)
      return { error: error.message }
    }
  },

  // Generate context-aware study tips
  generateStudyContext(quizData = null, bookmarks = null) {
    const context = {
      timestamp: new Date().toISOString(),
      user_type: 'student_preparing_for_govt_exams'
    }

    if (quizData) {
      context.recent_quiz = {
        category: quizData.category,
        score: quizData.score_percentage,
        difficulty: quizData.difficulty,
        weak_areas: quizData.quiz_data?.filter(q => q.user_answer !== q.correct_answer)?.map(q => q.question) || []
      }
    }

    if (bookmarks && bookmarks.length > 0) {
      context.bookmarked_topics = bookmarks.map(b => ({
        category: b.category,
        question: b.question,
        notes: b.notes
      }))
    }

    return context
  },

  // Quick study prompts for common scenarios
  getQuickPrompts() {
    return [
      {
        category: "Understanding",
        prompts: [
          "Explain this concept in simple terms",
          "Why is this the correct answer?",
          "Help me understand the logic behind this",
          "What's the key point I should remember?"
        ]
      },
      {
        category: "Memory Techniques",
        prompts: [
          "How can I remember this information?",
          "Give me a mnemonic for this topic",
          "What's a good way to memorize dates/facts?",
          "Create a story to help me remember this"
        ]
      },
      {
        category: "Study Strategy",
        prompts: [
          "How should I prepare for this topic?",
          "What are the most important points to focus on?",
          "How can I improve my performance in this category?",
          "What study schedule do you recommend?"
        ]
      },
      {
        category: "Exam Prep",
        prompts: [
          "What are common mistakes in this topic?",
          "How is this topic typically tested in exams?",
          "What are the key facts I must know?",
          "Give me practice scenarios for this concept"
        ]
      }
    ]
  }
}