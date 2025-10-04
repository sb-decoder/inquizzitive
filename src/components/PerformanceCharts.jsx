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
      
      if (result?.error) {
        throw new Error(result.error)
      }
      
      setChartData(result)
    } catch (err) {
      console.error('Error loading chart data:', err)
      setError('Failed to load performance charts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const LineChart = ({ data, title, color = '#8B5CF6', yKey = 'averageScore' }) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="text-center text-gray-400 p-8">
          <p>📊 No data available for {title}</p>
          <p className="text-sm mt-2">Complete more quizzes to see trends</p>
        </div>
      )
    }

    try {
      const validData = data.filter(item => 
        item && 
        typeof item[yKey] === 'number' && 
        !isNaN(item[yKey]) && 
        isFinite(item[yKey])
      )

      if (validData.length === 0) {
        return (
          <div className="text-center text-gray-400 p-8">
            <p>⚠️ Invalid data for {title}</p>
            <p className="text-sm mt-2">Data validation failed</p>
          </div>
        )
      }

      const values = validData.map(item => item[yKey])
      const minValue = Math.min(...values)
      const maxValue = Math.max(...values)
      
      const range = maxValue - minValue || 1
      const padding = Math.max(range * 0.1, 5)
      const chartMin = Math.max(0, minValue - padding)
      const chartMax = maxValue + padding

      const width = 800
      const height = 300
      const chartHeight = height - 60
      const chartWidth = width - 80

      const getX = (index) => {
        if (validData.length <= 1) return chartWidth / 2
        return (index / (validData.length - 1)) * chartWidth + 40
      }

      const getY = (value) => {
        if (chartMax === chartMin) return chartHeight / 2 + 30
        const normalizedValue = (value - chartMin) / (chartMax - chartMin)
        return chartHeight - (normalizedValue * chartHeight) + 30
      }

      const pathData = validData.map((item, index) => {
        const x = getX(index)
        const y = getY(item[yKey])
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      }).join(' ')

      return (
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
          <div className="w-full overflow-x-auto">
            <svg width={width} height={height} className="w-full h-auto">
              <defs>
                <pattern id={`grid-${title.replace(/\s+/g, '-')}`} width="40" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width={chartWidth} height={chartHeight} x="40" y="30" 
                    fill={`url(#grid-${title.replace(/\s+/g, '-')})`} />
              
              {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                const value = chartMin + (chartMax - chartMin) * ratio
                const y = chartHeight - (ratio * chartHeight) + 30
                return (
                  <g key={ratio}>
                    <line x1="35" y1={y} x2="40" y2={y} stroke="rgba(255,255,255,0.3)" />
                    <text x="30" y={y + 4} textAnchor="end" fontSize="12" fill="rgba(255,255,255,0.6)">
                      {Math.round(value)}
                    </text>
                  </g>
                )
              })}

              {pathData && (
                <path
                  d={pathData}
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {validData.map((item, index) => {
                const x = getX(index)
                const y = getY(item[yKey])
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill={color}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill="transparent"
                      className="hover:fill-white/10 cursor-pointer"
                      title={`Date: ${item.date}\nScore: ${Math.round(item[yKey])}%`}
                    />
                  </g>
                )
              })}

              {validData.map((item, index) => {
                if (index % Math.max(1, Math.floor(validData.length / 5)) === 0) {
                  const x = getX(index)
                  const date = new Date(item.date)
                  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  
                  return (
                    <text
                      key={index}
                      x={x}
                      y={height - 10}
                      textAnchor="middle"
                      fontSize="11"
                      fill="rgba(255,255,255,0.6)"
                    >
                      {label}
                    </text>
                  )
                }
                return null
              })}
            </svg>
          </div>
        </div>
      )
    } catch (svgError) {
      console.error('SVG Rendering Error:', svgError)
      return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <p className="text-red-400">❌ Chart rendering failed</p>
          <p className="text-sm text-red-300 mt-2">{svgError.message}</p>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        <p className="mt-4 text-gray-400">Loading performance charts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md mx-auto">
          <p className="text-red-400">❌ {error}</p>
          <button 
            onClick={loadChartData}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!chartData || (chartData.overall?.length === 0 && Object.keys(chartData.categoryTrends || {}).length === 0)) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 max-w-md mx-auto">
          <p className="text-yellow-400">📈 Take more quizzes in the selected time period to see your performance trends.</p>
          <p className="text-sm text-yellow-300 mt-2">Charts will appear after you complete at least 3 quizzes.</p>
        </div>
      </div>
    )
  }

  const categoryTrends = chartData.categoryTrends || {}
  const hasOverallData = chartData.overall && chartData.overall.length > 0
  const hasCategoryData = Object.keys(categoryTrends).length > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-2">Time Period</label>
          <GlassmorphicDropdown
            options={PERIOD_LABELS}
            defaultOption={PERIOD_LABELS[2]}
            onSelect={(selected) => {
              const value = getPeriodValue(selected)
              if (value !== selectedPeriod) {
                setSelectedPeriod(value)
              }
            }}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-2">Chart Type</label>
          <GlassmorphicDropdown
            options={CHART_LABELS}
            defaultOption={CHART_LABELS[0]}
            onSelect={(selected) => {
              const value = getChartValue(selected)
              if (value !== selectedChart) {
                setSelectedChart(value)
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {(selectedChart === 'overall' || selectedChart === 'both') && hasOverallData && (
          <LineChart
            data={chartData.overall}
            title="Overall Performance Trend"
            color="#8B5CF6"
            yKey="averageScore"
          />
        )}

        {(selectedChart === 'category' || selectedChart === 'both') && hasCategoryData && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Category Performance</h3>
            {Object.entries(categoryTrends).map(([category, data], index) => (
              <LineChart
                key={category}
                data={data}
                title={`${category} Performance`}
                color={['#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#8B5CF6'][index % 5]}
                yKey="averageScore"
              />
            ))}
          </div>
        )}

        {!hasOverallData && !hasCategoryData && (
          <div className="text-center py-12">
            <p className="text-gray-400">📊 No chart data available for the selected period</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PerformanceCharts
