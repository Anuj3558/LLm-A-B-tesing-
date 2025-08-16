"use client"

import { Key, Eye, EyeOff, Check, ChevronDown, X } from "lucide-react"

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
  if (!showAddModelModal) return null

  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowAddModelModal(false)
    }
  }

  const updateFormField = (field, value) => {
    setAddModelForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden animate-pop-in max-h-[90vh] overflow-y-auto" onClick={handleModalClick}>
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Add New Model</h3>
            <p className="text-sm text-gray-500 mt-1">Configure a new AI model</p>
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
        <div className="p-6 space-y-4">
          {/* Model Selection */}
          <div>
            <label htmlFor="modelId" className="block text-sm font-medium text-gray-700 mb-1">
              Model <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="modelId"
                value={addModelForm.modelId}
                onChange={(e) => updateFormField('modelId', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-8"
                required
              >
                <option value="">Select a model</option>
                {availableModels.map((model) => (
                  <option key={model.id} value={model._id}>{model.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

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
                onChange={(e) => updateFormField('apiKey', e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter API key"
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
          </div>

          {/* Max Tokens */}
          <div>
            <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700 mb-1">
              Max Tokens <span className="text-red-500">*</span>
            </label>
            <input
              id="maxTokens"
              type="number"
              value={addModelForm.maxTokens}
              onChange={(e) => updateFormField('maxTokens', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              min="1"
              max="100000"
              required
            />
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
              onChange={(e) => updateFormField('temperature', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Top P */}
          <div>
            <label htmlFor="topP" className="block text-sm font-medium text-gray-700 mb-1">
              Top P ({addModelForm.topP})
            </label>
            <input
              id="topP"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={addModelForm.topP}
              onChange={(e) => updateFormField('topP', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Frequency Penalty */}
          <div>
            <label htmlFor="frequencyPenalty" className="block text-sm font-medium text-gray-700 mb-1">
              Frequency Penalty ({addModelForm.frequencyPenalty})
            </label>
            <input
              id="frequencyPenalty"
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={addModelForm.frequencyPenalty}
              onChange={(e) => updateFormField('frequencyPenalty', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Presence Penalty */}
          <div>
            <label htmlFor="presencePenalty" className="block text-sm font-medium text-gray-700 mb-1">
              Presence Penalty ({addModelForm.presencePenalty})
            </label>
            <input
              id="presencePenalty"
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={addModelForm.presencePenalty}
              onChange={(e) => updateFormField('presencePenalty', parseFloat(e.target.value))}
              className="w-full"
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
                onChange={(e) => updateFormField('enabled', e.target.value === "enabled")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-8"
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
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

export default AddModelModal