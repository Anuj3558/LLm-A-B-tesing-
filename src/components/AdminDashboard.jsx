import { useState, useEffect } from "react"
import { Users, MessageSquare, Cpu, Activity, Clock, CheckCircle, AlertCircle } from "lucide-react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { Skeleton } from "antd"

export const AdminDashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Header Skeleton */}
      <Skeleton.Input active className="!h-28 !w-full" />

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} active paragraph={{ rows: 3 }} />
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} active paragraph={{ rows: 6 }} />
        ))}
      </div>
    </div>
  )
}
const getCookie = (name) => {
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }
 const getAuthToken = () => {
    return getCookie('authToken')
  }
const getApiHeaders = () => {
    const token = getAuthToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }
const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard`,{
          headers: getApiHeaders()
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        const finalData = data.data
        console.log("Dashboard data:", finalData)
        setDashboardData({
          finalData
      })
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-vibrant-teal" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-crimson" />
      default:
        return <Clock className="w-4 h-4 text-dusky-orange" />
    }
  }

  if (loading) {
    return <AdminDashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-6 bg-white shadow rounded-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-crimson mx-auto mb-4" />
          <h3 className="text-lg font-medium text-whale-blue mb-2">Error Loading Dashboard</h3>
          <p className="text-charcoal/70">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-vibrant-blue text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="shadow p-6 genzeon-gradient text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="opacity-90">
          Monitor platform performance and manage your LLM testing environment
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        { dashboardData.finalData.kpiData.map((kpi, index) => {
          const Icon = kpi.icon
          console.log("KPI Data:", kpi)
          return (
            <div
              key={index}
              className="shadow bg-white p-6 hover:shadow-xl transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-${kpi.color}/10 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${kpi.color}`} />
                </div>
                <span className="text-sm font-medium text-vibrant-teal">
                  {kpi.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-whale-blue mb-1">
                {kpi.value}
              </h3>
              <p className="text-charcoal/70 text-sm">{kpi.title}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Token Usage Trend */}
        <div className="bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-whale-blue mb-4">
            Token Usage Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData.tokenUsageData}>
              <defs>
                <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2F5EF5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2F5EF5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Area 
                type="monotone" 
                dataKey="tokens" 
                stroke="#2F5EF5" 
                strokeWidth={3} 
                fill="url(#tokenGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Model Latency Comparison */}
        <div className="bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-whale-blue mb-4">
            Model Latency Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.modelLatencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="model" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar 
                dataKey="latency" 
                fill="#44BE9F" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Response Acceptance by Model */}
        <div className="bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-whale-blue mb-4">
            Response Acceptance by Model
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.finalData.responseAcceptanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {dashboardData.finalData.responseAcceptanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {dashboardData.finalData.responseAcceptanceData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-charcoal/70">
                  {item.model}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-whale-blue mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {dashboardData.finalData.recentActivity
  .slice(-5) // Take last 5 elements
  .reverse() // Reverse to show in descending order (newest first)
  .map((activity, index) => (
    <div
      key={index}
      className="flex items-start space-x-3 p-3 hover:bg-lilly-white rounded-lg transition-colors"
    >
      {getStatusIcon(activity.status)}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-whale-blue">
          {activity.user}
        </p>
        <p className="text-sm text-charcoal/70">
          {activity.action}
        </p>
        <p className="text-xs text-charcoal/50 mt-1">
          {activity.time}
        </p>
      </div>
    </div>
  ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard