import { useState, useEffect } from 'react'
import { analyticsService } from '../services/analyticsService'

const WeaknessAnalysis = ({ user }) => {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeInsightTab, setActiveInsightTab] = useState('recommendations')

  useEffect(() => {
    if (user) {
      loadAnalysis()
    }
  }, [user])

  const loadAnalysis = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔍 Loading analysis for user:', user.id)
      const result = await analyticsService.analyzeWeakness(user.id)
      console.log('📊 Analysis result:', result)
      
      if (result.error) {
        console.error('❌ Analysis error:', result.error)
        throw result.error
      }
      
      console.log('✅ Analysis successful, setting data...')
      setAnalysis(result)
    } catch (err) {
      console.error('Error loading weakness analysis:', err)
      setError('Failed to analyze your performance. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'urgent': return '🚨'
      case 'improvement': return '📈'
      case 'practice': return '⏰'
      case 'progression': return '🚀'
      case 'recovery': return '🔄'
      case 'consistency': return '🎯'
      case 'maintenance': return '🏆'
      default: return '💡'
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving-fast': return '🚀'
      case 'improving': return '📈'
      case 'stable': return '➡️'
      case 'declining': return '📉'
      case 'declining-fast': return '⚠️'
      default: return '❓'
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving-fast': return 'text-green-400'
      case 'improving': return 'text-green-300'
      case 'stable': return 'text-blue-400'
      case 'declining': return 'text-orange-400'
      case 'declining-fast': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getTrendMessage = (trend) => {
    switch (trend) {
      case 'improving-fast': return 'Excellent progress! You\'re improving rapidly.'
      case 'improving': return 'Good progress! Keep up the consistent practice.'
      case 'stable': return 'Steady performance. Consider challenging yourself more.'
      case 'declining': return 'Performance is declining. Focus on weak areas.'
      case 'declining-fast': return 'Significant decline detected. Time for intensive practice.'
      case 'insufficient-data': return 'Take more quizzes to see your progress trend.'
      default: return 'Keep practicing to establish your performance trend.'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-300">Analyzing your performance...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">Analysis Error</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadAnalysis}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!analysis || (!analysis.weakAreas?.length && !analysis.recommendations?.length)) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">Not Enough Data</h3>
        <p className="text-gray-400 mb-4">Take a few more quizzes to get personalized insights and recommendations.</p>
        <div className="text-sm text-gray-500">
          We need at least 3-5 quizzes to provide meaningful analysis.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress Summary */}
      {analysis.overallProgress && (
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span>📊</span>
            Performance Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {analysis.overallProgress.totalQuizzes}
              </div>
              <div className="text-sm text-gray-400">Total Quizzes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {analysis.overallProgress.averageScore}%
              </div>
              <div className="text-sm text-gray-400">Average Score</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getTrendColor(analysis.overallProgress.recentTrend)}`}>
                {getTrendIcon(analysis.overallProgress.recentTrend)}
              </div>
              <div className="text-sm text-gray-400">Trend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {analysis.overallProgress.improvementRate ? `+${analysis.overallProgress.improvementRate}%` : 'N/A'}
              </div>
              <div className="text-sm text-gray-400">Improvement</div>
            </div>
          </div>

          <div className={`text-sm p-3 rounded-lg border ${getTrendColor(analysis.overallProgress.recentTrend)} bg-white/5`}>
            {getTrendMessage(analysis.overallProgress.recentTrend)}
          </div>
        </div>
      )}

      {/* Insight Tabs */}
      <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
        <div className="flex border-b border-white/10">
          {[
            { id: 'recommendations', label: 'Smart Recommendations', icon: '💡', count: analysis.recommendations?.length || 0 },
            { id: 'weaknesses', label: 'Areas to Improve', icon: '🎯', count: analysis.weakAreas?.length || 0 },
            { id: 'strengths', label: 'Your Strengths', icon: '🏆', count: analysis.strengths?.length || 0 },
            { id: 'insights', label: 'Detailed Insights', icon: '🔍', count: analysis.detailedInsights?.length || 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveInsightTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeInsightTab === tab.id
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count > 0 && (
                  <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
              </div>
              {activeInsightTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"></div>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Recommendations Tab */}
          {activeInsightTab === 'recommendations' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Personalized Study Recommendations</h4>
              {analysis.recommendations?.length > 0 ? (
                <div className="space-y-4">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getTypeIcon(rec.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-semibold text-white">{rec.title}</h5>
                            <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(rec.priority)}`}>
                              {rec.priority}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{rec.description}</p>
                          <div className="bg-white/5 border border-white/10 rounded p-3 mb-2">
                            <div className="text-sm font-medium text-purple-300 mb-1">Action Plan:</div>
                            <div className="text-sm text-gray-300">{rec.action}</div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>Category: {rec.category}</span>
                            <span>Expected: {rec.estimatedImprovement}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="text-gray-300">Great job! No urgent recommendations at the moment.</p>
                  <p className="text-gray-400 text-sm">Keep practicing to maintain your performance.</p>
                </div>
              )}
            </div>
          )}

          {/* Weaknesses Tab */}
          {activeInsightTab === 'weaknesses' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Areas That Need Attention</h4>
              {analysis.weakAreas?.length > 0 ? (
                <div className="space-y-4">
                  {analysis.weakAreas.map((weak, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-white">{weak.category}</h5>
                        <div className="flex items-center gap-2">
                          <span className="text-red-400 font-bold">{weak.averageScore}%</span>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(weak.priority > 50 ? 'high' : weak.priority > 25 ? 'medium' : 'low')}`}>
                            {weak.priority > 50 ? 'High Priority' : weak.priority > 25 ? 'Medium Priority' : 'Low Priority'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-400">Quizzes Taken:</span>
                          <span className="text-white ml-2">{weak.totalQuizzes}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Trend:</span>
                          <span className={`ml-2 ${parseFloat(weak.improvementRate) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {parseFloat(weak.improvementRate) >= 0 ? '+' : ''}{weak.improvementRate}%
                          </span>
                        </div>
                      </div>

                      {weak.issues?.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-300 mb-2">Identified Issues:</div>
                          <div className="flex flex-wrap gap-2">
                            {weak.issues.map((issue, issueIndex) => (
                              <span key={issueIndex} className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded border border-red-500/30">
                                {issue}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">💪</div>
                  <p className="text-gray-300">Excellent! No weak areas detected.</p>
                  <p className="text-gray-400 text-sm">All your categories are performing well.</p>
                </div>
              )}
            </div>
          )}

          {/* Strengths Tab */}
          {activeInsightTab === 'strengths' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Your Strong Categories</h4>
              {analysis.strengths?.length > 0 ? (
                <div className="space-y-4">
                  {analysis.strengths.map((strength, index) => (
                    <div key={index} className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-white flex items-center gap-2">
                          <span>🏆</span>
                          {strength.category}
                        </h5>
                        <span className="text-green-400 font-bold text-lg">{strength.averageScore}%</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Quizzes Taken:</span>
                          <span className="text-white ml-2">{strength.totalQuizzes}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Consistency:</span>
                          <span className="text-green-400 ml-2">
                            {(strength.consistency * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🎯</div>
                  <p className="text-gray-300">Keep practicing to identify your strengths!</p>
                  <p className="text-gray-400 text-sm">Take more quizzes to see which categories you excel in.</p>
                </div>
              )}
            </div>
          )}

          {/* Detailed Insights Tab */}
          {activeInsightTab === 'insights' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Detailed Performance Insights</h4>
              {analysis.detailedInsights?.length > 0 ? (
                <div className="space-y-4">
                  {analysis.detailedInsights.map((insight, index) => (
                    <div key={index} className={`rounded-lg p-4 border ${insight.positive ? 'bg-green-500/10 border-green-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{insight.icon}</div>
                        <div>
                          <h5 className="font-semibold text-white mb-1">{insight.title}</h5>
                          <p className="text-gray-300 text-sm">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-300">Take more quizzes to unlock detailed insights!</p>
                  <p className="text-gray-400 text-sm">We'll analyze patterns in your performance and study habits.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={loadAnalysis}
          className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
        >
          <span>🔄</span>
          Refresh Analysis
        </button>
        <p className="text-xs text-gray-400 mt-2">
          Analysis updates automatically after each quiz
        </p>
      </div>
    </div>
  )
}

export default WeaknessAnalysis