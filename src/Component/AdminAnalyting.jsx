import { useEffect, useMemo, useRef, useState } from 'react'
import { getUserDocuments, getLastLoginRegister } from '../Services/AdminDashboard'
import { RefreshCcw, TrendingUp, ChevronDown } from 'lucide-react'
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const TIME_FILTERS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
]

function AdminAnalyting() {
  const [timeFilter, setTimeFilter] = useState('today')
  const [chartData, setChartData] = useState([])
  const [loginData, setLoginData] = useState([])
  const [registerData, setRegisterData] = useState([])
  const [totalUploads, setTotalUploads] = useState(0)
  const [totalLogins, setTotalLogins] = useState(0)
  const [totalRegistrations, setTotalRegistrations] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)

  const filterMenuRef = useRef(null)

  const activeFilter = TIME_FILTERS.find((option) => option.key === timeFilter)

  const transformGraphData = (data = []) =>
    data.map((point, index) => {
      if (Object.prototype.hasOwnProperty.call(point, 'hour')) {
        const [hour] = point.hour.split(':')
        return { label: `${hour.padStart(2, '0')}:00`, value: point.count }
      }
      if (Object.prototype.hasOwnProperty.call(point, 'day')) {
        return { label: point.day, value: point.count }
      }
      if (Object.prototype.hasOwnProperty.call(point, 'date')) {
        return { label: point.date.padStart(2, '0'), value: point.count }
      }
      return { label: `Interval ${index + 1}`, value: point.count ?? 0 }
    })

  const deriveLabel = (point, index) => {
    if (Object.prototype.hasOwnProperty.call(point, 'hour')) {
      return point.hour
    }
    if (Object.prototype.hasOwnProperty.call(point, 'day')) {
      return point.day
    }
    if (Object.prototype.hasOwnProperty.call(point, 'date')) {
      return point.date.padStart ? point.date.padStart(2, '0') : point.date
    }
    if (Object.prototype.hasOwnProperty.call(point, 'label')) {
      return point.label
    }
    return `Interval ${index + 1}`
  }

  const transformLoginRegisterData = (data = [], field) =>
    data.map((point, index) => ({
      label: deriveLabel(point, index),
      value: point[field] ?? 0,
    }))

  const calculateTrend = (series) => {
    if (!series.length) {
      return { delta: 0, percent: 0 }
    }
    const firstValue = series[0].value
    const lastValue = series[series.length - 1].value
    const delta = lastValue - firstValue
    const percent = firstValue ? (delta / firstValue) * 100 : lastValue ? 100 : 0
    return { delta, percent }
  }

  const calculatePeak = (series) => {
    if (!series.length) return { label: '—', value: 0 }
    return series.reduce(
      (best, item) => (item.value > best.value ? item : best),
      { label: series[0].label, value: series[0].value }
    )
  }


  const ChartCard = ({
    title,
    totalLabel,
    totalValue,
    trend,
    data,
    color = '#4f46e5',
    metricLabel = 'entries',
  }) => {
    const trendValue = Number.isFinite(trend.percent) ? Math.abs(trend.percent).toFixed(1) : '0.0'
    const trendLabel = trend.percent >= 0 ? 'Trending up' : 'Trending down'

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{title}</p>
            <p className="text-lg font-semibold text-gray-900">
              {totalValue} {totalLabel}
            </p>
          </div>
          <div
            className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full ${
              trend.percent >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
            }`}
          >
            {trendLabel} by {trendValue}%
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ stroke: '#c7d2fe', strokeWidth: 2 }}
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.85rem',
                }}
                formatter={(value) => [`${value} ${metricLabel}`, title]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  const loadStats = async (filter = timeFilter) => {
    try {
      setIsLoading(true)
      setError('')

      const [uploadResponse, authResponse] = await Promise.all([
        getUserDocuments(filter),
        getLastLoginRegister(filter),
      ])

      if (uploadResponse?.success) {
        setChartData(transformGraphData(uploadResponse.graphData))
        setTotalUploads(uploadResponse.totalDocuments ?? 0)
      } else {
        setChartData([])
        setTotalUploads(0)
        setError(uploadResponse?.message || 'Failed to load document analytics.')
      }

      if (authResponse?.success) {
        setLoginData(transformLoginRegisterData(authResponse.graphData, 'logins'))
        setRegisterData(transformLoginRegisterData(authResponse.graphData, 'registrations'))
        setTotalLogins(authResponse.totalLogins ?? 0)
        setTotalRegistrations(authResponse.totalRegistrations ?? 0)
      } else {
        setLoginData([])
        setRegisterData([])
        setTotalLogins(0)
        setTotalRegistrations(0)
        setError((prev) => prev || authResponse?.message || 'Failed to load login/register analytics.')
      }
    } catch (err) {
      console.error('Error loading analytics stats:', err)
      setChartData([])
      setLoginData([])
      setRegisterData([])
      setTotalUploads(0)
      setTotalLogins(0)
      setTotalRegistrations(0)
      setError('Failed to load analytics. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats(timeFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFilter])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setIsFilterMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const uploadTrend = useMemo(() => calculateTrend(chartData), [chartData])
  const loginTrend = useMemo(() => calculateTrend(loginData), [loginData])
  const registerTrend = useMemo(() => calculateTrend(registerData), [registerData])

  const uploadPeak = useMemo(() => calculatePeak(chartData), [chartData])
  const loginPeak = useMemo(() => calculatePeak(loginData), [loginData])
  const registerPeak = useMemo(() => calculatePeak(registerData), [registerData])


  const summaryItems = [
    { label: 'Total uploads', value: `${totalUploads} docs` },
    { label: 'Total logins', value: `${totalLogins} logins` },
    { label: 'Total registrations', value: `${totalRegistrations} regs` },
    { label: 'Peak uploads', value: `${uploadPeak.label} · ${uploadPeak.value} docs` },
    { label: 'Peak logins', value: `${loginPeak.label} · ${loginPeak.value} logins` },
    {
      label: 'Peak registrations',
      value: `${registerPeak.label} · ${registerPeak.value} regs`,
    },
  ]

  const handleFilterSelect = (value) => {
    setTimeFilter(value)
    setIsFilterMenuOpen(false)
  }

  return (
    <div className="flex-1 min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-6xl mx-auto px-6 py-8 pt-28">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-[0.25em]">
              Analytics
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              Documents Overview
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Total uploaded documents across the selected time range.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative" ref={filterMenuRef}>
              <button
                type="button"
                onClick={() => setIsFilterMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {activeFilter?.label}
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    isFilterMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isFilterMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-2xl shadow-lg p-2 z-10">
                  {TIME_FILTERS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleFilterSelect(option.key)}
                      className={`w-full text-left px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        timeFilter === option.key
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => loadStats()}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
            <p className="text-sm text-gray-500">Loading analytics...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-8 lg:grid-cols-2">
              <ChartCard
                title="Documents trend"
                totalLabel="uploads total"
                totalValue={totalUploads}
                trend={uploadTrend}
                data={chartData}
                color="#4f46e5"
                metricLabel="docs"
              />
              <ChartCard
                title="Last login activity"
                totalLabel="logins total"
                totalValue={totalLogins}
                trend={loginTrend}
                data={loginData}
                color="#0ea5e9"
                metricLabel="logins"
              />
            </div>

            <div className="grid gap-8 lg:grid-cols-2 mt-8">
              <ChartCard
                title="New registrations"
                totalLabel="registrations total"
                totalValue={totalRegistrations}
                trend={registerTrend}
                data={registerData}
                color="#a855f7"
                metricLabel="regs"
              />

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
                <div className="mb-4">
                  <p className="text-xs font-semibold text-indigo-700 uppercase tracking-[0.25em]">
                    Summary
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-gray-900">Activity snapshot</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Showing data for <span className="font-semibold">{activeFilter?.label}</span>.
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  {summaryItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="font-medium text-gray-500">{item.label}</span>
                      <span className="font-semibold text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default AdminAnalyting
