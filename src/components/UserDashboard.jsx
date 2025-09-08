import { useEffect, useState } from "react";

// API Base URL Configuration
const API_BASE_URL = import.meta.env.PROD
  ? 'http://35.239.39.90:5000/api'
  : 'http://localhost:5000/api'
import { TestTube, Cpu, Clock, Zap, TrendingUp, ThumbsUp, ThumbsDown, Activity, Settings, History } from "lucide-react";
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
} from "recharts";
import { Skeleton } from "antd";
import Cookies from "js-cookie";

// Dashboard Schema
const dashboardSchema = {
  promptsTested: 0,
  bestPerformingModel: "",
  accuracy: 0,
  averageResponseTime: 0,
  tokensUsedThisWeek: 0,
  modelUsageDistribution: {},
  weeklyPerformanceScores: [],
  feedback: {
    positive: 0,
    negative: 0
  },
  testLogs: []
};

// Dummy data generator
const generateDummyData = (userId) => {
  const models = ["GPT-4", "Claude-2", "Llama-2-70B", "PaLM-2", "Cohere-Command"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Generate random model usage distribution
  const modelUsageDistribution = {};
  models.forEach(model => {
    modelUsageDistribution[model] = Math.floor(Math.random() * 50) + 10;
  });
  
  // Generate weekly performance data
  const weeklyPerformanceScores = days.map(day => ({
    day,
    score: Math.floor(Math.random() * 25) + 70 // Scores between 70-95
  }));
  
  // Generate test logs
  const testLogs = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    prompt: `Test prompt #${i + 1} about ${["AI", "coding", "science", "history", "art"][i % 5]}`,
    model: models[Math.floor(Math.random() * models.length)],
    time: Date.now() - (i * 3600000), // Hours ago
    accuracy: Math.floor(Math.random() * 40) + 60, // 60-100%
    feedback: Math.random() > 0.3 ? "positive" : "negative"
  }));
  
  // Calculate feedback percentages
  const feedbackCount = testLogs.reduce((acc, log) => {
    acc[log.feedback] = (acc[log.feedback] || 0) + 1;
    return acc;
  }, {});
  
  const totalFeedback = feedbackCount.positive + feedbackCount.negative;
  const positivePercentage = Math.round((feedbackCount.positive / totalFeedback) * 100);
  
  return {
    promptsTested: testLogs.length,
    bestPerformingModel: models[Math.floor(Math.random() * models.length)],
    accuracy: Math.floor(Math.random() * 30) + 70, // 70-100%
    averageResponseTime: Math.floor(Math.random() * 2000) + 500, // 500-2500ms
    tokensUsedThisWeek: Math.floor(Math.random() * 500000) + 100000, // 100k-600k
    modelUsageDistribution,
    weeklyPerformanceScores,
    feedback: {
      positive: positivePercentage,
      negative: 100 - positivePercentage
    },
    testLogs
  };
};

// Skeleton Loading Component
export const UserDashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Header Skeleton */}
      <Skeleton.Input active className="!h-28 !w-full" />

      {/* Metric Cards Skeleton */}
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

      {/* Quick Actions Skeleton */}
      <Skeleton active paragraph={{ rows: 2 }} />
    </div>
  );
};

