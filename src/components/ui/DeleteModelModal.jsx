"use client"

import { X, Trash2 } from "lucide-react"

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

export default DeleteModelModal