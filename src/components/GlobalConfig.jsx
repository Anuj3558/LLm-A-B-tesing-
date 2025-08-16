"use client"

import { useState, useEffect } from "react"
import { Save, RotateCcw, Settings, Key, Globe, Database, Search, Plus, X, Eye, EyeOff, Check, ChevronDown, Trash2 } from "lucide-react"
import AddModelModal from "./ui/AddModelModal"
import DeleteModelModal from "./ui/DeleteModelModal"
import ModelCard from "./ui/ModelCard"
import PlatformSettings from "./ui/PlatformSettings"
import JsonView from "./ui/JsonView"

const GlobalConfig = () => {
  const [activeTab, setActiveTab] = useState("models")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Updated state structure to match backend
  const [adminModels, setAdminModels] = useState([])
  const [platformConfig, setPlatformConfig] = useState({
    defaultTimeout: 30,
    maxConcurrentRequests: 10,
    rateLimitPerUser: 100,
    enableLogging: true,
    enableAnalytics: true,
  })

  // Modal states
  const [showAddModelModal, setShowAddModelModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedModel, setSelectedModel] = useState(null)
  
  // Loading and error states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Add Model Form State
  const [addModelForm, setAddModelForm] = useState({
    modelId: "",
    apiKey: "",
    maxTokens: 4000,
    temperature: 0.7,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    isActive: true
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [addModelLoading, setAddModelLoading] = useState(false)
  const [availableModels, setAvailableModels] = useState([])

  const tabs = [
    { id: "models", name: "Models", icon: Database },
    { id: "platform", name: "Platform", icon: Globe },
    { id: "json", name: "JSON View", icon: Settings },
  ]

  // Get backend URL from environment variables
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

  const getCookie = (name) => {
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }

  // Get auth token from cookie
  const getAuthToken = () => {
    return getCookie('authToken')
  }

  // API Headers with authorization
  const getApiHeaders = () => {
    const token = getAuthToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  // Fetch admin models from API
  const fetchAdminModels = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/models-raw`, {
        headers: getApiHeaders()
      })

      if (!response.ok) {
        if (response.status === 404) {
          // No models found, set empty array
          setAdminModels([])
          return
        }
        throw new Error('Failed to fetch admin models')
      }

      const data = await response.json()
      setAdminModels(data.data || [])
      
      // Set platform config from the first model's platform config if available
      if (data.data && data.data.length > 0 && data.data[0].platformConfig) {
        setPlatformConfig(data.data[0].platformConfig)
      }
    } catch (err) {
      setError(err.message)
      console.error('Error fetching admin models:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch available models from API
  const fetchAvailableModels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/llm/list`, {
        headers: getApiHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch available models')
      }
     
      const data = await response.json()
      console.log('Available models:', data)
      setAvailableModels(data?.data || [])
    } catch (err) {
      console.error('Error fetching available models:', err)
      // Fallback to default models if API fails
      setAvailableModels([
        { _id: "1", name: "GPT-4", provider: "OpenAI" },
        { _id: "2", name: "GPT-3.5 Turbo", provider: "OpenAI" },
        { _id: "3", name: "Claude 3", provider: "Anthropic" },
        { _id: "4", name: "Gemini Pro", provider: "Google" },
        { _id: "5", name: "Llama 2", provider: "Meta" },
      ])
    }
  }

  // Save platform configuration to API
  const handlePlatformConfigSave = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/platform-config`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify({ platformConfig })
      })

      if (!response.ok) {
        throw new Error('Failed to save platform configuration')
      }

      setSuccess('Platform configuration saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error saving platform config:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfigReset = () => {
    setAdminModels([])
    setPlatformConfig({
      defaultTimeout: 30,
      maxConcurrentRequests: 10,
      rateLimitPerUser: 100,
      enableLogging: true,
      enableAnalytics: true,
    })
  }

  // Check if add model form is valid
  const isAddModelFormValid = () => {
    return (
      addModelForm.modelId.trim() !== "" &&
      addModelForm.apiKey.trim() !== "" &&
      addModelForm.maxTokens > 0
    )
  }

  // Add new model
  const handleAddModel = async () => {
    if (!isAddModelFormValid()) {
      setError('Please fill in all required fields')
      return
    }

    setAddModelLoading(true)
    setError(null)

    try {
      console.log('Adding model to server:', addModelForm)
      const response = await fetch(`${API_BASE_URL}/admin/add-model`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          modelId: addModelForm.modelId,
          config: {
            isActive: addModelForm.isActive,
            apiKey: addModelForm.apiKey.trim(),
            maxTokens: addModelForm.maxTokens,
            temperature: addModelForm.temperature,
            topP: addModelForm.topP,
            frequencyPenalty: addModelForm.frequencyPenalty,
            presencePenalty: addModelForm.presencePenalty,
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save model to server')
      }
  
      const data = await response.json()
      
      // Add the new model to the list
      setAdminModels(prev => [data.data, ...prev])

      // Reset form and close modal
      setAddModelForm({
        modelId: "",
        apiKey: "",
        maxTokens: 4000,
        temperature: 0.7,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        isActive: true
      })
      setShowAddModelModal(false)
      
      setSuccess('Model added successfully!')
      setTimeout(() => setSuccess(null), 3000)
      window.location.reload() // Reload to fetch updated models
    } catch (err) {
      setError(err.message)
      console.error('Error adding model:', err)
    } finally {
      setAddModelLoading(false)
    }
  }

  // Delete model
  const handleDeleteModel = async (modelConfigId) => {
    try {
      const model = adminModels.find(m => m._id === modelConfigId)
      const response = await fetch(`${API_BASE_URL}/admin/models/${model.modelConfig._id}`, {
        method: 'DELETE',
        headers: getApiHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to delete model from server')
      }

      // Remove the model from the list
      setAdminModels(prev => prev.filter(model => model._id !== modelConfigId))

      setShowDeleteModal(false)
      setSelectedModel(null)
      
      setSuccess('Model deleted successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error deleting model:', err)
    }
  }

  // Toggle model active status
  const handleModelToggle = async (modelConfigId) => {
    try {
      const model = adminModels.find(m => m._id === modelConfigId)
      console.log('Toggling model:', model.modelConfig._id)
      if (!model) return

      const response = await fetch(`${API_BASE_URL}/admin/models/${model.modelConfig._id}/toggle`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify({ isActive: !model.isActive })
      })
      
      if (!response.ok) {
        throw new Error('Failed to toggle model status')
      }
     
      // Update the model in the list
      setAdminModels(prev => prev.map(m => 
        m._id === modelConfigId 
          ? { ...m, isActive: !m.isActive }
          : m
      ))
     
    } catch (err) {
      setError(err.message)
      console.error('Error toggling model:', err)
    }
  }

  // Update model configuration
  const updateModelConfig = async (modelConfigId, field, value) => {
    const model = adminModels.find(m => m._id === modelConfigId)
    console.log(field)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/models/${model.modelConfig._id}`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify({ [field]: value })
      })

      if (!response.ok) {
        throw new Error('Failed to update model configuration')
      }

      // Update the model in the list
      setAdminModels(prev => prev.map(model => 
        model._id === modelConfigId 
          ? { 
              ...model, 
              modelConfig: { 
                ...model.modelConfig, 
                [field]: value 
              }
            }
          : model
      ))
    } catch (err) {
      setError(err.message)
      console.error('Error updating model config:', err)
    }
  }

  const updatePlatformConfig = (field, value) => {
    setPlatformConfig(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // Filter models based on search term
  const filteredModels = adminModels.filter(model =>
    model.model?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.model?.provider?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderModelsTab = () => (
    <div className="space-y-6">
      {/* Search and Add Model */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <button 
          onClick={() => setShowAddModelModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Add Model
        </button>
      </div>

      {/* Models List */}
      {filteredModels.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No models found matching your search' : 'No models configured yet' }
        </div>
      ) : (
        filteredModels.map((model) => (
          <ModelCard
            key={model._id}
            model={model}
            updateModelConfig={updateModelConfig}
            handleModelToggle={handleModelToggle}
            setSelectedModel={setSelectedModel}
            setShowDeleteModal={setShowDeleteModal}
          />
        ))
      )}
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "models":
        return renderModelsTab()
      case "platform":
        return <PlatformSettings config={{ platform: platformConfig }} updatePlatformConfig={updatePlatformConfig} onSave={handlePlatformConfigSave} />
      case "json":
        return <JsonView 
          config={{ models: adminModels, platform: platformConfig }} 
          handleConfigReset={handleConfigReset} 
          handleConfigSave={handlePlatformConfigSave} 
        />
      default:
        return renderModelsTab()
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchAdminModels()
    fetchAvailableModels()
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Global Configuration</h1>
        <p className="text-gray-500">Configure platform-wide settings and model parameters</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon size={16} className="mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {renderTabContent()}
      </div>

      {/* Save Button Bar */}
      <div className="fixed bottom-6 right-6">
        <div className="flex space-x-2">
          <button
            onClick={handleConfigReset}
            className="flex items-center px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
          >
            <RotateCcw size={16} className="mr-2" />
            Reset All
          </button>
          <button
            onClick={handlePlatformConfigSave}
            className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Save size={16} className="mr-2" />
            Save Configuration
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddModelModal
        showAddModelModal={showAddModelModal}
        setShowAddModelModal={setShowAddModelModal}
        addModelForm={addModelForm}
        setAddModelForm={setAddModelForm}
        showApiKey={showApiKey}
        setShowApiKey={setShowApiKey}
        addModelLoading={addModelLoading}
        handleAddModel={handleAddModel}
        isFormValid={isAddModelFormValid}
        availableModels={availableModels}
      />

      <DeleteModelModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        selectedModel={selectedModel}
        handleDeleteModel={handleDeleteModel}
      />
    </div>
  )
}

export default GlobalConfig