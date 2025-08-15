"use client"

import { useState } from "react"
import { Save, RotateCcw, Play, Settings, Zap, Clock, BarChart3, CheckCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

const GlobalConfig = () => {
  const [config, setConfig] = useState({
    models: {
      "gpt-4": {
        enabled: true,
        maxTokens: 4000,
        temperature: 0.7,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
      },
      "gpt-3.5-turbo": {
        enabled: true,
        maxTokens: 4000,
        temperature: 0.7,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
      },
      "claude-3": {
        enabled: true,
        maxTokens: 4000,
        temperature: 0.7,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
      },
      "gemini-pro": {
        enabled: false,
        maxTokens: 2000,
        temperature: 0.5,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
      },
    },
    platform: {
      defaultTimeout: 30,
      maxConcurrentRequests: 10,
      rateLimitPerUser: 100,
      enableLogging: true,
      enableAnalytics: true,
    },
  })

  const [prompt, setPrompt] = useState("Explain the concept of artificial intelligence in simple terms.")
  const [selectedModels, setSelectedModels] = useState(["gpt-4", "claude-3"])
  const [evaluationCriteria, setEvaluationCriteria] = useState(["accuracy", "tokens", "latency"])
  const [testResults, setTestResults] = useState(null)
  const [testing, setTesting] = useState(false)

  const availableModels = Object.keys(config.models).filter((model) => config.models[model].enabled)
  const criteriaOptions = [
    { value: "accuracy", label: "Accuracy" },
    { value: "tokens", label: "Token Usage" },
    { value: "latency", label: "Response Time" },
    { value: "coherence", label: "Coherence" },
    { value: "relevance", label: "Relevance" },
  ]

  const handleConfigSave = () => {
    // In a real app, this would save to backend
    console.log("Saving config:", config)
    alert("Configuration saved successfully!")
  }

  const handleConfigReset = () => {
    // Reset to default config
    setConfig({
      models: {
        "gpt-4": {
          enabled: true,
          maxTokens: 4000,
          temperature: 0.7,
          topP: 1.0,
          frequencyPenalty: 0.0,
          presencePenalty: 0.0,
        },
        "gpt-3.5-turbo": {
          enabled: true,
          maxTokens: 4000,
          temperature: 0.7,
          topP: 1.0,
          frequencyPenalty: 0.0,
          presencePenalty: 0.0,
        },
        "claude-3": {
          enabled: true,
          maxTokens: 4000,
          temperature: 0.7,
          topP: 1.0,
          frequencyPenalty: 0.0,
          presencePenalty: 0.0,
        },
        "gemini-pro": {
          enabled: false,
          maxTokens: 2000,
          temperature: 0.5,
          topP: 0.9,
          frequencyPenalty: 0.1,
          presencePenalty: 0.1,
        },
      },
      platform: {
        defaultTimeout: 30,
        maxConcurrentRequests: 10,
        rateLimitPerUser: 100,
        enableLogging: true,
        enableAnalytics: true,
      },
    })
  }

  const handleTest = async () => {
    setTesting(true)

    // Simulate API calls
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockResults = selectedModels.map((model) => ({
      model,
      response: `This is a mock response from ${model}. Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn like humans. It encompasses various technologies including machine learning, natural language processing, and computer vision.`,
      responseTime: Math.floor(Math.random() * 2000) + 500,
      tokens: Math.floor(Math.random() * 100) + 50,
      accuracy: Math.floor(Math.random() * 30) + 70,
    }))

    setTestResults(mockResults)
    setTesting(false)
  }

  const tokenData =
    testResults?.map((result) => ({
      model: result.model,
      tokens: result.tokens,
    })) || []

  const latencyData =
    testResults?.map((result) => ({
      model: result.model,
      latency: result.responseTime,
    })) || []

  const bestPerforming = testResults?.reduce((best, current) =>
    current.accuracy > (best?.accuracy || 0) ? current : best,
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-whale-blue mb-2">Global Configuration & Prompt Tester</h1>
        <p className="text-charcoal/70">Configure platform-wide settings and test prompts across models</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="bg-white shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-whale-blue flex items-center">
                <Settings className="mr-2" size={20} />
                Global Configuration
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleConfigReset}
                  className="flex items-center px-3 py-2 text-charcoal/70 hover:text-charcoal border border-storm-grey/30 rounded-lg hover:bg-lilly-white transition-colors"
                >
                  <RotateCcw size={16} className="mr-1" />
                  Reset
                </button>
                <button
                  onClick={handleConfigSave}
                  className="flex items-center px-3 py-2 bg-vibrant-blue text-white rounded-lg hover:bg-vibrant-blue/90 transition-colors"
                >
                  <Save size={16} className="mr-1" />
                  Save
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-white overflow-x-auto max-h-96 overflow-y-auto">
              <pre>{JSON.stringify(config, null, 2)}</pre>
            </div>
          </div>
        </div>

        {/* Prompt Testing Interface */}
        <div className="space-y-6">
          <div className="bg-white shadow p-6">
            <h2 className="text-lg font-semibold text-whale-blue mb-4 flex items-center">
              <Zap className="mr-2" size={20} />
              Prompt Testing Interface
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-whale-blue mb-2">Test Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-24 px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent resize-none"
                  placeholder="Enter your prompt here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-whale-blue mb-2">Select Models</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableModels.map((model) => (
                    <label key={model} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedModels([...selectedModels, model])
                          } else {
                            setSelectedModels(selectedModels.filter((m) => m !== model))
                          }
                        }}
                        className="mr-2 text-vibrant-blue focus:ring-vibrant-blue"
                      />
                      <span className="text-sm text-charcoal/70">{model}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-whale-blue mb-2">Evaluation Criteria</label>
                <div className="grid grid-cols-2 gap-2">
                  {criteriaOptions.map((criteria) => (
                    <label key={criteria.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={evaluationCriteria.includes(criteria.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEvaluationCriteria([...evaluationCriteria, criteria.value])
                          } else {
                            setEvaluationCriteria(evaluationCriteria.filter((c) => c !== criteria.value))
                          }
                        }}
                        className="mr-2 text-vibrant-blue focus:ring-vibrant-blue"
                      />
                      <span className="text-sm text-charcoal/70">{criteria.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleTest}
                disabled={testing || selectedModels.length === 0}
                className="w-full flex items-center justify-center px-4 py-3 genzeon-gradient text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Testing...
                  </>
                ) : (
                  <>
                    <Play size={16} className="mr-2" />
                    Test Prompt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="space-y-6">
          {/* Best Performing Model */}
          {bestPerforming && (
            <div className="bg-white shadow p-6 border-l-4 border-vibrant-teal">
              <div className="flex items-center mb-2">
                <CheckCircle className="text-vibrant-teal mr-2" size={20} />
                <h3 className="text-lg font-semibold text-whale-blue">Best Performing Model</h3>
              </div>
              <p className="text-charcoal/70">
                <strong>{bestPerforming.model}</strong> achieved the highest accuracy score of {bestPerforming.accuracy}
                %
              </p>
            </div>
          )}

          {/* Response Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {testResults.map((result, index) => (
              <div key={index} className="bg-white shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-whale-blue">{result.model}</h3>
                  <div className="flex space-x-4 text-sm text-charcoal/70">
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {result.responseTime}ms
                    </span>
                    <span className="flex items-center">
                      <BarChart3 size={14} className="mr-1" />
                      {result.tokens} tokens
                    </span>
                  </div>
                </div>
                <div className="bg-lilly-white p-4 rounded-lg">
                  <p className="text-sm text-charcoal/80">{result.response}</p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-whale-blue">Accuracy: {result.accuracy}%</span>
                  <div className="flex space-x-2">
                    <button className="p-2 text-vibrant-teal hover:bg-vibrant-teal/10 rounded-lg transition-colors">
                      👍
                    </button>
                    <button className="p-2 text-crimson hover:bg-crimson/10 rounded-lg transition-colors">👎</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Comparisons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow p-6">
              <h3 className="text-lg font-semibold text-whale-blue mb-4">Token Usage Comparison</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={tokenData}>
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
                  <Bar dataKey="tokens" fill="#F6851F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white shadow p-6">
              <h3 className="text-lg font-semibold text-whale-blue mb-4">Response Time Comparison</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={latencyData}>
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
                  <Line
                    type="monotone"
                    dataKey="latency"
                    stroke="#2F5EF5"
                    strokeWidth={3}
                    dot={{ fill: "#2F5EF5", strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GlobalConfig
