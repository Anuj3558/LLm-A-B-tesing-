"use client"

import { useState } from "react"
import { TrendingUp, Clock, AlertTriangle, Download } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const ModelPerformance = () => {
  const [selectedModel, setSelectedModel] = useState("gpt-4")
  const [dateRange, setDateRange] = useState("7d")

  const models = [
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-3.5", label: "GPT-3.5 Turbo" },
    { value: "claude-3", label: "Claude 3" },
    { value: "gemini-pro", label: "Gemini Pro" },
    { value: "llama-2", label: "LLaMA 2" },
  ]

  // Mock data for different models
  const performanceData = {
    "gpt-4": {
      responseTime: [
        { date: "Jan 1", time: 1200 },
        { date: "Jan 2", time: 1150 },
        { date: "Jan 3", time: 1300 },
        { date: "Jan 4", time: 1100 },
        { date: "Jan 5", time: 1250 },
        { date: "Jan 6", time: 1180 },
        { date: "Jan 7", time: 1220 },
      ],
      tokenUsage: [
        { date: "Jan 1", tokens: 85 },
        { date: "Jan 2", tokens: 92 },
        { date: "Jan 3", tokens: 78 },
        { date: "Jan 4", tokens: 88 },
        { date: "Jan 5", tokens: 95 },
        { date: "Jan 6", tokens: 82 },
        { date: "Jan 7", tokens: 90 },
      ],
      bubbleData: [
        { errorRate: 2.1, cost: 0.03, latency: 1200, size: 100 },
        { errorRate: 1.8, cost: 0.032, latency: 1150, size: 120 },
        { errorRate: 2.5, cost: 0.028, latency: 1300, size: 90 },
        { errorRate: 1.5, cost: 0.035, latency: 1100, size: 110 },
      ],
    },
    "claude-3": {
      responseTime: [
        { date: "Jan 1", time: 950 },
        { date: "Jan 2", time: 980 },
        { date: "Jan 3", time: 920 },
        { date: "Jan 4", time: 1000 },
        { date: "Jan 5", time: 940 },
        { date: "Jan 6", time: 960 },
        { date: "Jan 7", time: 975 },
      ],
      tokenUsage: [
        { date: "Jan 1", tokens: 75 },
        { date: "Jan 2", tokens: 82 },
        { date: "Jan 3", tokens: 68 },
        { date: "Jan 4", tokens: 78 },
        { date: "Jan 5", tokens: 85 },
        { date: "Jan 6", tokens: 72 },
        { date: "Jan 7", tokens: 80 },
      ],
      bubbleData: [
        { errorRate: 1.2, cost: 0.025, latency: 950, size: 95 },
        { errorRate: 1.5, cost: 0.027, latency: 980, size: 105 },
        { errorRate: 1.0, cost: 0.023, latency: 920, size: 85 },
        { errorRate: 1.8, cost: 0.029, latency: 1000, size: 100 },
      ],
    },
  }

  const errorLogs = [
    {
      timestamp: "2024-01-07 14:32:15",
      model: "GPT-4",
      error: "Rate limit exceeded",
      context: "Explain quantum computing...",
    },
    {
      timestamp: "2024-01-07 13:45:22",
      model: "Claude 3",
      error: "Timeout error",
      context: "Write a story about...",
    },
    {
      timestamp: "2024-01-07 12:18:33",
      model: "GPT-3.5",
      error: "Invalid API key",
      context: "Summarize the following text...",
    },
    {
      timestamp: "2024-01-07 11:22:44",
      model: "Gemini Pro",
      error: "Content policy violation",
      context: "Generate code for...",
    },
  ]

  const currentData = performanceData[selectedModel] || performanceData["gpt-4"]

  const exportData = (type) => {
    // In a real app, this would generate and download the file
    console.log(`Exporting ${type} data for ${selectedModel}`)
    alert(`Exporting ${type} data for ${selectedModel}`)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-whale-blue">Model Performance Explorer</h1>
          <p className="text-charcoal/70">Analyze model behavior, efficiency, and performance trends</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => exportData("charts")}
            className="flex items-center px-4 py-2 border border-storm-grey/30 text-charcoal/70 rounded-lg hover:bg-lilly-white transition-colors"
          >
            <Download size={16} className="mr-2" />
            Export Charts
          </button>
          <button
            onClick={() => exportData("logs")}
            className="flex items-center px-4 py-2 bg-vibrant-blue text-white rounded-lg hover:bg-vibrant-blue/90 transition-colors"
          >
            <Download size={16} className="mr-2" />
            Export Logs
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-whale-blue mb-2">Select Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
            >
              {models.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-whale-blue mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Response Time Trend */}
        <div className="bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-whale-blue mb-4 flex items-center">
            <TrendingUp className="mr-2" size={20} />
            Response Time Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentData.responseTime}>
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
              <Line
                type="monotone"
                dataKey="time"
                stroke="#2F5EF5"
                strokeWidth={3}
                dot={{ fill: "#2F5EF5", strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Token Usage */}
        <div className="bg-white shadow p-6">
          <h3 className="text-lg font-semibold text-whale-blue mb-4 flex items-center">
            <Clock className="mr-2" size={20} />
            Average Token Usage
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentData.tokenUsage}>
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
              <Bar dataKey="tokens" fill="#44BE9F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bubble Chart */}
      <div className="bg-white shadow p-6">
        <h3 className="text-lg font-semibold text-whale-blue mb-4 flex items-center">
          <AlertTriangle className="mr-2" size={20} />
          Performance Correlation (Error Rate vs Cost vs Latency)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart data={currentData.bubbleData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" dataKey="errorRate" name="Error Rate" unit="%" stroke="#6B7280" />
            <YAxis type="number" dataKey="cost" name="Cost" unit="$" stroke="#6B7280" />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value, name) => {
                if (name === "latency") return [`${value}ms`, "Latency"]
                if (name === "cost") return [`$${value}`, "Cost"]
                if (name === "errorRate") return [`${value}%`, "Error Rate"]
                return [value, name]
              }}
            />
            <Scatter name="Performance" dataKey="latency" fill="#F6851F">
              {currentData.bubbleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#F6851F" />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-charcoal/70">
          <p>
            Bubble size represents latency. Lower error rate and cost with acceptable latency indicates better
            performance.
          </p>
        </div>
      </div>

      {/* Error Logs */}
      <div className="bg-white shadow p-6">
        <h3 className="text-lg font-semibold text-whale-blue mb-4 flex items-center">
          <AlertTriangle className="mr-2" size={20} />
          Recent Error Logs
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-lilly-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-whale-blue">Timestamp</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-whale-blue">Model</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-whale-blue">Error</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-whale-blue">Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-storm-grey/20">
              {errorLogs.map((log, index) => (
                <tr key={index} className="hover:bg-lilly-white/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-charcoal/70 font-mono">{log.timestamp}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-vibrant-blue/10 text-vibrant-blue rounded-full">
                      {log.model}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-crimson/10 text-crimson rounded-full">
                      {log.error}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-charcoal/70 max-w-xs truncate">{log.context}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ModelPerformance
