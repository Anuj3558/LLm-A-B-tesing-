"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, EyeOff, Key, Save, X, AlertCircle, CheckCircle, Loader } from "lucide-react"
import { getModelConfigs, createModelConfig, updateModelConfig, deleteModelConfig } from "../app/api/index.js"

const LLMConfiguration = () => {
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState(null)
  const [showApiKeys, setShowApiKeys] = useState({})

  // Form state
  const [formData, setFormData] = useState({
    providerId: '',
    modelId: '',
    apiKey: '',
    parameters: {
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      endpoint: '',
      apiVersion: '',
      deploymentName: '',
    }
  })

  const [submitting, setSubmitting] = useState(false)

  const providers = [
    { id: 'openai', name: 'OpenAI', models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'] },
    { id: 'anthropic', name: 'Anthropic', models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'] },
    { id: 'google', name: 'Google', models: ['gemini-pro', 'gemini-pro-vision'] },
    { id: 'groq', name: 'Groq', models: ['llama2-70b-4096', 'mixtral-8x7b-32768'] },
    { id: 'azure', name: 'Azure OpenAI', models: ['gpt-4', 'gpt-35-turbo'] },
  ]

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getModelConfigs()
      if (response.success) {
        setConfigs(response.data.data || [])
      } else {
        throw new Error(response.error)
      }
    } catch (err) {
      console.error('Error fetching model configs:', err)
      setError(err.message || 'Failed to fetch configurations')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      providerId: '',
      modelId: '',
      apiKey: '',
      parameters: {
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        endpoint: '',
        apiVersion: '',
        deploymentName: '',
      }
    })
    setEditingConfig(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.providerId || !formData.modelId || !formData.apiKey) {
      setError('Provider, Model, and API Key are required')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const configData = {
        providerId: formData.providerId,
        modelId: formData.modelId,
        apiKey: formData.apiKey,
        parameters: formData.parameters,
      }

      let response
      if (editingConfig) {
        response = await updateModelConfig(editingConfig._id, configData)
      } else {
        response = await createModelConfig(configData)
      }

      if (response.success) {
        await fetchConfigs()
        setShowAddModal(false)
        resetForm()
      } else {
        throw new Error(response.error)
      }
    } catch (err) {
      console.error('Error saving config:', err)
      setError(err.message || 'Failed to save configuration')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (config) => {
    setFormData({
      providerId: config.providerId,
      modelId: config.modelId,
      apiKey: config.apiKey,
      parameters: config.parameters || {
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        endpoint: '',
        apiVersion: '',
        deploymentName: '',
      }
    })
    setEditingConfig(config)
    setShowAddModal(true)
  }

  const handleDelete = async (configId) => {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return
    }

    try {
      setError(null)
      const response = await deleteModelConfig(configId)
      if (response.success) {
        await fetchConfigs()
      } else {
        throw new Error(response.error)
      }
    } catch (err) {
      console.error('Error deleting config:', err)
      setError(err.message || 'Failed to delete configuration')
    }
  }

  const toggleApiKeyVisibility = (configId) => {
    setShowApiKeys(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }))
  }

  const maskApiKey = (apiKey) => {
    if (!apiKey) return ''
    return apiKey.slice(0, 8) + '...' + apiKey.slice(-4)
  }

  const getProviderName = (providerId) => {
    return providers.find(p => p.id === providerId)?.name || providerId
  }

  const getProviderModels = (providerId) => {
    return providers.find(p => p.id === providerId)?.models || []
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-whale-blue mb-2">LLM Configuration</h1>
          <p className="text-charcoal/70">Manage API keys and configurations for AI models</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowAddModal(true)
          }}
          className="flex items-center px-4 py-2 genzeon-gradient text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={20} className="mr-2" />
          Add Configuration
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start">
          <AlertCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Configurations List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-whale-blue flex items-center">
            <Key className="mr-2" size={20} />
            API Configurations
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader className="animate-spin mx-auto mb-4" size={32} />
            <p className="text-charcoal/70">Loading configurations...</p>
          </div>
        ) : configs.length === 0 ? (
          <div className="p-8 text-center">
            <Key size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No configurations yet</h3>
            <p className="text-gray-500 mb-4">Add your first API configuration to get started.</p>
            <button
              onClick={() => {
                resetForm()
                setShowAddModal(true)
              }}
              className="genzeon-gradient text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Add Configuration
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {configs.map((config) => (
              <div key={config._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-whale-blue">
                        {getProviderName(config.providerId)}
                      </h3>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {config.modelId}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-charcoal/70">
                      <div>
                        <span className="font-medium">API Key:</span>
                        <div className="flex items-center mt-1">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {showApiKeys[config._id] ? config.apiKey : maskApiKey(config.apiKey)}
                          </code>
                          <button
                            onClick={() => toggleApiKeyVisibility(config._id)}
                            className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                          >
                            {showApiKeys[config._id] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Parameters:</span>
                        <div className="mt-1">
                          Temperature: {config.parameters?.temperature || 0.7}, 
                          Max Tokens: {config.parameters?.max_tokens || 1000}
                          {config.providerId === 'azure' && config.parameters?.endpoint && (
                            <div className="text-xs mt-1">
                              Endpoint: {config.parameters.endpoint}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(config)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Configuration"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(config._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Configuration"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingConfig ? 'Edit Configuration' : 'Add New Configuration'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingConfig ? 'Update the model configuration' : 'Configure a new AI model'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider *
                </label>
                <select
                  value={formData.providerId}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      providerId: e.target.value,
                      modelId: '' // Reset model when provider changes
                    }))
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a provider</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model Selection */}
              {formData.providerId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <select
                    value={formData.modelId}
                    onChange={(e) => setFormData(prev => ({ ...prev, modelId: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a model</option>
                    {getProviderModels(formData.providerId).map(model => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key *
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter API key"
                  required
                />
              </div>

              {/* Parameters */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Parameters</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Temperature</label>
                    <input
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={formData.parameters.temperature}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, temperature: parseFloat(e.target.value) }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Tokens</label>
                    <input
                      type="number"
                      min="1"
                      max="8192"
                      value={formData.parameters.max_tokens}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, max_tokens: parseInt(e.target.value) }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Azure-specific parameters */}
                {formData.providerId === 'azure' && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-900">Azure Configuration</h5>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Endpoint</label>
                      <input
                        type="url"
                        value={formData.parameters.endpoint}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          parameters: { ...prev.parameters, endpoint: e.target.value }
                        }))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://your-resource.openai.azure.com/"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">API Version</label>
                        <input
                          type="text"
                          value={formData.parameters.apiVersion}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            parameters: { ...prev.parameters, apiVersion: e.target.value }
                          }))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="2024-02-15-preview"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Deployment Name</label>
                        <input
                          type="text"
                          value={formData.parameters.deploymentName}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            parameters: { ...prev.parameters, deploymentName: e.target.value }
                          }))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="gpt-4"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.providerId || !formData.modelId || !formData.apiKey}
                  className="flex items-center px-4 py-2 genzeon-gradient text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader className="animate-spin mr-2" size={16} />
                      {editingConfig ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      {editingConfig ? 'Update Configuration' : 'Add Configuration'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LLMConfiguration
