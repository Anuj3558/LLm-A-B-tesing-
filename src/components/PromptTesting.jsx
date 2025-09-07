"use client"

import { useState, useEffect } from "react"
import { Play, Clock, Zap, ThumbsUp, ThumbsDown, Copy, Download, Sparkles, Bot, User, ChevronDown } from "lucide-react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Typewriter Component
const TypewriterText = ({ text, speed = 30, onComplete }) => {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete])

  return <span>{displayText}<span className="animate-pulse">|</span></span>
}

// Markdown-like renderer for structured text
const StructuredText = ({ content, isTypewriting = false, onTypewriterComplete }) => {
  const [showTypewriter, setShowTypewriter] = useState(isTypewriting)

  const formatText = (text) => {
    // Split by lines to handle different formatting
    const lines = text.split('\n')
    
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-xl font-bold text-gray-800 mt-4 mb-2">{line.slice(2)}</h1>
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-lg font-semibold text-gray-700 mt-3 mb-2">{line.slice(3)}</h2>
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-md font-medium text-gray-700 mt-2 mb-1">{line.slice(4)}</h3>
      }
      
      // Code blocks
      if (line.startsWith('```')) {
        const nextCodeEnd = lines.findIndex((l, i) => i > index && l.startsWith('```'))
        if (nextCodeEnd !== -1) {
          const codeContent = lines.slice(index + 1, nextCodeEnd).join('\n')
          return (
            <div key={index} className="bg-gray-900 text-green-400 p-4 rounded-lg my-2 overflow-x-auto">
              <pre className="text-sm font-mono">{codeContent}</pre>
            </div>
          )
        }
      }
      
      // Bullet points
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={index} className="ml-4 mb-1 list-disc text-gray-700">{line.slice(2)}</li>
      }
      
      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        return <li key={index} className="ml-4 mb-1 list-decimal text-gray-700">{line.replace(/^\d+\.\s/, '')}</li>
      }
      
      // Bold text
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
      
      // Italic text
      line = line.replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      
      // Empty lines
      if (line.trim() === '') {
        return <br key={index} />
      }
      
      // Regular paragraphs
      return (
        <p key={index} className="text-gray-700 mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: line }} />
      )
    })
  }

  if (showTypewriter) {
    return (
      <div className="structured-content">
        <TypewriterText 
          text={content} 
          speed={20}
          onComplete={() => {
            setShowTypewriter(false)
            if (onTypewriterComplete) onTypewriterComplete()
          }}
        />
      </div>
    )
  }

  return (
    <div className="structured-content space-y-1">
      {formatText(content)}
    </div>
  )
}

