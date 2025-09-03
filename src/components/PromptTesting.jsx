"use client"

import { useState, useEffect } from "react"
import { Play, Clock, Zap, ThumbsUp, ThumbsDown, Copy, Download, Sparkles, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { testPromptWithModels, getAvailableModels, checkLLMHealth } from "../app/api/index.js"

const PromptTesting = () => {
  const [prompt, setPrompt] = useState("")
  const [selectedModels, setSelectedModels] = useState([])
  const [evaluationCriteria, setEvaluationCriteria] = useState(["accuracy", "tokens", "responseTime"])
  const [testResults, setTestResults] = useState(null)
  const [testing, setTesting] = useState(false)
  const [availableModels, setAvailableModels] = useState([])
  const [llmHealth, setLlmHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load available models and health status on component mount
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch available models from database (admin-configured only)
        const modelsResponse = await getAvailableModels()
        if (modelsResponse.success) {
          const models = modelsResponse.data.data.models
          setAvailableModels(models)
          
          // Only auto-select models that have API keys configured
          const configuredModels = models.filter(m => m.apiKeyConfigured)
          const defaultModels = configuredModels.slice(0, 2).map(m => m.id)
          setSelectedModels(defaultModels)
          
          // Show warning if no models are configured
          if (models.length === 0) {
            setError('No models configured by admin. Please contact your administrator to set up LLM configurations.')
          } else if (configuredModels.length === 0) {
            setError('No models have valid API keys configured. Please contact your administrator to configure API keys.')
          }
        } else {
          throw new Error(modelsResponse.error)
        }

        // Check LLM service health
        const healthResponse = await checkLLMHealth()
        if (healthResponse.success) {
          setLlmHealth(healthResponse.data.data)
        } else {
          console.warn('Could not check LLM health:', healthResponse.error)
        }
      } catch (err) {
        console.error('Error initializing PromptTesting:', err)
        setError(err.message || 'Failed to initialize LLM testing')
        // No fallback models - everything should come from admin configuration
        setAvailableModels([])
        setSelectedModels([])
      } finally {
        setLoading(false)
      }
    }

    initializeComponent()
  }, [])

  // Function to refresh available models
  const refreshModels = async () => {
    try {
      setLoading(true)
      setError(null)

      const modelsResponse = await getAvailableModels()
      if (modelsResponse.success) {
        const models = modelsResponse.data.data.models
        setAvailableModels(models)
        
        // Update selected models to only include currently available ones
        setSelectedModels(prev => prev.filter(id => models.some(m => m.id === id)))
        
        if (models.length === 0) {
          setError('No models configured by admin. Please contact your administrator to set up LLM configurations.')
        }
      } else {
        setError(modelsResponse.error)
      }
    } catch (err) {
      setError(err.message || 'Failed to refresh models')
    } finally {
      setLoading(false)
    }
  }

  const criteriaOptions = [
    { id: "accuracy", name: "Accuracy", description: "Response quality and correctness" },
    { id: "tokens", name: "Token Usage", description: "Efficiency in token consumption" },
    { id: "responseTime", name: "Response Time", description: "Speed of response generation" },
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
    if (!prompt.trim()) {
      alert("Please enter a prompt.")
      return
    }
    
    if (selectedModels.length === 0) {
      alert("Please select at least one model. If no models are available, contact your administrator to configure LLM providers.")
      return
    }

    setTesting(true)
    setError(null)

    try {
      console.log('Testing prompt with models:', selectedModels)
      console.log('Evaluation criteria:', evaluationCriteria)
      
      const response = await testPromptWithModels(prompt, selectedModels, evaluationCriteria)
      
      if (response.success) {
        const results = response.data.data.results.map(result => ({
          modelId: result.modelId,
          modelName: result.modelName,
          provider: result.provider,
          response: result.response,
          responseTime: result.metrics?.responseTime || 0,
          tokens: result.metrics?.tokens || 0,
          inputTokens: result.metrics?.inputTokens || 0,
          outputTokens: result.metrics?.outputTokens || 0,
          accuracy: result.metrics?.accuracy || 0,
          coherence: result.metrics?.coherence || 0,
          creativity: result.metrics?.creativity || 0,
          wordCount: result.metrics?.wordCount || 0,
          success: result.success,
          error: result.error,
          errorType: result.errorType,
        }))
        
        setTestResults(results)
        console.log('Test results:', results)
      } else {
        throw new Error(response.error || 'Failed to test prompt')
      }
    } catch (err) {
      console.error('Error testing prompt:', err)
      setError(err.message || 'Failed to test prompt with models')
      
      // No mock results - everything should be real
      setTestResults([])
    } finally {
      setTesting(false)
    }
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
    const successfulResults = testResults.filter(result => result.success)
    if (successfulResults.length === 0) return null
    return successfulResults.reduce((best, current) => (current.accuracy > (best?.accuracy || 0) ? current : best))
  }

  const chartData =
    testResults?.filter(result => result.success).map((result) => ({
      model: result.modelName,
      tokens: result.tokens,
      responseTime: result.responseTime,
      accuracy: result.accuracy,
      coherence: result.coherence,
      creativity: result.creativity,
    })) || []

  const bestModel = getBestPerforming()

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-whale-blue mb-2">Prompt Testing</h1>
        <p className="text-charcoal/70">Test your prompts across multiple LLM models and compare results</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white shadow p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vibrant-blue mx-auto mb-4"></div>
          <p className="text-charcoal/70">Loading LLM models and checking service health...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start">
          <AlertCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-red-800 font-medium">Service Error</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <p className="text-red-600 text-xs mt-2">Using fallback mock data for demonstration.</p>
          </div>
        </div>
      )}

      {/* LLM Health Status */}
      {llmHealth && !loading && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="text-blue-800 font-medium flex items-center mb-2">
            <CheckCircle className="mr-2" size={16} />
            LLM Service Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
            {Object.entries(llmHealth.providers || {}).map(([provider, status]) => (
              <div key={provider} className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${status === 'configured' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className={status === 'configured' ? 'text-green-700' : 'text-gray-600'}>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && (
        <>
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
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-whale-blue">
                  Select Models ({selectedModels.length} selected)
                </label>
                <button
                  onClick={refreshModels}
                  disabled={loading}
                  className="flex items-center text-xs text-vibrant-blue hover:text-vibrant-blue/80 disabled:opacity-50"
                  title="Refresh available models"
                >
                  <RefreshCw size={14} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableModels.map((model) => (
                  <label
                    key={model.id}
                    className={`flex items-start p-3 border rounded-lg hover:bg-lilly-white transition-colors cursor-pointer ${
                      model.apiKeyConfigured 
                        ? 'border-storm-grey/20' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(model.id)}
                      onChange={() => handleModelToggle(model.id)}
                      className="mt-1 mr-3 text-vibrant-blue focus:ring-vibrant-blue"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-whale-blue">{model.name}</div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            model.provider === 'openai' ? 'bg-green-100 text-green-700' :
                            model.provider === 'anthropic' ? 'bg-purple-100 text-purple-700' :
                            model.provider === 'google' ? 'bg-blue-100 text-blue-700' :
                            model.provider === 'groq' ? 'bg-orange-100 text-orange-700' :
                            model.provider === 'azure' ? 'bg-cyan-100 text-cyan-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {model.provider}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${
                            model.apiKeyConfigured ? 'bg-green-500' : 'bg-red-500'
                          }`} title={model.apiKeyConfigured ? 'API Key Configured' : 'API Key Missing'}></div>
                        </div>
                      </div>
                      <div className="text-sm text-charcoal/70">{model.description}</div>
                      {!model.apiKeyConfigured && (
                        <div className="text-xs text-red-600 mt-1">
                          ⚠️ API key not configured - contact admin
                        </div>
                      )}
                      {model.source && (
                        <div className="text-xs text-gray-500 mt-1">
                          Source: {model.source === 'database' ? 'Admin Configured' : 'System Default'}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              {availableModels.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="mx-auto mb-2" size={24} />
                  <p>No models configured by admin</p>
                  <p className="text-xs mt-1">Contact your administrator to set up LLM configurations</p>
                </div>
              )}
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
              <div key={index} className={`bg-white shadow p-6 ${result === bestModel ? "ring-2 ring-vibrant-teal" : ""} ${!result.success ? "border-l-4 border-red-500" : ""}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-whale-blue flex items-center">
                    {result.modelName}
                    {result.provider && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {result.provider}
                      </span>
                    )}
                    {result === bestModel && <Sparkles className="ml-2 text-vibrant-teal" size={16} />}
                    {!result.success && <AlertCircle className="ml-2 text-red-500" size={16} />}
                  </h3>
                  {result.success && (
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
                  )}
                </div>

                {/* Error Display */}
                {!result.success && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                    <div className="flex items-start">
                      <AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-0.5" size={16} />
                      <div>
                        <h4 className="text-red-800 font-medium text-sm">
                          {result.errorType === 'invalid_api_key' ? 'API Key Error' :
                           result.errorType === 'rate_limit' ? 'Rate Limit Exceeded' :
                           result.errorType === 'service_unavailable' ? 'Service Unavailable' :
                           result.errorType === 'model_not_found' ? 'Model Not Available' :
                           result.errorType === 'quota_exceeded' ? 'Quota Exceeded' :
                           result.errorType === 'billing_error' ? 'Billing Issue' :
                           'API Error'}
                        </h4>
                        <p className="text-red-700 text-xs mt-1">{result.error}</p>
                        {result.errorType === 'invalid_api_key' && (
                          <p className="text-red-600 text-xs mt-2">
                            Please check your API key configuration in the backend environment variables.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Response Display */}
                <div className={`p-4 rounded-lg mb-4 max-h-48 overflow-y-auto ${result.success ? 'bg-lilly-white' : 'bg-gray-50'}`}>
                  <pre className={`text-sm whitespace-pre-wrap font-sans ${result.success ? 'text-charcoal/80' : 'text-gray-500'}`}>
                    {result.response}
                  </pre>
                </div>

                {/* Metrics and Actions */}
                {result.success && (
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4 text-sm">
                      <span className="font-medium text-whale-blue">Accuracy: {result.accuracy}%</span>
                      {evaluationCriteria.includes("coherence") && (
                        <span className="text-charcoal/70">Coherence: {result.coherence}%</span>
                      )}
                      {evaluationCriteria.includes("creativity") && (
                        <span className="text-charcoal/70">Creativity: {result.creativity}%</span>
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
                )}

                {/* Error Actions */}
                {!result.success && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => copyToClipboard(`Error: ${result.error}\nModel: ${result.modelName}\nProvider: ${result.provider}`)}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                      title="Copy error details"
                    >
                      Copy Error Details
                    </button>
                  </div>
                )}
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
        </>
      )}
    </div>
  )
}

export default PromptTesting
