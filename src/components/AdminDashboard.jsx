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

const AdminDashboard = () => {
  // Mock data
  const kpiData = [
    { 
      title: "Active Users", 
      value: "1,247", 
      change: "+12%", 
      icon: Users, 
      color: "vibrant-blue" 
    },
    { 
      title: "Total Registered Users", 
      value: "3,891", 
      change: "+8%", 
      icon: MessageSquare, 
      color: "vibrant-teal" 
    },
    { 
      title: "Total Prompts Tested", 
      value: "15,632", 
      change: "+24%", 
      icon: Activity, 
      color: "dusky-orange" 
    },
    { 
      title: "Most Used LLM", 
      value: "GPT-4", 
      change: "45%", 
      icon: Cpu, 
      color: "forest-green" 
    },
  ]

  const tokenUsageData = [
    { date: "Jan 1", tokens: 12000 },
    { date: "Jan 2", tokens: 15000 },
    { date: "Jan 3", tokens: 18000 },
    { date: "Jan 4", tokens: 14000 },
    { date: "Jan 5", tokens: 22000 },
    { date: "Jan 6", tokens: 25000 },
    { date: "Jan 7", tokens: 28000 },
  ]

  const modelLatencyData = [
    { model: "GPT-4", latency: 1200 },
    { model: "GPT-3.5", latency: 800 },
    { model: "Claude", latency: 950 },
    { model: "Gemini", latency: 1100 },
    { model: "LLaMA", latency: 750 },
  ]

  const responseAcceptanceData = [
    { model: "GPT-4", value: 45, color: "#2F5EF5" },
    { model: "Claude", value: 25, color: "#44BE9F" },
    { model: "GPT-3.5", value: 15, color: "#F6851F" },
    { model: "Gemini", value: 10, color: "#155F73" },
    { model: "Others", value: 5, color: "#8DCBE8" },
  ]

  const recentActivity = [
    { 
      user: "John Doe", 
      action: "Tested prompt with GPT-4", 
      time: "2 minutes ago", 
      status: "success" 
    },
    { 
      user: "Jane Smith", 
      action: "Compared 3 models", 
      time: "5 minutes ago", 
      status: "success" 
    },
    { 
      user: "Mike Johnson", 
      action: "Failed API call to Claude", 
      time: "8 minutes ago", 
      status: "error" 
    },
    { 
      user: "Sarah Wilson", 
      action: "Updated model preferences", 
      time: "12 minutes ago", 
      status: "info" 
    },
  ]

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
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon
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
      <div className="grid grid-cols-1  *: lg:grid-cols-2 gap-8">
        {/* Token Usage Trend */}
        <div className="bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-whale-blue mb-4">
            Token Usage Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={tokenUsageData}>
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
            <BarChart data={modelLatencyData}>
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
                data={responseAcceptanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {responseAcceptanceData.map((entry, index) => (
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
            {responseAcceptanceData.map((item, index) => (
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
            {recentActivity.map((activity, index) => (
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