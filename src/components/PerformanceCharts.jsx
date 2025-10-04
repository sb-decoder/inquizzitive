import { useState, useEffect } from 'react'
import { analyticsService } from '../services/analyticsService'
import GlassmorphicDropdown from './GlassmorphicDropdown'

const PERIOD_OPTIONS = [
  { value: 7, label: 'Last 7 days' },
  { value: 14, label: 'Last 2 weeks' },
  { value: 30, label: 'Last 30 days' },
  { value: 60, label: 'Last 2 months' },
  { value: 90, label: 'Last 3 months' },
]
const PERIOD_LABELS = PERIOD_OPTIONS.map(opt => opt.label)
const getPeriodValue = (label) => PERIOD_OPTIONS.find(opt => opt.label === label)?.value

const CHART_OPTIONS = [
  { value: 'overall', label: 'Overall Performance' },
  { value: 'category', label: 'Category Trends' },
  { value: 'both', label: 'Both Views' },
]
const CHART_LABELS = CHART_OPTIONS.map(opt => opt.label)
const getChartValue = (label) => CHART_OPTIONS.find(opt => opt.label === label)?.value
const getChartLabel = (value) => CHART_OPTIONS.find(opt => opt.value === value)?.label

const PerformanceCharts = ({ user }) => {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  const [selectedChart, setSelectedChart] = useState('overall')

  useEffect(() => {
    if (user) {
      loadChartData()
    }
  }, [user, selectedPeriod])

  const loadChartData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await analyticsService.getPerformanceChartData(user.id, selectedPeriod)
      if (result.error) throw result.error
      setChartData(result)
    } catch (err) {
      console.error('Error loading chart data:', err)
      setError('Failed to load performance charts.')
    } finally {
      setLoading(false)
    }
  }

  // Simple SVG-based chart component
  const LineChart = ({ data, title, color = '#8B5CF6', yKey = 'averageScore' }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-400">No data available</p>
          </div>
        </div>
      )
    }

    const maxValue = Math.max(...data.map(d => d[yKey] || 0))
    const minValue = Math.min(...data.map(d => d[yKey] || 0))
    const range = maxValue - minValue || 1
    
    const width = 400
    const height = 200
    const padding = 40

    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding)
      const y = height - padding - ((d[yKey] - minValue) / range) * (height - 2 * padding)
      return `${x},${y}`
    }).join(' ')

    return (
      <div className="bg-white/5 rounded-lg border border-white/10 p-4">
        <h4 className="text-lg font-semibold text-white mb-4">{title}</h4>
        <div className="relative">
          <svg width="100%" height="200" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(value => {
              const y = height - padding - ((value - minValue) / range) * (height - 2 * padding)
              return (
                <g key={value}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                  />
                  <text
                    x={padding - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="rgba(255,255,255,0.5)"
                    fontSize="12"
                  >
                    {value}%
                  </text>
                </g>
              )
            })}
            
            {/* Chart line */}
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {data.map((d, i) => {
              const x = padding + (i / (data.length - 1)) * (width - 2 * padding)
              const y = height - padding - ((d[yKey] - minValue) / range) * (height - 2 * padding)
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={color}
                  className="hover:r-6 transition-all cursor-pointer"
                >
                  <title>{`${d.date}: ${d[yKey]}%`}</title>
                </circle>
              )
            })}
          </svg>
          
          {/* Latest value indicator */}
          {data.length > 0 && (
            <div className="absolute top-4 right-4 bg-white/10 rounded-lg p-2 border border-white/20">
              <div className="text-sm text-gray-400">Latest</div>
              <div className="text-lg font-bold" style={{ color }}>
                {data[data.length - 1][yKey]}%
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Category comparison chart
  const CategoryChart = ({ categoryTrends }) => {
    const categories = Object.keys(categoryTrends)
    if (categories.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-400">No category data available</p>
          </div>
        </div>
      )
    }

    const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1']

    return (
      <div className="bg-white/5 rounded-lg border border-white/10 p-4">
        <h4 className="text-lg font-semibold text-white mb-4">Category Performance Trends</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.slice(0, 6).map((category, index) => {
            const data = categoryTrends[category]
            const latestScore = data[data.length - 1]?.score || 0
            const trend = data.length > 1 ? 
              (data[data.length - 1]?.score || 0) - (data[0]?.score || 0) : 0
            
            return (
              <div key={category} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-white text-sm">{category}</h5>
                  <div className="flex items-center gap-1 text-xs">
                    <span className={trend >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {trend >= 0 ? '↗' : '↘'}
                    </span>
                    <span className="text-gray-400">
                      {Math.abs(trend).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: colors[index % colors.length] + '20', border: `2px solid ${colors[index % colors.length]}` }}
                  >
                    {latestScore.toFixed(0)}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Quizzes</div>
                    <div className="text-sm text-white">{data.length}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Progress overview with key metrics
  const ProgressOverview = ({ overallTrend }) => {
    if (!overallTrend || overallTrend.length === 0) return null

    const totalQuizzes = overallTrend.reduce((sum, day) => sum + day.totalQuizzes, 0)
    const averageScore = overallTrend.reduce((sum, day) => sum + day.averageScore, 0) / overallTrend.length
    const latestScore = overallTrend[overallTrend.length - 1]?.averageScore || 0
    const firstScore = overallTrend[0]?.averageScore || 0
    const improvement = latestScore - firstScore

    return (
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30 p-6">
        <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span>📈</span>
          {selectedPeriod}-Day Progress Summary
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{totalQuizzes}</div>
            <div className="text-sm text-gray-400">Total Quizzes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{averageScore.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Average Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{latestScore.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Latest Score</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Improvement</div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-300">Loading performance charts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">Chart Error</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadChartData}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Time Period:</label>
          <GlassmorphicDropdown
            options={PERIOD_LABELS}
            defaultOption={getPeriodLabel(selectedPeriod)}
            onSelect={(label) => setSelectedPeriod(getPeriodValue(label))}
            className="w-40"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Chart Type:</label>
          <GlassmorphicDropdown
            options={CHART_LABELS}
            defaultOption={getChartLabel(selectedChart)}
            onSelect={(label) => setSelectedChart(getChartValue(label))}
            className="w-48"
          />
        </div>
      </div>

      {/* Progress Overview */}
      {chartData?.overallTrend && (
        <ProgressOverview overallTrend={chartData.overallTrend} />
      )}

      {/* Charts */}
      {(selectedChart === 'overall' || selectedChart === 'both') && chartData?.overallTrend && (
        <LineChart
          data={chartData.overallTrend}
          title="Overall Performance Trend"
          color="#8B5CF6"
          yKey="averageScore"
        />
      )}

      {(selectedChart === 'category' || selectedChart === 'both') && chartData?.categoryTrends && (
        <CategoryChart categoryTrends={chartData.categoryTrends} />
      )}

      {/* No Data State */}
      {(!chartData?.overallTrend || chartData.overallTrend.length === 0) && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Chart Data</h3>
          <p className="text-gray-400 mb-4">
            Take more quizzes in the selected time period to see your performance trends.
          </p>
          <p className="text-sm text-gray-500">
            Charts will appear after you complete at least 3 quizzes.
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h5 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
          <span>💡</span>
          Chart Reading Tips
        </h5>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Hover over chart points to see exact values</li>
          <li>• Look for upward trends to see improvement</li>
          <li>• Consistent performance is as important as high scores</li>
          <li>• Use different time periods to see long-term progress</li>
        </ul>
      </div>
    </div>
  )
}

export default PerformanceCharts
