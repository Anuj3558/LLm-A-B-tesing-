"use client"

import { useState } from "react"
import { Play, Clock, Zap, ThumbsUp, ThumbsDown, Copy, Download, Sparkles } from "lucide-react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const PromptTesting = () => {
  const [prompt, setPrompt] = useState("")
  const [selectedModels, setSelectedModels] = useState(["gpt-4", "claude-3"])
  const [evaluationCriteria, setEvaluationCriteria] = useState(["accuracy", "tokens", "latency"])
  const [testResults, setTestResults] = useState(null)
  const [testing, setTesting] = useState(false)

  const availableModels = [
    { id: "gpt-4", name: "GPT-4", description: "Most capable model" },
    { id: "gpt-3.5", name: "GPT-3.5 Turbo", description: "Fast and efficient" },
    { id: "claude-3", name: "Claude 3", description: "Excellent reasoning" },
    { id: "gemini-pro", name: "Gemini Pro", description: "Google's latest" },
    { id: "llama-2", name: "LLaMA 2", description: "Open source model" },
  ]

  const criteriaOptions = [
    { id: "accuracy", name: "Accuracy", description: "Response quality and correctness" },
    { id: "tokens", name: "Token Usage", description: "Efficiency in token consumption" },
    { id: "latency", name: "Response Time", description: "Speed of response generation" },
    { id: "coherence", name: "Coherence", description: "Logical flow and consistency" },
    { id: "creativity", name: "Creativity", description: "Originality and innovation" },
  ]

  const handleModelToggle = (modelId) => {
    setSelectedModels((prev) => (prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]))
  }

  const handleCriteriaToggle = (criteriaId) => {
    setEvaluationCriteria((prev) =>
      prev.includes(criteriaId) ? prev.filter((id) => id !== criteriaId) : [...prev, criteriaId],
    )
  }

  const handleTest = async () => {
    if (!prompt.trim() || selectedModels.length === 0) {
      alert("Please enter a prompt and select at least one model.")
      return
    }

    setTesting(true)

    // Simulate API calls with different delays for each model
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockResults = selectedModels.map((modelId) => {
      const model = availableModels.find((m) => m.id === modelId)
      return {
        modelId,
        modelName: model.name,
        response: `This is a comprehensive response from ${model.name}. ${prompt.includes("code") ? 'Here\'s a code example:\n\n```python\ndef example():\n    return "Hello World"\n```' : "The response addresses your query with detailed explanations and examples."} This model provides high-quality outputs with good reasoning capabilities.`,
        responseTime: Math.floor(Math.random() * 2000) + 500,
        tokens: Math.floor(Math.random() * 150) + 50,
        accuracy: Math.floor(Math.random() * 25) + 75,
        coherence: Math.floor(Math.random() * 20) + 80,
        creativity: Math.floor(Math.random() * 30) + 70,
      }
    })

    setTestResults(mockResults)
    setTesting(false)
  }

  const handleFeedback = (modelId, feedback) => {
    console.log(`Feedback for ${modelId}: ${feedback}`)
    // In a real app, this would send feedback to the backend
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const getBestPerforming = () => {
    if (!testResults) return null
    return testResults.reduce((best, current) => (current.accuracy > (best?.accuracy || 0) ? current : best))
  }

  const chartData =
    testResults?.map((result) => ({
      model: result.modelName,
      tokens: result.tokens,
      responseTime: result.responseTime,
      accuracy: result.accuracy,
    })) || []

  const bestModel = getBestPerforming()

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-whale-blue mb-2">Prompt Testing</h1>
        <p className="text-charcoal/70">Test your prompts across multiple LLM models and compare results</p>
      </div>

      {/* Prompt Input Section */}
      <div className="bg-white shadow p-6">
        <h2 className="text-lg font-semibold text-whale-blue mb-4 flex items-center">
          <Sparkles className="mr-2" size={20} />
          Prompt Input
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-whale-blue mb-2">Enter your prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 px-4 py-3 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent resize-none"
              placeholder="Enter your prompt here... (e.g., 'Explain quantum computing in simple terms' or 'Write a Python function to sort a list')"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-whale-blue mb-3">
                Select Models ({selectedModels.length} selected)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableModels.map((model) => (
                  <label
                    key={model.id}
                    className="flex items-start p-3 border border-storm-grey/20 rounded-lg hover:bg-lilly-white transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(model.id)}
                      onChange={() => handleModelToggle(model.id)}
                      className="mt-1 mr-3 text-vibrant-blue focus:ring-vibrant-blue"
                    />
                    <div>
                      <div className="font-medium text-whale-blue">{model.name}</div>
                      <div className="text-sm text-charcoal/70">{model.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Evaluation Criteria */}
            <div>
              <label className="block text-sm font-medium text-whale-blue mb-3">
                Evaluation Criteria ({evaluationCriteria.length} selected)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {criteriaOptions.map((criteria) => (
                  <label
                    key={criteria.id}
                    className="flex items-start p-3 border border-storm-grey/20 rounded-lg hover:bg-lilly-white transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={evaluationCriteria.includes(criteria.id)}
                      onChange={() => handleCriteriaToggle(criteria.id)}
                      className="mt-1 mr-3 text-vibrant-blue focus:ring-vibrant-blue"
                    />
                    <div>
                      <div className="font-medium text-whale-blue">{criteria.name}</div>
                      <div className="text-sm text-charcoal/70">{criteria.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleTest}
            disabled={testing || !prompt.trim() || selectedModels.length === 0}
            className="w-full flex items-center justify-center px-6 py-4 genzeon-gradient text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Testing across {selectedModels.length} models...
              </>
            ) : (
              <>
                <Play size={20} className="mr-2" />
                Test Prompt
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {testResults && (
        <div className="space-y-8">
          {/* Best Performing Model */}
          {bestModel && (
            <div className="bg-white shadow p-6 border-l-4 border-vibrant-teal">
              <div className="flex items-center mb-2">
                <Sparkles className="text-vibrant-teal mr-2" size={20} />
                <h3 className="text-lg font-semibold text-whale-blue">Best Performing Model</h3>
              </div>
              <p className="text-charcoal/70">
                <strong>{bestModel.modelName}</strong> achieved the highest accuracy score of {bestModel.accuracy}% with{" "}
                {bestModel.tokens} tokens in {bestModel.responseTime}ms
              </p>
            </div>
          )}

          {/* Response Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {testResults.map((result, index) => (
              <div key={index} className={`bg-white shadow p-6 ${result === bestModel ? "ring-2 ring-vibrant-teal" : ""}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-whale-blue flex items-center">
                    {result.modelName}
                    {result === bestModel && <Sparkles className="ml-2 text-vibrant-teal" size={16} />}
                  </h3>
                  <div className="flex space-x-4 text-sm text-charcoal/70">
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {result.responseTime}ms
                    </span>
                    <span className="flex items-center">
                      <Zap size={14} className="mr-1" />
                      {result.tokens} tokens
                    </span>
                  </div>
                </div>

                <div className="bg-lilly-white p-4 rounded-lg mb-4 max-h-48 overflow-y-auto">
                  <pre className="text-sm text-charcoal/80 whitespace-pre-wrap font-sans">{result.response}</pre>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-4 text-sm">
                    <span className="font-medium text-whale-blue">Accuracy: {result.accuracy}%</span>
                    {evaluationCriteria.includes("coherence") && (
                      <span className="text-charcoal/70">Coherence: {result.coherence}%</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(result.response)}
                      className="p-2 text-charcoal/50 hover:text-vibrant-blue hover:bg-vibrant-blue/10 rounded-lg transition-colors"
                      title="Copy response"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleFeedback(result.modelId, "positive")}
                      className="p-2 text-charcoal/50 hover:text-vibrant-teal hover:bg-vibrant-teal/10 rounded-lg transition-colors"
                      title="Positive feedback"
                    >
                      <ThumbsUp size={16} />
                    </button>
                    <button
                      onClick={() => handleFeedback(result.modelId, "negative")}
                      className="p-2 text-charcoal/50 hover:text-crimson hover:bg-crimson/10 rounded-lg transition-colors"
                      title="Negative feedback"
                    >
                      <ThumbsDown size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow p-6">
              <h3 className="text-lg font-semibold text-whale-blue mb-4">Token Usage Comparison</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
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
              <h3 className="text-lg font-semibold text-whale-blue mb-4">Response Time vs Accuracy</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
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
                    dataKey="responseTime"
                    stroke="#2F5EF5"
                    strokeWidth={2}
                    name="Response Time (ms)"
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#44BE9F" strokeWidth={2} name="Accuracy (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white shadow p-6">
            <h3 className="text-lg font-semibold text-whale-blue mb-4">Export Results</h3>
            <div className="flex space-x-4">
              <button className="flex items-center px-4 py-2 border border-storm-grey/30 text-charcoal/70 rounded-lg hover:bg-lilly-white transition-colors">
                <Download size={16} className="mr-2" />
                Export as CSV
              </button>
              <button className="flex items-center px-4 py-2 border border-storm-grey/30 text-charcoal/70 rounded-lg hover:bg-lilly-white transition-colors">
                <Download size={16} className="mr-2" />
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PromptTesting
