import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Key, Server, Settings, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

const ProviderManagement = () => {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProvider, setEditingProvider] = useState(null)
  const [formData, setFormData] = useState({
    providerId: '',
    modelId: '',
    apiKey: '',
    parameters: {
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    }
  })

  // Available provider options
  const providerOptions = [
    { id: 'openai', name: 'OpenAI', description: 'GPT models from OpenAI' },
    { id: 'anthropic', name: 'Anthropic', description: 'Claude models from Anthropic' },
    { id: 'google', name: 'Google', description: 'Gemini models from Google' },
    { id: 'groq', name: 'Groq', description: 'Fast inference models' },
    { id: 'azure', name: 'Azure OpenAI', description: 'OpenAI models via Azure' },
  ]

  // Model options for each provider
  const modelOptions = {
    openai: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'],
    anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    google: ['gemini-pro', 'gemini-pro-vision'],
    groq: ['llama2-70b-4096', 'mixtral-8x7b-32768', 'gemma-7b-it'],
    azure: ['gpt-4', 'gpt-35-turbo'],
  }

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      setLoading(true)
      // This would call your existing model config API
      const response = await fetch('/api/admin/model-configs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProviders(data.data || [])
      } else {
        throw new Error('Failed to fetch providers')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const url = editingProvider 
        ? `/api/admin/model-configs/${editingProvider._id}`
        : '/api/admin/model-configs'
      
      const method = editingProvider ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchProviders()
        setShowAddForm(false)
        setEditingProvider(null)
        setFormData({
          providerId: '',
          modelId: '',
          apiKey: '',
          parameters: {
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          }
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save provider')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (providerId) => {
    if (!confirm('Are you sure you want to delete this provider configuration? Users will no longer be able to use this model.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/model-configs/${providerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        await fetchProviders()
      } else {
        throw new Error('Failed to delete provider')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (provider) => {
    setEditingProvider(provider)
    setFormData({
      providerId: provider.providerId,
      modelId: provider.modelId,
      apiKey: provider.apiKey,
      parameters: provider.parameters || {
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }
    })
    setShowAddForm(true)
  }

  const maskApiKey = (apiKey) => {
    if (!apiKey) return 'Not configured'
    return apiKey.substring(0, 8) + '••••••••'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-whale-blue">Provider Management</h1>
          <p className="text-charcoal/70 mt-1">
            Manage which LLM providers and models are available for users
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchProviders}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-storm-grey/30 text-charcoal/70 rounded-lg hover:bg-lilly-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 genzeon-gradient text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={16} className="mr-2" />
            Add Provider
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start">
          <AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white shadow p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vibrant-blue mx-auto mb-4"></div>
          <p className="text-charcoal/70">Loading provider configurations...</p>
        </div>
      )}

      {/* Provider List */}
      {!loading && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {providers.length === 0 ? (
            <div className="p-8 text-center">
              <Server className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Providers Configured</h3>
              <p className="text-gray-500 mb-4">
                Add your first LLM provider to enable prompt testing for users.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 genzeon-gradient text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Plus size={16} className="mr-2" />
                Add First Provider
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      API Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {providers.map((provider) => (
                    <tr key={provider._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            provider.providerId === 'openai' ? 'bg-green-500' :
                            provider.providerId === 'anthropic' ? 'bg-purple-500' :
                            provider.providerId === 'google' ? 'bg-blue-500' :
                            provider.providerId === 'groq' ? 'bg-orange-500' :
                            provider.providerId === 'azure' ? 'bg-cyan-500' :
                            'bg-gray-500'
                          }`}></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {providerOptions.find(p => p.id === provider.providerId)?.name || provider.providerId}
                            </div>
                            <div className="text-sm text-gray-500">
                              {providerOptions.find(p => p.id === provider.providerId)?.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{provider.modelId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Key size={14} className="mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900 font-mono">
                            {maskApiKey(provider.apiKey)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CheckCircle size={14} className="mr-2 text-green-500" />
                          <span className="text-sm text-green-700">Active</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleEdit(provider)}
                          className="text-vibrant-blue hover:text-vibrant-blue/80"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(provider._id)}
                          className="text-red-600 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-whale-blue mb-4">
              {editingProvider ? 'Edit Provider Configuration' : 'Add New Provider'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-whale-blue mb-2">
                    Provider
                  </label>
                  <select
                    value={formData.providerId}
                    onChange={(e) => setFormData({...formData, providerId: e.target.value, modelId: ''})}
                    className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
                    required
                  >
                    <option value="">Select Provider</option>
                    {providerOptions.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-whale-blue mb-2">
                    Model
                  </label>
                  <select
                    value={formData.modelId}
                    onChange={(e) => setFormData({...formData, modelId: e.target.value})}
                    className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
                    required
                    disabled={!formData.providerId}
                  >
                    <option value="">Select Model</option>
                    {formData.providerId && modelOptions[formData.providerId]?.map(model => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-whale-blue mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                  className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent font-mono"
                  placeholder="Enter API key"
                  required
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-whale-blue mb-2">
                    Temperature
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={formData.parameters.temperature}
                    onChange={(e) => setFormData({
                      ...formData, 
                      parameters: {...formData.parameters, temperature: parseFloat(e.target.value)}
                    })}
                    className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-whale-blue mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.parameters.max_tokens}
                    onChange={(e) => setFormData({
                      ...formData, 
                      parameters: {...formData.parameters, max_tokens: parseInt(e.target.value)}
                    })}
                    className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-whale-blue mb-2">
                    Top P
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={formData.parameters.top_p}
                    onChange={(e) => setFormData({
                      ...formData, 
                      parameters: {...formData.parameters, top_p: parseFloat(e.target.value)}
                    })}
                    className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingProvider(null)
                    setFormData({
                      providerId: '',
                      modelId: '',
                      apiKey: '',
                      parameters: {
                        temperature: 0.7,
                        max_tokens: 4096,
                        top_p: 1,
                        frequency_penalty: 0,
                        presence_penalty: 0,
                      }
                    })
                  }}
                  className="px-4 py-2 border border-storm-grey/30 text-charcoal/70 rounded-lg hover:bg-lilly-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 genzeon-gradient text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingProvider ? 'Update Provider' : 'Add Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProviderManagement
