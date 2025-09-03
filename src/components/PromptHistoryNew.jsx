"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Calendar, RotateCcw, Edit, Trash2, ThumbsUp, ThumbsDown, Play, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { getPromptHistory, deletePromptHistory, addPromptFeedback, bulkDeletePromptHistory } from "../app/api/index.js"

const PromptHistory = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [modelFilter, setModelFilter] = useState("all")
  const [resultFilter, setResultFilter] = useState("all")
  const [promptHistory, setPromptHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEntries, setSelectedEntries] = useState([])

  // Load prompt history on component mount and when filters change
  useEffect(() => {
    fetchPromptHistory()
  }, [currentPage, searchTerm, dateFilter, modelFilter, resultFilter])

  const fetchPromptHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        modelFilter,
        outcomeFilter: resultFilter,
        dateFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }

      const response = await getPromptHistory(params)
      
      if (response.success) {
        const data = response.data.data
        setPromptHistory(data.history || [])
        setPagination(data.pagination || {})
        setFilters(data.filters || {})
      } else {
        throw new Error(response.error)
      }
    } catch (err) {
      setError(err.message)
      setPromptHistory([])
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatModels = (selectedModels) => {
    if (!selectedModels || selectedModels.length === 0) return []
    return selectedModels.map(model => {
      // Convert database model format to display format
      if (model.includes('-')) {
        const parts = model.split('-')
        const provider = parts[0]
        const modelName = parts.slice(1).join('-')
        return `${provider.charAt(0).toUpperCase() + provider.slice(1)} ${modelName}`
      }
      return model
    })
  }

  const filteredHistory = promptHistory.filter((item) => {
    const matchesSearch = item.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    const models = formatModels(item.selectedModels)
    const matchesModel = modelFilter === "all" || 
      models.some((model) => model.toLowerCase().includes(modelFilter.toLowerCase()))
    const matchesResult = resultFilter === "all" || 
      item.summary?.outcome?.toLowerCase() === resultFilter.toLowerCase()

    return matchesSearch && matchesModel && matchesResult
  })

  const handleRetest = (item) => {
    // Navigate to prompt testing with the same prompt and models
    const searchParams = new URLSearchParams({
      prompt: item.prompt,
      models: JSON.stringify(item.selectedModels)
    })
    window.location.href = `/user/test?${searchParams.toString()}`
  }

  const handleEdit = (item) => {
    // Navigate to prompt testing with the prompt pre-filled
    const searchParams = new URLSearchParams({
      prompt: item.prompt
    })
    window.location.href = `/user/test?${searchParams.toString()}`
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this prompt history entry?")) {
      return
    }

    try {
      const response = await deletePromptHistory(id)
      if (response.success) {
        // Refresh the history after deletion
        fetchPromptHistory()
      } else {
        alert("Failed to delete prompt history entry: " + response.error)
      }
    } catch (error) {
      alert("Error deleting prompt history entry: " + error.message)
    }
  }

  const handleFeedback = async (id, rating) => {
    try {
      const response = await addPromptFeedback(id, rating)
      if (response.success) {
        // Refresh the history after feedback update
        fetchPromptHistory()
      } else {
        alert("Failed to add feedback: " + response.error)
      }
    } catch (error) {
      alert("Error adding feedback: " + error.message)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedEntries.length === 0) {
      alert("Please select entries to delete")
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedEntries.length} selected entries?`)) {
      return
    }

    try {
      const response = await bulkDeletePromptHistory(selectedEntries)
      if (response.success) {
        setSelectedEntries([])
        fetchPromptHistory()
      } else {
        alert("Failed to delete entries: " + response.error)
      }
    } catch (error) {
      alert("Error deleting entries: " + error.message)
    }
  }

  const handleSelectEntry = (id) => {
    setSelectedEntries(prev => 
      prev.includes(id) 
        ? prev.filter(entryId => entryId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedEntries.length === filteredHistory.length) {
      setSelectedEntries([])
    } else {
      setSelectedEntries(filteredHistory.map(item => item._id))
    }
  }

  const getFeedbackIcon = (feedback) => {
    if (!feedback || !feedback.rating) {
      return <span className="text-gray-400 text-sm">No feedback</span>
    }
    return feedback.rating === "positive" ? (
      <ThumbsUp className="w-4 h-4 text-vibrant-teal" />
    ) : feedback.rating === "negative" ? (
      <ThumbsDown className="w-4 h-4 text-crimson" />
    ) : (
      <span className="text-gray-400 text-sm">Neutral</span>
    )
  }

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case "Success":
        return "text-vibrant-teal bg-vibrant-teal/10"
      case "Partial":
        return "text-dusky-orange bg-dusky-orange/10"
      case "Error":
        return "text-crimson bg-crimson/10"
      default:
        return "text-gray-500 bg-gray-100"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-whale-blue mb-2">Prompt History</h1>
          <p className="text-charcoal/70">Review and manage your previously tested prompts</p>
        </div>
        <div className="bg-white shadow p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vibrant-blue mx-auto mb-4"></div>
          <p className="text-charcoal/70">Loading prompt history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-whale-blue mb-2">Prompt History</h1>
          <p className="text-charcoal/70">Review and manage your previously tested prompts</p>
        </div>
        <div className="bg-white shadow p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading History</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchPromptHistory}
            className="inline-flex items-center px-4 py-2 genzeon-gradient text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={16} className="mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-whale-blue mb-2">Prompt History</h1>
          <p className="text-charcoal/70">Review and manage your previously tested prompts</p>
        </div>
        <div className="flex space-x-3">
          {selectedEntries.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 size={16} className="mr-2" />
              Delete Selected ({selectedEntries.length})
            </button>
          )}
          <button
            onClick={fetchPromptHistory}
            className="flex items-center px-4 py-2 border border-storm-grey/30 text-charcoal/70 rounded-lg hover:bg-lilly-white transition-colors"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/50" size={20} />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-charcoal/50" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-charcoal/50" />
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
            >
              <option value="all">All Models</option>
              <option value="gpt-4">GPT-4</option>
              <option value="claude">Claude</option>
              <option value="gpt-3.5">GPT-3.5</option>
              <option value="gemini">Gemini</option>
              <option value="groq">Groq</option>
            </select>
          </div>

          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
          >
            <option value="all">All Results</option>
            <option value="Success">Success</option>
            <option value="Partial">Partial</option>
            <option value="Error">Error</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white shadow p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-charcoal/70">
            Showing {filteredHistory.length} of {pagination.totalItems || 0} prompts
            {filters.total && (
              <span className="ml-4">
                • {filters.success || 0} successful • {filters.partial || 0} partial • {filters.error || 0} errors
              </span>
            )}
          </p>
          {filteredHistory.length > 0 && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedEntries.length === filteredHistory.length}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-charcoal/70">Select All</span>
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      {filteredHistory.length > 0 ? (
        <div className="bg-white shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-lilly-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedEntries.length === filteredHistory.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                    Prompt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                    Models
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                    Feedback
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-storm-grey/20">
                {filteredHistory.map((item) => (
                  <tr key={item._id} className="hover:bg-lilly-white/50 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(item._id)}
                        onChange={() => handleSelectEntry(item._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-whale-blue line-clamp-2">
                          {item.prompt}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-charcoal/70">
                        {formatTimestamp(item.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {formatModels(item.selectedModels).map((model, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {model}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOutcomeColor(item.summary?.outcome)}`}>
                        {item.summary?.outcome || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.summary?.outcome === "Success" || item.summary?.outcome === "Partial" ? (
                        <div className="text-sm">
                          <div className="font-medium text-whale-blue">
                            {item.summary?.bestAccuracy || 0}% accuracy
                          </div>
                          <div className="text-charcoal/70">{item.summary?.bestModel || 'N/A'}</div>
                          <div className="text-xs text-charcoal/50">
                            {item.summary?.totalTokens || 0} tokens • {item.summary?.averageResponseTime || 0}ms
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-charcoal/50">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getFeedbackIcon(item.feedback)}
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleFeedback(item._id, 'positive')}
                            className="p-1 text-charcoal/50 hover:text-green-500 transition-colors"
                            title="Mark as positive"
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button
                            onClick={() => handleFeedback(item._id, 'negative')}
                            className="p-1 text-charcoal/50 hover:text-red-500 transition-colors"
                            title="Mark as negative"
                          >
                            <ThumbsDown size={14} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRetest(item)}
                          className="p-2 text-charcoal/50 hover:text-vibrant-blue hover:bg-vibrant-blue/10 rounded-lg transition-colors"
                          title="Retest"
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-charcoal/50 hover:text-dusky-orange hover:bg-dusky-orange/10 rounded-lg transition-colors"
                          title="Edit & Reuse"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-charcoal/50 hover:text-crimson hover:bg-crimson/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow p-12 text-center">
          <div className="text-charcoal/50 mb-4">
            <Search size={48} className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-whale-blue mb-2">No prompts found</h3>
            <p>
              {searchTerm || dateFilter !== 'all' || modelFilter !== 'all' || resultFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'Start testing prompts to see your history here'}
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/user/test'}
            className="flex items-center justify-center mx-auto px-6 py-3 genzeon-gradient text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Play size={16} className="mr-2" />
            Start New Test
          </button>
        </div>
      )}
    </div>
  )
}

export default PromptHistory