const PromptTesting = () => {
  const [prompt, setPrompt] = useState("")
  const [selectedModels, setSelectedModels] = useState([])
  const [evaluationCriteria, setEvaluationCriteria] = useState(["accuracy", "tokens", "latency"])
  const [testResults, setTestResults] = useState(null)
  const [testing, setTesting] = useState(false)
  const [availableModels, setAvailableModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(true)
  const [expandedResults, setExpandedResults] = useState({})
  const [typewriterCompleted, setTypewriterCompleted] = useState({})

  const criteriaOptions = [
    { id: "accuracy", name: "Accuracy", description: "Response quality and correctness", icon: "🎯" },
    { id: "tokens", name: "Token Usage", description: "Efficiency in token consumption", icon: "⚡" },
    { id: "latency", name: "Response Time", description: "Speed of response generation", icon: "⏱️" },
    { id: "coherence", name: "Coherence", description: "Logical flow and consistency", icon: "🧠" },
    { id: "creativity", name: "Creativity", description: "Originality and innovation", icon: "🎨" },
  ]

  // Function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || 
           sessionStorage.getItem('authToken') || 
           document.cookie.replace(/(?:(?:^|.*;\s*)authToken\s*=\s*([^;]*).*$)|^.*$/, '$1') || 
           "demo-token";
  }

  // Function to get userId from token or localStorage
  const getUserId = () => {
    // Try to get userId from localStorage first
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (userId) return userId;
    
    // If not in storage, try to decode from JWT token
    try {
      const token = getAuthToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.sub || payload.id;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    
    return "demo-user";
  }

  // Fetch allowed models for the user
  useEffect(() => {
    const fetchAllowedModels = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error("No authentication token found");
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Replace with your actual API endpoint
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/allowed-models`, {
          headers
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch allowed models: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log("Allowed models response:", data.data.models.allowedModel);
        if (data.success) {
          setAvailableModels(data.data.models.allowedModel || []);
        } else {
          throw new Error(data.error || 'Failed to fetch allowed models');
        }
      } catch (error) {
        console.error("Error fetching allowed models:", error);
        // Fallback to default models if API fails
        setAvailableModels([
          { 
            _id: "gpt-4", 
            name: "GPT-4 Turbo", 
            description: "Most capable model with superior reasoning",
            provider: "OpenAI",
            color: "bg-gradient-to-r from-green-400 to-blue-500"
          },
          { 
            _id: "gpt-3.5", 
            name: "GPT-3.5 Turbo", 
            description: "Fast and efficient for most tasks",
            provider: "OpenAI",
            color: "bg-gradient-to-r from-blue-400 to-purple-500"
          },
          { 
            _id: "claude-3", 
            name: "Claude 3 Sonnet", 
            description: "Excellent reasoning and analysis",
            provider: "Anthropic",
            color: "bg-gradient-to-r from-orange-400 to-pink-500"
          },
        ]);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchAllowedModels();
  }, []);

  const handleModelToggle = (modelId) => {
    setSelectedModels((prev) => 
      prev.includes(modelId) 
        ? prev.filter((id) => id !== modelId) 
        : [...prev, modelId]
    )
  }

  const handleCriteriaToggle = (criteriaId) => {
    setEvaluationCriteria((prev) =>
      prev.includes(criteriaId) 
        ? prev.filter((id) => id !== criteriaId) 
        : [...prev, criteriaId]
    )
  }

  const savePromptHistory = async (prompt, models, criteria, results) => {
    try {
      const token = getAuthToken();
      const userId = getUserId();

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/prompt-history`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          prompt,
          models,
          criteria,
          results,
          timestamp: new Date().toISOString()
        })
      });

      console.log("✅ Prompt history saved");
    } catch (error) {
      console.error("❌ Error saving prompt history:", error);
    }
  };

  const handleTest = async () => {
    if (!prompt.trim() || selectedModels.length === 0) {
      alert("Please enter a prompt and select at least one model.")
      return
    }

    setTesting(true)
    setTestResults(null)
    setTypewriterCompleted({})

    try {
      const token = getAuthToken();
      const userId = getUserId();

      if (!userId) {
        throw new Error("User ID not found");
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Call your actual API endpoint for testing
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/prompt-test`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          prompt,
          models: selectedModels,
          criteria: evaluationCriteria
        })
      });

      if (!response.ok) {
        throw new Error(`Test failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setTestResults(data.data.results);
        savePromptHistory(prompt, selectedModels, evaluationCriteria, data.data.results);
        
        // Initialize expanded state for all results
        const expandedState = data.data.results.reduce((acc, result) => ({
          ...acc,
          [result.modelId]: true // Expand all results
        }), {});
        
        setExpandedResults(expandedState);
        
        // Initialize typewriter completion state
        const typewriterState = data.data.results.reduce((acc, result) => ({
          ...acc,
          [result.modelId]: false // None completed initially
        }), {});
        
        setTypewriterCompleted(typewriterState);
      } else {
        throw new Error(data.error || 'Test failed');
      }
    } catch (error) {
      console.error("Error testing prompt:", error);
      
      // Fallback to mock data if API fails
      const mockResults = selectedModels.map((modelId) => {
        const model = availableModels.find((m) => m._id === modelId)
        return {
          modelId,
          modelName: model.name,
          provider: model.provider,
          color: model.color,
          response: `This is a comprehensive response from ${model.name}. ${prompt.includes("code") ? 'Here\'s a code example:\n\n```python\ndef example():\n    return "Hello World"\n```' : "The response addresses your query with detailed explanations and examples."} This model provides high-quality outputs with good reasoning capabilities.`,
          metrics: {
            responseTime: Math.floor(Math.random() * 2000) + 500,
            tokens: Math.floor(Math.random() * 150) + 50,
          },
          accuracy: Math.floor(Math.random() * 25) + 75,
          coherence: Math.floor(Math.random() * 20) + 80,
          creativity: Math.floor(Math.random() * 30) + 70,
        }
      })

      setTestResults(mockResults);
      
      // Initialize expanded state for all results
      const expandedState = mockResults.reduce((acc, result) => ({
        ...acc,
        [result.modelId]: true // Expand all results
      }), {});
      
      setExpandedResults(expandedState);
      
      // Initialize typewriter completion state
      const typewriterState = mockResults.reduce((acc, result) => ({
        ...acc,
        [result.modelId]: false // None completed initially
      }), {});
      
      setTypewriterCompleted(typewriterState);
    } finally {
      setTesting(false);
    }
  }

  const handleFeedback = async (modelId, feedback) => {
    try {
      const token = getAuthToken();
      const userId = getUserId();

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          modelId,
          feedback,
          prompt,
          result: testResults.find(r => r.modelId === modelId)
        })
      });

      console.log(`Feedback for ${modelId}: ${feedback} submitted successfully`);
      
      // Show visual feedback
      const button = document.querySelector(`[data-feedback="${modelId}-${feedback}"]`)
      if (button) {
        button.classList.add('animate-pulse')
        setTimeout(() => button.classList.remove('animate-pulse'), 1000)
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    // Show success message
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    notification.textContent = 'Copied to clipboard!'
    document.body.appendChild(notification)
    setTimeout(() => document.body.removeChild(notification), 2000)
  }

  const toggleResultExpansion = (modelId) => {
    setExpandedResults(prev => ({
      ...prev,
      [modelId]: !prev[modelId]
    }))
  }

  const handleTypewriterComplete = (modelId) => {
    setTypewriterCompleted(prev => ({
      ...prev,
      [modelId]: true
    }))
  }

  const getBestPerforming = () => {
    if (!testResults) return null
    return testResults.reduce((best, current) => 
      current.accuracy > (best?.accuracy || 0) ? current : best
    )
  }

  const chartData = testResults?.map((result) => ({
    model: result.modelName.split(' ')[0], // Shortened names for charts
    tokens: result?.metrics?.tokens ? result.metrics.tokens : 0,
    responseTime: result?.metrics?.responseTime ? result.metrics.responseTime : 0,
    accuracy: result.accuracy,
  })) || []

  const bestModel = getBestPerforming()

  if (loadingModels) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <Bot className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Loading AI Models...
            </h1>
            <p className="text-gray-600">Setting up your testing environment</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg w-1/3"></div>
              <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
              <div className="grid grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AI Prompt Testing Lab
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Test your prompts across multiple AI models and compare their performance with detailed analytics
          </p>
        </div>

        {/* Prompt Input Section */}
       

        {/* Results Section */}
        {testResults && (
          <div className="space-y-8">
            {/* Best Performing Model */}
            {bestModel && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-2">
                  <Sparkles className="text-green-500 mr-3" size={24} />
                  <h3 className="text-xl font-semibold text-gray-800">🏆 Top Performer</h3>
                </div>
                <p className="text-gray-700 text-lg">
                  <strong className="text-green-700">{bestModel.modelName}</strong> achieved the highest accuracy score of{" "}
                  <span className="font-bold text-green-600">{bestModel.accuracy}%</span> with{" "}
                  {bestModel.metrics.tokens ? bestModel.metrics.tokens :0} tokens in {bestModel.metrics?.responseTime ? bestModel.metrics.responseTime : 0}ms
                </p>
              </div>
            )}

            {/* Response Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {testResults.map((result, index) => (
                <div
                  key={result.modelId}
                  className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border transition-all duration-300 ${
                    result === bestModel 
                      ? "border-green-300 ring-2 ring-green-200" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Header */}
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => toggleResultExpansion(result.modelId)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full ${result.color} mr-3`}></div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg flex items-center">
                            {result.modelName}
                            {result === bestModel && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                BEST
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">{result.provider}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock size={14} className="mr-1" />
                            {result.metrics.responseTime}ms
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Zap size={14} className="mr-1" />
                            {result.metrics.tokens} tokens
                          </div>
                        </div>
                        <ChevronDown 
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedResults[result.modelId] ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-gray-600">Accuracy: </span>
                        <span className="font-semibold text-blue-600 ml-1">{result.accuracy}%</span>
                      </div>
                      {evaluationCriteria.includes("coherence") && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                          <span className="text-gray-600">Coherence: </span>
                          <span className="font-semibold text-purple-600 ml-1">{result.coherence}%</span>
                        </div>
                      )}
                      {evaluationCriteria.includes("creativity") && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                          <span className="text-gray-600">Creativity: </span>
                          <span className="font-semibold text-pink-600 ml-1">{result.creativity}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expandable Response */}
                  {expandedResults[result.modelId] && (
                    <div className="px-6 pb-6">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-4 border border-gray-200">
                        <div className="flex items-center mb-3">
                          <Bot className="w-5 h-5 text-gray-600 mr-2" />
                          <span className="text-sm font-medium text-gray-700">AI Response</span>
                          {!typewriterCompleted[result.modelId] && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              Typing...
                            </span>
                          )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          <StructuredText 
                            content={result.response} 
                            isTypewriting={true}
                            onTypewriterComplete={() => handleTypewriterComplete(result.modelId)}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(result.response)
                            }}
                            className="flex items-center px-3 py-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Copy response"
                          >
                            <Copy size={16} className="mr-1" />
                            <span className="text-sm">Copy</span>
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            data-feedback={`${result.modelId}-positive`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleFeedback(result.modelId, "positive")
                            }}
                            className="flex items-center px-3 py-2 text-gray-600 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                            title="Positive feedback"
                          >
                            <ThumbsUp size={16} className="mr-1" />
                            <span className="text-sm">Good</span>
                          </button>
                          <button
                            data-feedback={`${result.modelId}-negative`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleFeedback(result.modelId, "negative")
                            }}
                            className="flex items-center px-3 py-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Negative feedback"
                          >
                            <ThumbsDown size={16} className="mr-1" />
                            <span className="text-sm">Poor</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Zap className="w-5 h-5 text-orange-500 mr-2" />
                  Token Usage Comparison
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="model" 
                      stroke="#6B7280" 
                      fontSize={12}
                      tick={{ fill: '#6B7280' }}
                    />
                    <YAxis 
                      stroke="#6B7280" 
                      fontSize={12}
                      tick={{ fill: '#6B7280' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                        backdropFilter: "blur(10px)"
                      }}
                      labelStyle={{ color: "#374151", fontWeight: "600" }}
                    />
                    <Bar 
                      dataKey="tokens" 
                      fill="url(#tokenGradient)" 
                      radius={[4, 4, 0, 0]}
                      className="drop-shadow-sm"
                    />
                    <defs>
                      <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#D97706" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Clock className="w-5 h-5 text-blue-500 mr-2" />
                  Performance Metrics
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="model" 
                      stroke="#6B7280" 
                      fontSize={12}
                      tick={{ fill: '#6B7280' }}
                    />
                    <YAxis 
                      stroke="#6B7280" 
                      fontSize={12}
                      tick={{ fill: '#6B7280' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                        backdropFilter: "blur(10px)"
                      }}
                      labelStyle={{ color: "#374151", fontWeight: "600" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      name="Response Time (ms)"
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      name="Accuracy (%)"
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Metrics Table */}
           
        
          </div>
        )}
      </div>
       <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center mb-6">
            <Sparkles className="w-6 h-6 text-purple-500 mr-3" />
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Craft Your Prompt
            </h2>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Enter your prompt
              </label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-40 px-6 py-4 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none shadow-inner text-gray-800 placeholder-gray-400 backdrop-blur-sm"
                  placeholder="✨ Enter your creative prompt here... 

Examples:
• 'Explain quantum computing in simple terms with analogies'
• 'Write a Python function to analyze sentiment in social media posts'
• 'Create a marketing strategy for a sustainable fashion brand'"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {prompt.length} characters
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select AI Models ({selectedModels.length} selected)
                </label>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {availableModels.map((model) => (
                    <label
                      key={model._id}
                      className={`group flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedModels.includes(model._id)
                          ? 'border-purple-300 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-purple-200 hover:bg-purple-25'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model._id)}
                        onChange={() => handleModelToggle(model._id)}
                        className="mt-1 mr-4 text-purple-600 focus:ring-purple-500 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-gray-800">{model.name}</div>
                          <div className={`w-3 h-3 rounded-full ${model.color}`}></div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{model.description}</div>
                        <div className="text-xs text-gray-500 mt-1">by {model.provider}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Evaluation Criteria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Evaluation Criteria ({evaluationCriteria.length} selected)
                </label>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {criteriaOptions.map((criteria) => (
                    <label
                      key={criteria.id}
                      className={`group flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        evaluationCriteria.includes(criteria.id)
                          ? 'border-blue-300 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-blue-25'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={evaluationCriteria.includes(criteria.id)}
                        onChange={() => handleCriteriaToggle(criteria.id)}
                        className="mt-1 mr-4 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{criteria.icon}</span>
                          <div className="font-semibold text-gray-800">{criteria.name}</div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{criteria.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleTest}
              disabled={testing || !prompt.trim() || selectedModels.length === 0}
              className="w-full group flex items-center justify-center px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg font-semibold"
            >
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Testing across {selectedModels.length} models...
                </>
              ) : (
                <>
                  <Play size={24} className="mr-3 group-hover:scale-110 transition-transform" />
                  Start AI Testing
                </>
              )}
            </button>
          </div>
        </div>
    </div>
  )
}

export default PromptTesting  