const UserDashboard = ({ userId }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useDummyData, setUseDummyData] = useState(false);

  // Function to get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('authToken') || 
                  sessionStorage.getItem('authToken') || 
                  Cookies.get('authToken');
    
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setLoading(false);
      return null;
    }
    
    return token;
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Try to fetch real data first
        const res = await fetch(`${API_BASE_URL}/user/dashboards/${userId}`, {
          headers
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Authentication failed. Please log in again.");
          }
          throw new Error(`Failed to fetch dashboard data: ${res.status} ${res.statusText}`);
        }
        
        const response = await res.json();
        
        if (response.success) {
          setDashboardData(response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        console.log("API not available, using dummy data:", err.message);
        setError(err.message);
        setUseDummyData(true);
        setDashboardData(generateDummyData(userId));
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, [userId]);

  if (loading) return <UserDashboardSkeleton />;
  
  if (error && !useDummyData) return (
    <div className="p-6">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button 
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    </div>
  );

  if (!dashboardData) return null;

  // Add a note when using dummy data
  const DummyDataNotice = () => (
    useDummyData ? (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
        <p className="font-bold">Demo Mode</p>
        <p>Showing dummy data as the API is not available: {error}</p>
      </div>
    ) : null
  );

  // Color mapping for metric cards
  const colorMap = {
    "blue-500": { bg: "bg-blue-100", text: "text-blue-500" },
    "teal-500": { bg: "bg-teal-100", text: "text-teal-500" },
    "orange-500": { bg: "bg-orange-100", text: "text-orange-500" },
    "green-500": { bg: "bg-green-100", text: "text-green-500" },
  };

  // Metric cards mapping
  const userMetrics = [
    {
      title: "Prompts Tested",
      value: dashboardData.promptsTested,
      change: "+15%",
      icon: TestTube,
      color: "blue-500",
    },
    {
      title: "Best Performing Model",
      value: dashboardData.bestPerformingModel,
      change: `${dashboardData.accuracy}% accuracy`,
      icon: Cpu,
      color: "teal-500",
    },
    {
      title: "Average Response Time",
      value: `${(dashboardData.averageResponseTime / 1000).toFixed(1)}s`,
      change: "-0.3s",
      icon: Clock,
      color: "orange-500",
    },
    {
      title: "Tokens Used This Week",
      value: dashboardData.tokensUsedThisWeek.toLocaleString(),
      change: "+8%",
      icon: Zap,
      color: "green-500",
    },
  ];

  // Convert backend map to chart format
  const modelUsageData = Object.entries(dashboardData.modelUsageDistribution || {}).map(([model, count]) => ({
    model,
    count,
  }));

  const weeklyPerformanceData = dashboardData.weeklyPerformanceScores || [];

  const feedbackData = [
    { name: "Positive", value: dashboardData.feedback.positive, color: "#44BE9F" },
    { name: "Negative", value: dashboardData.feedback.negative, color: "#E63647" },
  ];

  const recentTests = dashboardData.testLogs || [];

  const getFeedbackIcon = (feedback) => {
    return feedback === "positive" ? (
      <ThumbsUp className="w-4 h-4 text-green-500" />
    ) : (
      <ThumbsDown className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <DummyDataNotice />
      
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 shadow p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="opacity-90">Here's your LLM testing performance overview</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const colorClass = colorMap[metric.color];
          
          return (
            <div
              key={index}
              className="bg-white shadow p-6 hover:shadow-xl transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${colorClass.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${colorClass.text}`} />
                </div>
                <span
                  className={`text-sm font-medium ${metric.change.startsWith("+") ? "text-green-500" : metric.change.startsWith("-") ? "text-red-500" : "text-yellow-500"}`}
                >
                  {metric.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{metric.value}</h3>
              <p className="text-gray-600 text-sm">{metric.title}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Model Usage */}
        <div className="bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Feedback Distribution</h3>
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
                <span className="text-sm text-gray-600">
                  {item.name}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tests */}
        <div className="bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Tests</h3>
          <div className="space-y-4">
            {recentTests.slice(0, 5).map((test, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex-shrink-0 mt-1">{getFeedbackIcon(test.feedback)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{test.prompt}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {test.model}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(test.time).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-medium text-green-600">{test.accuracy}% accuracy</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity">
            <TestTube className="mr-2" size={20} />
            Start New Test
          </button>
          <button className="flex items-center justify-center px-6 py-4 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors">
            <History className="mr-2" size={20} />
            View History
          </button>
          <button className="flex items-center justify-center px-6 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="mr-2" size={20} />
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;