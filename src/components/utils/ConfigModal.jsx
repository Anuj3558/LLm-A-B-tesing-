"use client";

import { useState, useEffect } from "react";
import {
  X,
  ToggleLeft,
  ToggleRight,
  Check,
  ChevronDown,
  Trash2,
} from "lucide-react";

const ConfigModal = ({
  showConfigModal,
  setShowConfigModal,
  selectedUser,
  toggleUserStatus,
  updateUserConfig,
  allModels,
  updateAllowedModels,
}) => {
  if (!showConfigModal || !selectedUser) return null;

  const [selectedModels, setSelectedModels] = useState([]);
  const [isSavingModels, setIsSavingModels] = useState(false);
  const [showConfigJson, setShowConfigJson] = useState(false);

  // Update selectedModels when selectedUser changes
  useEffect(() => {
    if (selectedUser && selectedUser.allowedModels) {
      setSelectedModels(selectedUser.allowedModels);
    } else {
      setSelectedModels([]);
    }
  }, [selectedUser]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!showConfigModal) {
      setSelectedModels([]);
      setIsSavingModels(false);
      setShowConfigJson(false);
    }
  }, [showConfigModal]);

  const handleModalClick = (e) => e.stopPropagation();
  const handleBackdropClick = (e) =>
    e.target === e.currentTarget && setShowConfigModal(false);

  const handleModelToggle = (modelId) => {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleSaveModels = async () => {
    setIsSavingModels(true);
    try {
      await updateAllowedModels(selectedUser.id, selectedModels);
      // Close modal after successful save
      setShowConfigModal(false);
    } finally {
      setIsSavingModels(false);
    }
  };
  const handleRemoveModelAccess = async () => {
    setIsSavingModels(true);
    try {
      // Remove all models for this user by calling your backend API
      await updateAllowedModels(selectedUser.id, []); // Pass empty array to remove all models

      // Update UI state to reflect no models selected
      setSelectedModels([]);

      // Optionally close modal or show a success message
      alert("All model access removed successfully!");
    } catch (error) {
      alert("Failed to remove model access");
      console.error(error);
    } finally {
      setIsSavingModels(false);
    }
  };
  const removeConfigJson = () => {
    updateUserConfig(selectedUser.id, {});
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden animate-pop-in"
        onClick={handleModalClick}
      >
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                User Configuration
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Edit settings for{" "}
                {selectedUser.fullName || selectedUser.username}
              </p>
            </div>
            <button
              onClick={() => setShowConfigModal(false)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              type="button"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedUser.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {selectedUser.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {selectedUser.role || "User"}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span>
                Last active:{" "}
                {selectedUser.lastLogin
                  ? new Date(selectedUser.lastLogin).toLocaleString()
                  : "Never"}
              </span>
            </div>
          </div>
        </div>

        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(80vh - 150px)" }}
        >
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              Allowed Models
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              Select which models this user can access
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allModels.map((model) => {
                const modelId = model?.model?._id;
                const isSelected = selectedModels.includes(modelId);

                return (
                  <div
                    key={modelId}
                    className={`p-3 border rounded-lg transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleModelToggle(modelId)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 block text-sm font-medium text-gray-700">
                        {model?.model?.name}
                        <span className="block text-xs text-gray-500 mt-1">
                          {model?.model?.provider}
                        </span>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveModels}
                disabled={isSavingModels}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  isSavingModels ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSavingModels ? "Saving..." : "Save Model Access"}
              </button>

              <button
                onClick={handleRemoveModelAccess}
                disabled={isSavingModels}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove Model Access
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() =>
                    toggleUserStatus(selectedUser.id, selectedUser.isActive)
                  }
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    selectedUser.isActive
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  } transition-colors`}
                  type="button"
                >
                  {selectedUser.isActive ? (
                    <>
                      <ToggleLeft size={16} />
                      <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <ToggleRight size={16} />
                      <span>Activate</span>
                    </>
                  )}
                </button>
                <span className="text-sm text-gray-500">
                  {selectedUser.isActive
                    ? "User can access the system"
                    : "User cannot log in"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={() => setShowConfigModal(false)}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              updateUserConfig(selectedUser.id, selectedUser.config)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            type="button"
          >
            <Check className="mr-2" size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
