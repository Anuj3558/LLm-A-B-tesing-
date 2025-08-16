"use client"

import { RotateCcw, Save } from "lucide-react"

const JsonView = ({ config, handleConfigReset, handleConfigSave }) => {
  return (
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
}

export default JsonView