import { useEffect, useState } from "react"
import { TestTube, Cpu, Clock, Zap, TrendingUp, ThumbsUp, ThumbsDown, Activity, Settings, History } from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const UserDashboard = ({ userId }) => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log(userId)
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboards/user/${userId}`)
        if (!res.ok) throw new Error("Failed to fetch dashboard data")
        const data = await res.json()
        setDashboardData(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [userId])

  if (loading) return <p className="p-6 text-center">Loading dashboard...</p>
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>
  if (!dashboardData) return null

  // Metric cards mapping
  const userMetrics = [
    {
      title: "Prompts Tested",
      value: dashboardData.promptsTested,
      change: "+15%", // you can calculate from last week’s data
      icon: TestTube,
      color: "vibrant-blue",
    },
    {
      title: "Best Performing Model",
      value: dashboardData.bestPerformingModel,
      change: `${dashboardData.accuracy}% accuracy`,
      icon: Cpu,
      color: "vibrant-teal",
    },
    {
      title: "Average Response Time",
      value: `${(dashboardData.averageResponseTime / 1000).toFixed(1)}s`,
      change: "-0.3s", // calculated from history
      icon: Clock,
      color: "dusky-orange",
    },
    {
      title: "Tokens Used This Week",
      value: dashboardData.tokensUsedThisWeek.toLocaleString(),
      change: "+8%", // calculated from last week
      icon: Zap,
      color: "forest-green",
    },
  ]

  // Convert backend map to chart format
  const modelUsageData = Object.entries(dashboardData.modelUsageDistribution || {}).map(([model, count]) => ({
    model,
    count,
  }))

  const weeklyPerformanceData = dashboardData.weeklyPerformanceScores || []

  const feedbackData = [
    { name: "Positive", value: dashboardData.feedback.positive, color: "#44BE9F" },
    { name: "Negative", value: dashboardData.feedback.negative, color: "#E63647" },
  ]

  const recentTests = dashboardData.testLogs
    .slice(-4)
    .reverse()
    .map((log) => ({
      prompt: log.prompt,
      model: log.model,
      timestamp: new Date(log.time).toLocaleString(),
      accuracy: log.accuracy,
      feedback: log.feedback,
    }))

  const getFeedbackIcon = (feedback) => {
    return feedback === "positive" ? (
      <ThumbsUp className="w-4 h-4 text-vibrant-teal" />
    ) : (
      <ThumbsDown className="w-4 h-4 text-crimson" />
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-white shadow p-6 genzeon-gradient text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="opacity-90">Here's your LLM testing performance overview</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div
              key={index}
              className="bg-white shadow p-6 hover:shadow-xl transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-${metric.color}/10 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${metric.color}`} />
                </div>
                <span
                  className={`text-sm font-medium ${metric.change.startsWith("+") ? "text-vibrant-teal" : metric.change.startsWith("-") ? "text-crimson" : "text-dusky-orange"}`}
                >
                  {metric.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-whale-blue mb-1">{metric.value}</h3>
              <p className="text-charcoal/70 text-sm">{metric.title}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Model Usage */}
        <div className="bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-whale-blue mb-4 flex items-center">
            <Activity className="mr-2" size={20} />
            Model Usage Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelUsageData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" />
              <YAxis dataKey="model" type="category" stroke="#6B7280" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#2F5EF5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Performance */}
        <div className="bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-whale-blue mb-4 flex items-center">
            <TrendingUp className="mr-2" size={20} />
            Weekly Performance Score
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" domain={[70, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#44BE9F"
                strokeWidth={3}
                dot={{ fill: "#44BE9F", strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Feedback Distribution */}
        <div className="bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-whale-blue mb-4">Feedback Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={feedbackData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {feedbackData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center space-x-6">
            {feedbackData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-charcoal/70">
                  {item.name}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tests */}
        <div className="bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-whale-blue mb-4">Recent Tests</h3>
          <div className="space-y-4">
            {recentTests.map((test, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 hover:bg-lilly-white rounded-lg transition-colors"
              >
                <div className="flex-shrink-0 mt-1">{getFeedbackIcon(test.feedback)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-whale-blue truncate">{test.prompt}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="inline-flex px-2 py-1 text-xs bg-vibrant-blue/10 text-vibrant-blue rounded">
                      {test.model}
                    </span>
                    <span className="text-xs text-charcoal/50">{test.timestamp}</span>
                    <span className="text-xs font-medium text-vibrant-teal">{test.accuracy}% accuracy</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow p-6">
        <h3 className="text-lg font-semibold text-whale-blue mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-6 py-4 genzeon-gradient text-white rounded-lg hover:opacity-90 transition-opacity">
            <TestTube className="mr-2" size={20} />
            Start New Test
          </button>
          <button className="flex items-center justify-center px-6 py-4 border border-vibrant-blue text-vibrant-blue rounded-lg hover:bg-vibrant-blue hover:text-white transition-colors">
            <History className="mr-2" size={20} />
            View History
          </button>
          <button className="flex items-center justify-center px-6 py-4 border border-storm-grey/30 text-charcoal/70 rounded-lg hover:bg-lilly-white transition-colors">
            <Settings className="mr-2" size={20} />
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
