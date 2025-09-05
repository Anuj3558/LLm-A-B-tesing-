"use client"

import { useState, useEffect } from "react"
import { Save, RotateCcw, Settings, Key, Globe, Database, Search, Plus, X, Eye, EyeOff, Check, ChevronDown, Trash2, Edit3 } from "lucide-react"

// Comprehensive provider and model data
const AI_PROVIDERS = {
  openai: {
    name: "OpenAI",
    models: [
      { id: "gpt-4", name: "GPT-4", description: "Most capable GPT-4 model" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Latest GPT-4 Turbo model" },
      { id: "gpt-4-turbo-preview", name: "GPT-4 Turbo Preview", description: "Preview of GPT-4 Turbo" },
      { id: "gpt-4-0314", name: "GPT-4 (March 2023)", description: "GPT-4 snapshot from March 14, 2023" },
      { id: "gpt-4-0613", name: "GPT-4 (June 2023)", description: "GPT-4 snapshot from June 13, 2023" },
      { id: "gpt-4-1106-preview", name: "GPT-4 Turbo (November 2023)", description: "GPT-4 Turbo preview model" },
      { id: "gpt-4-0125-preview", name: "GPT-4 Turbo (January 2024)", description: "Latest GPT-4 Turbo preview" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Most capable GPT-3.5 model" },
      { id: "gpt-3.5-turbo-16k", name: "GPT-3.5 Turbo 16K", description: "Extended context GPT-3.5" },
      { id: "gpt-3.5-turbo-0301", name: "GPT-3.5 Turbo (March 2023)", description: "GPT-3.5 Turbo snapshot" },
      { id: "gpt-3.5-turbo-0613", name: "GPT-3.5 Turbo (June 2023)", description: "GPT-3.5 Turbo snapshot" },
      { id: "gpt-3.5-turbo-1106", name: "GPT-3.5 Turbo (November 2023)", description: "Latest GPT-3.5 Turbo" },
      { id: "text-davinci-003", name: "Davinci 003", description: "Most capable GPT-3 model" },
      { id: "text-davinci-002", name: "Davinci 002", description: "GPT-3 Davinci model" },
      { id: "code-davinci-002", name: "Codex Davinci", description: "Code generation model" },
    ]
  },
  anthropic: {
    name: "Anthropic",
    models: [
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "Most intelligent Claude model" },
      { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet", description: "Balanced Claude model" },
      { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", description: "Fastest Claude model" },
      { id: "claude-2.1", name: "Claude 2.1", description: "Updated Claude 2 model" },
      { id: "claude-2.0", name: "Claude 2.0", description: "Claude 2 base model" },
      { id: "claude-instant-1.2", name: "Claude Instant 1.2", description: "Fast Claude model" },
      { id: "claude-instant-1.1", name: "Claude Instant 1.1", description: "Claude Instant model" },
    ]
  },
  google: {
    name: "Google",
    models: [
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Latest Gemini Pro model" },
      { id: "gemini-1.0-pro", name: "Gemini 1.0 Pro", description: "Gemini Pro model" },
      { id: "gemini-pro", name: "Gemini Pro", description: "Google's most capable model" },
      { id: "gemini-pro-vision", name: "Gemini Pro Vision", description: "Multimodal Gemini model" },
      { id: "text-bison-001", name: "PaLM 2 Text Bison", description: "PaLM 2 for text" },
      { id: "chat-bison-001", name: "PaLM 2 Chat Bison", description: "PaLM 2 for conversations" },
      { id: "codechat-bison-001", name: "PaLM 2 Code Chat", description: "PaLM 2 for code" },
    ]
  },
  meta: {
    name: "Meta",
    models: [
      { id: "llama-2-70b-chat", name: "Llama 2 70B Chat", description: "Largest Llama 2 chat model" },
      { id: "llama-2-13b-chat", name: "Llama 2 13B Chat", description: "Medium Llama 2 chat model" },
      { id: "llama-2-7b-chat", name: "Llama 2 7B Chat", description: "Smallest Llama 2 chat model" },
      { id: "llama-2-70b", name: "Llama 2 70B", description: "Largest Llama 2 base model" },
      { id: "llama-2-13b", name: "Llama 2 13B", description: "Medium Llama 2 base model" },
      { id: "llama-2-7b", name: "Llama 2 7B", description: "Smallest Llama 2 base model" },
      { id: "code-llama-34b", name: "Code Llama 34B", description: "Large Code Llama model" },
      { id: "code-llama-13b", name: "Code Llama 13B", description: "Medium Code Llama model" },
      { id: "code-llama-7b", name: "Code Llama 7B", description: "Small Code Llama model" },
    ]
  },
  mistral: {
    name: "Mistral AI",
    models: [
      { id: "mistral-large", name: "Mistral Large", description: "Largest Mistral model" },
      { id: "mistral-medium", name: "Mistral Medium", description: "Medium Mistral model" },
      { id: "mistral-small", name: "Mistral Small", description: "Small Mistral model" },
      { id: "mistral-tiny", name: "Mistral Tiny", description: "Tiniest Mistral model" },
      { id: "mixtral-8x7b", name: "Mixtral 8x7B", description: "Mixture of experts model" },
    ]
  },
  cohere: {
    name: "Cohere",
    models: [
      { id: "command", name: "Command", description: "Cohere's flagship model" },
      { id: "command-light", name: "Command Light", description: "Lighter version of Command" },
      { id: "command-nightly", name: "Command Nightly", description: "Latest Command model" },
      { id: "command-r", name: "Command R", description: "Command model with retrieval" },
      { id: "command-r-plus", name: "Command R+", description: "Enhanced Command R model" },
    ]
  },
  together: {
    name: "Together AI",
    models: [
      { id: "togethercomputer/llama-2-70b-chat", name: "Llama 2 70B Chat", description: "Together's Llama 2 70B" },
      { id: "togethercomputer/llama-2-13b-chat", name: "Llama 2 13B Chat", description: "Together's Llama 2 13B" },
      { id: "togethercomputer/falcon-40b", name: "Falcon 40B", description: "Falcon large model" },
      { id: "togethercomputer/falcon-7b", name: "Falcon 7B", description: "Falcon small model" },
    ]
  },
  huggingface: {
    name: "Hugging Face",
    models: [
      { id: "microsoft/DialoGPT-large", name: "DialoGPT Large", description: "Conversational model" },
      { id: "microsoft/DialoGPT-medium", name: "DialoGPT Medium", description: "Medium conversational model" },
      { id: "facebook/blenderbot-400M-distill", name: "BlenderBot 400M", description: "Conversational AI" },
      { id: "google/flan-t5-xxl", name: "FLAN-T5 XXL", description: "Instruction-tuned T5" },
      { id: "google/flan-t5-xl", name: "FLAN-T5 XL", description: "Large instruction-tuned T5" },
    ]
  },
  custom: {
    name: "Custom/Other",
    models: [
      { id: "custom", name: "Custom Model", description: "Manually specify model name" },
    ]
  }
};

// Add Model Modal Component
const AddModelModal = ({ 
  showAddModelModal, 
  setShowAddModelModal, 
  addModelForm, 
  setAddModelForm, 
  showApiKey, 
  setShowApiKey, 
  addModelLoading, 
  handleAddModel, 
  isFormValid,
  availableModels 
}) => {
  const [selectedProvider, setSelectedProvider] = useState('')
  const [filteredModels, setFilteredModels] = useState([])
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customModelName, setCustomModelName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter models based on selected provider and search query
  useEffect(() => {
    if (!selectedProvider) {
      setFilteredModels([])
      return
    }
    
    let models = AI_PROVIDERS[selectedProvider]?.models || []
    
    if (searchQuery) {
      models = models.filter(model => 
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    setFilteredModels(models)
  }, [selectedProvider, searchQuery])

  // Handle provider change
  const handleProviderChange = (provider) => {
    setSelectedProvider(provider)
    setAddModelForm({...addModelForm, modelId: ''})
    setShowCustomInput(provider === 'custom')
    setCustomModelName('')
    setSearchQuery('')
  }

  // Handle model selection
  const handleModelSelect = (modelId) => {
    if (modelId === 'custom') {
      setShowCustomInput(true)
      setAddModelForm({...addModelForm, modelId: ''})
    } else {
      setShowCustomInput(false)
      setAddModelForm({...addModelForm, modelId})
    }
  }

  // Handle custom model input
  const handleCustomModelChange = (value) => {
    setCustomModelName(value)
    setAddModelForm({...addModelForm, modelId: value})
  }

  if (!showAddModelModal) return null

  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowAddModelModal(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden animate-pop-in" onClick={handleModalClick}>
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Add New Model</h3>
            <p className="text-sm text-gray-500 mt-1">Configure a new AI model with comprehensive provider selection</p>
          </div>
          <button
            onClick={() => setShowAddModelModal(false)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            type="button"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Provider <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleProviderChange(key)}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    selectedProvider === key 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm">{provider.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{provider.models.length} models</div>
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          {selectedProvider && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model <span className="text-red-500">*</span>
              </label>
              
              {/* Search Bar for Models */}
              {selectedProvider !== 'custom' && (
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search models..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Custom Model Input */}
              {showCustomInput ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Edit3 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Enter custom model name (e.g., my-custom-model-v1)"
                      value={customModelName}
                      onChange={(e) => handleCustomModelChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter the exact model name as required by your provider's API
                  </p>
                </div>
              ) : (
                /* Model Selection Grid */
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {filteredModels.length > 0 ? (
                    filteredModels.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => handleModelSelect(model.id)}
                        className={`p-3 text-left rounded-lg transition-all ${
                          addModelForm.modelId === model.id 
                            ? 'bg-blue-50 border-blue-500 border' 
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="font-medium text-sm">{model.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{model.description}</div>
                        <div className="text-xs text-blue-600 mt-1 font-mono">{model.id}</div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No models found</p>
                      {searchQuery && (
                        <p className="text-sm mt-1">Try a different search term</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Add custom option for non-custom providers */}
              {selectedProvider !== 'custom' && (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <Edit3 size={14} className="mr-1" />
                  {showCustomInput ? 'Choose from list' : 'Enter custom model name'}
                </button>
              )}
            </div>
          )}

          {/* API Key Field */}
          <div>
            <label htmlFor="apiKey" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Key size={16} className="mr-2" />
              API Key <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                required
                value={addModelForm.apiKey}
                onChange={(e) => setAddModelForm({...addModelForm, apiKey: e.target.value})}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter API key for the selected provider"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showApiKey ? "Hide API key" : "Show API key"}
              >
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {selectedProvider && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedProvider === 'openai' && 'Get your API key from https://platform.openai.com/api-keys'}
                {selectedProvider === 'anthropic' && 'Get your API key from https://console.anthropic.com'}
                {selectedProvider === 'google' && 'Get your API key from https://makersuite.google.com/app/apikey'}
                {selectedProvider === 'cohere' && 'Get your API key from https://dashboard.cohere.ai/api-keys'}
                {selectedProvider === 'mistral' && 'Get your API key from https://console.mistral.ai'}
                {selectedProvider === 'together' && 'Get your API key from https://api.together.xyz/settings/api-keys'}
                {selectedProvider === 'huggingface' && 'Get your API key from https://huggingface.co/settings/tokens'}
                {selectedProvider === 'custom' && 'Enter the API key required by your custom provider'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Max Tokens */}
            <div>
              <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700 mb-1">
                Max Tokens
              </label>
              <input
                id="maxTokens"
                type="number"
                value={addModelForm.maxTokens}
                onChange={(e) => setAddModelForm({...addModelForm, maxTokens: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                min="1"
                max="100000"
                placeholder="4000"
              />
            </div>

            {/* Status Field */}
            <div>
              <label htmlFor="enabled" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="relative">
                <select
                  id="enabled"
                  value={addModelForm.enabled ? "enabled" : "disabled"}
                  onChange={(e) => setAddModelForm({...addModelForm, enabled: e.target.value === "enabled"})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-8"
                >
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {/* Temperature */}
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
              Temperature ({addModelForm.temperature})
            </label>
            <input
              id="temperature"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={addModelForm.temperature}
              onChange={(e) => setAddModelForm({...addModelForm, temperature: parseFloat(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>More Focused (0.0)</span>
              <span>More Creative (2.0)</span>
            </div>
          </div>

          {/* Model Info Display */}
          {addModelForm.modelId && selectedProvider && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Model Configuration</h4>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Provider:</span> {AI_PROVIDERS[selectedProvider]?.name}</div>
                <div><span className="font-medium">Model:</span> {addModelForm.modelId}</div>
                <div><span className="font-medium">Max Tokens:</span> {addModelForm.maxTokens || 'Default'}</div>
                <div><span className="font-medium">Temperature:</span> {addModelForm.temperature}</div>
                <div><span className="font-medium">Status:</span> {addModelForm.enabled ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setShowAddModelModal(false)}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddModel}
            disabled={addModelLoading || !isFormValid()}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium ${
              addModelLoading || !isFormValid() ? 'opacity-50 cursor-not-allowed' : ''
            } flex items-center`}
          >
            {addModelLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              <>
                <Check className="mr-2" size={16} />
                Add Model
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Delete Confirmation Modal
const DeleteModelModal = ({ 
  showDeleteModal, 
  setShowDeleteModal, 
  selectedModel, 
  handleDeleteModel 
}) => {
  if (!showDeleteModal || !selectedModel) return null

  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowDeleteModal(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden animate-pop-in" onClick={handleModalClick}>
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-50 to-pink-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Delete Model</h3>
            <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(false)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            type="button"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <Trash2 size={20} />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">Are you sure you want to delete this model?</h4>
              <p className="mt-1 text-sm text-gray-500">
                This will permanently delete <span className="font-semibold">{selectedModel}</span> and all its configurations.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteModel(selectedModel)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
            type="button"
          >
            <Trash2 className="mr-2" size={16} />
            Delete Model
          </button>
        </div>
      </div>
    </div>
  )
}

const GlobalConfig = () => {
  const [activeTab, setActiveTab] = useState("models")
  const [searchTerm, setSearchTerm] = useState("")
  const [config, setConfig] = useState({
    models: {},
    platform: {
      defaultTimeout: 30,
      maxConcurrentRequests: 10,
      rateLimitPerUser: 100,
      enableLogging: true,
      enableAnalytics: true,
    },
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
    enabled: true
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [addModelLoading, setAddModelLoading] = useState(false)
  const [availableModels, setAvailableModels] = useState([])

  const tabs = [
    { id: "models", name: "Models", icon: Database },
    { id: "platform", name: "Platform", icon: Globe },
    { id: "json", name: "JSON View", icon: Settings },
  ]

  // Get backend URL based on environment
  const API_BASE_URL = import.meta.env.PROD 
    ? 'https://genzeon-ab.onrender.com/api'
    : 'http://localhost:5000/api'

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

  // Fetch configuration from API
  const fetchConfig = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/global-config`, {
        headers: getApiHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch configuration')
      }

      const data = await response.json()
      setConfig(data.config || config)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching config:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch available models from API
  const fetchAvailableModels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/available-models`, {
        headers: getApiHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch available models')
      }

      const data = await response.json()
      setAvailableModels(data.models || [])
    } catch (err) {
      console.error('Error fetching available models:', err)
      // Fallback to default models if API fails
      setAvailableModels([
        { id: "gpt-4", name: "GPT-4" },
        { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
        { id: "claude-3", name: "Claude 3" },
        { id: "gemini-pro", name: "Gemini Pro" },
        { id: "llama-2", name: "Llama 2" },
      ])
    }
  }

  // Save configuration to API
  const handleConfigSave = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/global-config`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ config })
      })

      if (!response.ok) {
        throw new Error('Failed to save configuration')
      }

      setSuccess('Configuration saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error saving config:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfigReset = () => {
    setConfig({
      models: {},
      platform: {
        defaultTimeout: 30,
        maxConcurrentRequests: 10,
        rateLimitPerUser: 100,
        enableLogging: true,
        enableAnalytics: true,
      },
    })
  }

  // Load configuration on component mount
  useEffect(() => {
    fetchConfig()
    fetchAvailableModels()
  }, [])

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
      const newModel = {
        enabled: addModelForm.enabled,
        apiKey: addModelForm.apiKey.trim(),
        maxTokens: addModelForm.maxTokens,
        temperature: addModelForm.temperature,
        topP: addModelForm.topP,
        frequencyPenalty: addModelForm.frequencyPenalty,
        presencePenalty: addModelForm.presencePenalty,
      }

      setConfig(prev => ({
        ...prev,
        models: {
          ...prev.models,
          [addModelForm.modelId]: newModel
        }
      }))

      // Reset form and close modal
      setAddModelForm({
        modelId: "",
        apiKey: "",
        maxTokens: 4000,
        temperature: 0.7,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        enabled: true
      })
      setShowAddModelModal(false)
      
      setSuccess('Model added successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error adding model:', err)
    } finally {
      setAddModelLoading(false)
    }
  }

  // Delete model
  const handleDeleteModel = async (modelId) => {
    try {
      setConfig(prev => {
        const newModels = { ...prev.models }
        delete newModels[modelId]
        return {
          ...prev,
          models: newModels
        }
      })

      setShowDeleteModal(false)
      setSelectedModel(null)
      
      setSuccess('Model deleted successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error deleting model:', err)
    }
  }

  const handleModelToggle = (modelId) => {
    setConfig((prev) => ({
      ...prev,
      models: {
        ...prev.models,
        [modelId]: {
          ...prev.models[modelId],
          enabled: !prev.models[modelId].enabled,
        },
      },
    }))
  }

  const updateModelConfig = (modelId, field, value) => {
    setConfig((prev) => ({
      ...prev,
      models: {
        ...prev.models,
        [modelId]: {
          ...prev.models[modelId],
          [field]: value,
        },
      },
    }))
  }

  const updatePlatformConfig = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      platform: {
        ...prev.platform,
        [field]: value,
      },
    }))
  }

  // Filter models based on search term
  const filteredModels = Object.entries(config.models).filter(([modelId]) =>
    modelId.toLowerCase().includes(searchTerm.toLowerCase())
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
          {searchTerm ? 'No models found matching your search' : 'No models configured yet'}
        </div>
      ) : (
        filteredModels.map(([modelId, modelConfig]) => (
          <div key={modelId} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={modelConfig.enabled}
                  onChange={() => handleModelToggle(modelId)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {modelId.replace("-", " ")}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`px-3 py-1 text-xs rounded-full ${
                    modelConfig.enabled
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {modelConfig.enabled ? "Enabled" : "Disabled"}
                </div>
                <button
                  onClick={() => {
                    setSelectedModel(modelId)
                    setShowDeleteModal(true)
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* API Key */}
              <div className="md:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Key size={16} className="mr-2" />
                  API Key
                </label>
                <input
                  type="password"
                  value={modelConfig.apiKey}
                  onChange={(e) => updateModelConfig(modelId, "apiKey", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!modelConfig.enabled}
                />
              </div>

              {/* Max Tokens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Tokens</label>
                <input
                  type="number"
                  value={modelConfig.maxTokens}
                  onChange={(e) => updateModelConfig(modelId, "maxTokens", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!modelConfig.enabled}
                />
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature ({modelConfig.temperature})
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={modelConfig.temperature}
                  onChange={(e) => updateModelConfig(modelId, "temperature", parseFloat(e.target.value))}
                  className="w-full"
                  disabled={!modelConfig.enabled}
                />
              </div>

              {/* Top P */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top P ({modelConfig.topP})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={modelConfig.topP}
                  onChange={(e) => updateModelConfig(modelId, "topP", parseFloat(e.target.value))}
                  className="w-full"
                  disabled={!modelConfig.enabled}
                />
              </div>

              {/* Frequency Penalty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency Penalty ({modelConfig.frequencyPenalty})
                </label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={modelConfig.frequencyPenalty}
                  onChange={(e) => updateModelConfig(modelId, "frequencyPenalty", parseFloat(e.target.value))}
                  className="w-full"
                  disabled={!modelConfig.enabled}
                />
              </div>

              {/* Presence Penalty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presence Penalty ({modelConfig.presencePenalty})
                </label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={modelConfig.presencePenalty}
                  onChange={(e) => updateModelConfig(modelId, "presencePenalty", parseFloat(e.target.value))}
                  className="w-full"
                  disabled={!modelConfig.enabled}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )

  const renderPlatformTab = () => (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Timeout (seconds)</label>
            <input
              type="number"
              value={config.platform.defaultTimeout}
              onChange={(e) => updatePlatformConfig("defaultTimeout", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Concurrent Requests</label>
            <input
              type="number"
              value={config.platform.maxConcurrentRequests}
              onChange={(e) => updatePlatformConfig("maxConcurrentRequests", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rate Limit Per User</label>
            <input
              type="number"
              value={config.platform.rateLimitPerUser}
              onChange={(e) => updatePlatformConfig("rateLimitPerUser", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Enable Logging</div>
              <div className="text-sm text-gray-500">Log all API requests and responses</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.platform.enableLogging}
                onChange={(e) => updatePlatformConfig("enableLogging", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Enable Analytics</div>
              <div className="text-sm text-gray-500">Collect usage analytics and metrics</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.platform.enableAnalytics}
                onChange={(e) => updatePlatformConfig("enableAnalytics", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderJsonTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">JSON Configuration</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleConfigReset}
            className="flex items-center px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={16} className="mr-1" />
            Reset
          </button>
          <button
            onClick={handleConfigSave}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "models":
        return renderModelsTab()
      case "platform":
        return renderPlatformTab()
      case "json":
        return renderJsonTab()
      default:
        return renderModelsTab()
    }
  }

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
            onClick={handleConfigSave}
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