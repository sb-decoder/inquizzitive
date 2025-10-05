import { useState, useEffect } from 'react'
import { bookmarkService } from '../services/bookmarkService'
import GlassmorphicDropdown from './GlassmorphicDropdown'

const BookmarkedQuestions = ({ user }) => {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingNotes, setEditingNotes] = useState(null)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    if (user) {
      loadBookmarks()
      loadBookmarkStats()
    }
  }, [user])

  useEffect(() => {
    if (user) {
      filterBookmarks()
    }
  }, [selectedCategory, searchTerm])

  const loadBookmarks = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await bookmarkService.getUserBookmarks(100) // Load up to 100 bookmarks
      if (result.error) throw new Error(result.error)
      setBookmarks(result.data || [])
    } catch (err) {
      console.error('Error loading bookmarks:', err)
      setError('Failed to load bookmarked questions.')
    } finally {
      setLoading(false)
    }
  }

  const loadBookmarkStats = async () => {
    try {
      const result = await bookmarkService.getBookmarkStats()
      if (result.error) throw new Error(result.error)
      setStats(result.data)
    } catch (err) {
      console.error('Error loading bookmark stats:', err)
    }
  }

  const filterBookmarks = async () => {
    if (!user) return

    setLoading(true)
    try {
      let result
      
      if (searchTerm.trim()) {
        // Search bookmarks
        result = await bookmarkService.searchBookmarks(searchTerm, 50)
      } else if (selectedCategory !== 'All Categories') {
        // Filter by category
        result = await bookmarkService.getBookmarksByCategory(selectedCategory, 50)
      } else {
        // Load all bookmarks
        result = await bookmarkService.getUserBookmarks(100)
      }

      if (result.error) throw new Error(result.error)
      setBookmarks(result.data || [])
    } catch (err) {
      console.error('Error filtering bookmarks:', err)
      setError('Failed to filter bookmarks.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      const result = await bookmarkService.removeBookmark(bookmarkId)
      if (result.error) throw new Error(result.error)
      
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId))
      loadBookmarkStats() // Refresh stats
    } catch (err) {
      console.error('Error removing bookmark:', err)
      alert('Failed to remove bookmark. Please try again.')
    }
  }

  const handleUpdateNotes = async (bookmarkId) => {
    try {
      const result = await bookmarkService.updateBookmarkNotes(bookmarkId, noteText)
      if (result.error) throw new Error(result.error)
      
      setBookmarks(prev => 
        prev.map(bookmark => 
          bookmark.id === bookmarkId 
            ? { ...bookmark, notes: noteText }
            : bookmark
        )
      )
      setEditingNotes(null)
      setNoteText('')
    } catch (err) {
      console.error('Error updating notes:', err)
      alert('Failed to update notes. Please try again.')
    }
  }

  const startEditingNotes = (bookmark) => {
    setEditingNotes(bookmark.id)
    setNoteText(bookmark.notes || '')
  }

  const cancelEditingNotes = () => {
    setEditingNotes(null)
    setNoteText('')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'hard': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getCategoryOptions = () => {
    if (!stats?.categoryCounts) return ['All Categories']
    return ['All Categories', ...Object.keys(stats.categoryCounts)]
  }

  if (loading && bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-300">Loading your bookmarked questions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">Error Loading Bookmarks</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadBookmarks}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30 p-6">
          <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span>🔖</span>
            Bookmark Statistics
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.totalBookmarks}</div>
              <div className="text-sm text-gray-400">Total Bookmarks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{stats.recentBookmarks}</div>
              <div className="text-sm text-gray-400">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {Object.keys(stats.categoryCounts).length}
              </div>
              <div className="text-sm text-gray-400">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {Object.entries(stats.categoryCounts).reduce((max, [cat, count]) => 
                  count > max.count ? { category: cat, count } : max, 
                  { category: 'None', count: 0 }
                ).category}
              </div>
              <div className="text-sm text-gray-400">Top Category</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Category:</label>
          <GlassmorphicDropdown
            options={getCategoryOptions()}
            defaultOption={selectedCategory}
            onSelect={setSelectedCategory}
            className="w-48"
          />
        </div>
        
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <label className="text-sm text-gray-400">Search:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions, explanations, or notes..."
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
      </div>

      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📌</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            {searchTerm || selectedCategory !== 'All Categories' 
              ? 'No matching bookmarks found' 
              : 'No Bookmarked Questions'
            }
          </h3>
          <p className="text-gray-400">
            {searchTerm || selectedCategory !== 'All Categories'
              ? 'Try adjusting your filters or search terms.'
              : 'Start bookmarking interesting questions during quizzes to see them here!'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="bg-white/5 rounded-lg p-6 border border-white/10 hover:border-white/20 transition-colors">
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                      {bookmark.category}
                    </span>
                    <span className={`text-xs font-medium ${getDifficultyColor(bookmark.difficulty)}`}>
                      {bookmark.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(bookmark.created_at)}
                    </span>
                  </div>
                  <h4 className="text-white font-semibold mb-2">{bookmark.question}</h4>
                </div>
                <button
                  onClick={() => handleRemoveBookmark(bookmark.id)}
                  className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                  title="Remove bookmark"
                >
                  🗑️
                </button>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {bookmark.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      option === bookmark.correct_answer
                        ? 'bg-green-500/20 border-green-500/40 text-green-300'
                        : 'bg-white/5 border-white/10 text-gray-300'
                    }`}
                  >
                    <span className="font-medium mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                    {option === bookmark.correct_answer && (
                      <span className="ml-2 text-green-400">✓</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Explanation */}
              {bookmark.explanation && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                  <h5 className="text-blue-300 font-medium mb-1">Explanation:</h5>
                  <p className="text-gray-300 text-sm">{bookmark.explanation}</p>
                </div>
              )}

              {/* Notes Section */}
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-gray-300 font-medium">Personal Notes:</h5>
                  {editingNotes !== bookmark.id && (
                    <button
                      onClick={() => startEditingNotes(bookmark)}
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                      {bookmark.notes ? 'Edit' : 'Add Note'}
                    </button>
                  )}
                </div>
                
                {editingNotes === bookmark.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add your personal notes about this question..."
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateNotes(bookmark.id)}
                        className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditingNotes}
                        className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm italic">
                    {bookmark.notes || 'No notes added yet.'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h5 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
          <span>💡</span>
          Bookmark Tips
        </h5>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Bookmark challenging questions during quizzes for later review</li>
          <li>• Add personal notes to remember why a question was tricky</li>
          <li>• Use the search feature to quickly find specific topics</li>
          <li>• Review bookmarked questions before important exams</li>
        </ul>
      </div>
    </div>
  )
}

export default BookmarkedQuestions