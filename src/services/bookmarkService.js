import { supabase } from '../lib/supabase'

export const bookmarkService = {
  // Save a question as bookmark
  async saveBookmark(questionData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'User not authenticated' }
      }

      const bookmarkData = {
        user_id: user.id,
        question: questionData.question,
        options: questionData.options,
        correct_answer: questionData.answer,
        explanation: questionData.explanation || '',
        category: questionData.category || 'General',
        difficulty: questionData.difficulty || 'Medium',
        notes: questionData.notes || ''
      }

      const { data, error } = await supabase
        .from('bookmarked_questions')
        .insert([bookmarkData])
        .select()
        .single()

      if (error) {
        // Handle unique constraint violation (question already bookmarked)
        if (error.code === '23505') {
          return { error: 'Question already bookmarked' }
        }
        throw error
      }

      return { data }
    } catch (error) {
      console.error('Error saving bookmark:', error)
      return { error: error.message }
    }
  },

  // Remove bookmark
  async removeBookmark(bookmarkId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('bookmarked_questions')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', user.id)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error removing bookmark:', error)
      return { error: error.message }
    }
  },

  // Remove bookmark by question content (for quiz interface)
  async removeBookmarkByQuestion(question, correctAnswer) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('bookmarked_questions')
        .delete()
        .eq('user_id', user.id)
        .eq('question', question)
        .eq('correct_answer', correctAnswer)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error removing bookmark by question:', error)
      return { error: error.message }
    }
  },

  // Check if question is bookmarked
  async isBookmarked(question, correctAnswer) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { isBookmarked: false }
      }

      const { data, error } = await supabase
        .from('bookmarked_questions')
        .select('id')
        .eq('user_id', user.id)
        .eq('question', question)
        .eq('correct_answer', correctAnswer)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return { isBookmarked: !!data, bookmarkId: data?.id }
    } catch (error) {
      console.error('Error checking bookmark status:', error)
      return { isBookmarked: false, error: error.message }
    }
  },

  // Get all user's bookmarks
  async getUserBookmarks(limit = 50, offset = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'User not authenticated' }
      }

      const { data, error, count } = await supabase
        .from('bookmarked_questions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return { data, count }
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
      return { error: error.message }
    }
  },

  // Get bookmarks by category
  async getBookmarksByCategory(category, limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('bookmarked_questions')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return { data }
    } catch (error) {
      console.error('Error fetching bookmarks by category:', error)
      return { error: error.message }
    }
  },

  // Update bookmark notes
  async updateBookmarkNotes(bookmarkId, notes) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('bookmarked_questions')
        .update({ notes })
        .eq('id', bookmarkId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return { data }
    } catch (error) {
      console.error('Error updating bookmark notes:', error)
      return { error: error.message }
    }
  },

  // Get bookmark statistics
  async getBookmarkStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'User not authenticated' }
      }

      // Get total count and category breakdown
      const { data, error } = await supabase
        .from('bookmarked_questions')
        .select('category, difficulty, created_at')
        .eq('user_id', user.id)

      if (error) throw error

      const stats = {
        totalBookmarks: data.length,
        categoryCounts: {},
        difficultyCounts: {},
        recentBookmarks: 0 // bookmarks added in last 7 days
      }

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      data.forEach(bookmark => {
        // Category counts
        stats.categoryCounts[bookmark.category] = (stats.categoryCounts[bookmark.category] || 0) + 1
        
        // Difficulty counts
        stats.difficultyCounts[bookmark.difficulty] = (stats.difficultyCounts[bookmark.difficulty] || 0) + 1
        
        // Recent bookmarks
        if (new Date(bookmark.created_at) > oneWeekAgo) {
          stats.recentBookmarks++
        }
      })

      return { data: stats }
    } catch (error) {
      console.error('Error fetching bookmark stats:', error)
      return { error: error.message }
    }
  },

  // Search bookmarks
  async searchBookmarks(searchTerm, limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('bookmarked_questions')
        .select('*')
        .eq('user_id', user.id)
        .or(`question.ilike.%${searchTerm}%, explanation.ilike.%${searchTerm}%, notes.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return { data }
    } catch (error) {
      console.error('Error searching bookmarks:', error)
      return { error: error.message }
    }
  }
}