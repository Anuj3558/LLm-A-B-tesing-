"use client"

import { Key, Trash2 } from "lucide-react"
import { useEffect } from "react"

const ModelCard = ({ 
  model, 
  updateModelConfig, 
  handleModelToggle, 
  setSelectedModel, 
  setShowDeleteModal 
}) => {
  const { _id, modelConfig, model: modelInfo, isActive } = model
  
  // Use isActive from the model object, fallback to modelConfig.isActive
  const modelIsActive = isActive !== undefined ? isActive : modelConfig?.isActive || false
  
  console.log('Model active state:', modelIsActive)
  
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {/* Toggle Button */}
          <button
            onClick={() => handleModelToggle(_id)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mr-3 ${
              modelIsActive 
                ? 'bg-blue-600' 
                : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                modelIsActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {modelInfo?.name || 'Unknown Model'}
            </h3>
            <p className="text-sm text-gray-500">
              {modelInfo?.provider} • {modelInfo?.category || 'General'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`px-3 py-1 text-xs rounded-full ${
              modelIsActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {modelIsActive ? "Active" : "Inactive"}
          </div>
          <button
            onClick={() => {
              setSelectedModel(_id)
              setShowDeleteModal(true)
            }}
            className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Model Description */}
      {modelInfo?.description && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">{modelInfo.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* API Key */}
        <div className="md:col-span-2">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Key size={16} className="mr-2" />
            API Key
          </label>
          <input
            type="password"
            value={modelConfig?.apiKey || ''}
            onChange={(e) => updateModelConfig(_id, "apiKey", e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !modelIsActive ? 'bg-gray-50 text-gray-500' : ''
            }`}
            disabled={!modelIsActive}
            placeholder="Enter API key for this model..."
          />
        </div>

        {/* Max Tokens */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Tokens</label>
          <input
            type="number"
            value={modelConfig?.maxTokens || 4000}
            onChange={(e) => updateModelConfig(_id, "maxTokens", parseInt(e.target.value))}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !modelIsActive ? 'bg-gray-50 text-gray-500' : ''
            }`}
            disabled={!modelIsActive}
            min="1"
            max="32000"
          />
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Temperature ({modelConfig?.temperature || 0.7})
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={modelConfig?.temperature || 0.7}
            onChange={(e) => updateModelConfig(_id, "temperature", parseFloat(e.target.value))}
            className={`w-full ${!modelIsActive ? 'opacity-50' : ''}`}
            disabled={!modelIsActive}
          />
        </div>

        {/* Top P */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Top P ({modelConfig?.topP || 1})
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={modelConfig?.topP || 1}
            onChange={(e) => updateModelConfig(_id, "topP", parseFloat(e.target.value))}
            className={`w-full ${!modelIsActive ? 'opacity-50' : ''}`}
            disabled={!modelIsActive}
          />
        </div>

        {/* Frequency Penalty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequency Penalty ({modelConfig?.frequencyPenalty || 0})
          </label>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={modelConfig?.frequencyPenalty || 0}
            onChange={(e) => updateModelConfig(_id, "frequencyPenalty", parseFloat(e.target.value))}
            className={`w-full ${!modelIsActive ? 'opacity-50' : ''}`}
            disabled={!modelIsActive}
          />
        </div>

        {/* Presence Penalty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Presence Penalty ({modelConfig?.presencePenalty || 0})
          </label>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={modelConfig?.presencePenalty || 0}
            onChange={(e) => updateModelConfig(_id, "presencePenalty", parseFloat(e.target.value))}
            className={`w-full ${!modelIsActive ? 'opacity-50' : ''}`}
            disabled={!modelIsActive}
          />
        </div>
      </div>

      {/* Model Metadata */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <span className="font-medium">Created:</span> {new Date(model.createdAt).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Updated:</span> {new Date(model.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelCard