"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  Edit,
  ToggleLeft,
  ToggleRight,
  History,
  MoreHorizontal,
  UserPlus,
  Download,
  X,
  Eye,
  EyeOff,
  Check,
  ChevronDown,
  Trash2,
} from "lucide-react"

// Enhanced Add User Modal Component (moved outside main component)
const AddUserModal = ({ 
  showAddUserModal, 
  setShowAddUserModal, 
  addUserForm, 
  setAddUserForm, 
  showPassword, 
  setShowPassword, 
  addUserLoading, 
  handleAddUser, 
  validateEmail, 
  isFormValid 
}) => {
  if (!showAddUserModal) return null

  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowAddUserModal(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden animate-pop-in" onClick={handleModalClick}>
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Add New User</h3>
            <p className="text-sm text-gray-500 mt-1">Fill in the details below to create a new user</p>
          </div>
          <button
            onClick={() => setShowAddUserModal(false)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            type="button"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={addUserForm.email}
              onChange={(e) => setAddUserForm({...addUserForm, email: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                addUserForm.email && !validateEmail(addUserForm.email) 
                  ? 'border-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="user@company.com"
              autoComplete="email"
            />
            {addUserForm.email && !validateEmail(addUserForm.email) && (
              <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
            )}
          </div>

          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              id="username"
              type="text"
              required
              value={addUserForm.username}
              onChange={(e) => setAddUserForm({...addUserForm, username: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                addUserForm.username && addUserForm.username.trim().length < 3 
                  ? 'border-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="username"
              minLength={3}
              autoComplete="username"
            />
            {addUserForm.username && addUserForm.username.trim().length < 3 && (
              <p className="mt-1 text-sm text-red-600">Username must be at least 3 characters</p>
            )}
          </div>

          {/* Full Name Field */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={addUserForm.fullName}
              onChange={(e) => setAddUserForm({...addUserForm, fullName: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="John Doe"
              autoComplete="name"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={addUserForm.password}
                onChange={(e) => setAddUserForm({...addUserForm, password: e.target.value})}
                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  addUserForm.password && addUserForm.password.length < 6 
                    ? 'border-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="••••••••"
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {addUserForm.password && addUserForm.password.length < 6 && (
              <p className="mt-1 text-sm text-red-600">Password must be at least 6 characters</p>
            )}
          </div>

          {/* Status Field */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="relative">
              <select
                id="status"
                value={addUserForm.isActive ? "active" : "inactive"}
                onChange={(e) => setAddUserForm({...addUserForm, isActive: e.target.value === "active"})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-8"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setShowAddUserModal(false)}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddUser}
            disabled={addUserLoading || !isFormValid()}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium ${
              addUserLoading || !isFormValid() ? 'opacity-50 cursor-not-allowed' : ''
            } flex items-center`}
          >
            {addUserLoading ? (
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
                Add User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Enhanced Config Modal Component with Model Management
const ConfigModal = ({ 
  showConfigModal, 
  setShowConfigModal, 
  selectedUser, 
  toggleUserStatus, 
  updateUserConfig,
  allModels,
  updateAllowedModels
}) => {
  if (!showConfigModal || !selectedUser) return null

  const [selectedModels, setSelectedModels] = useState(selectedUser.allowedModels || [])
  const [isSavingModels, setIsSavingModels] = useState(false)

  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowConfigModal(false)
    }
  }

  const handleModelToggle = (modelId) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    )
  }

  const handleSaveModels = async () => {
    setIsSavingModels(true)
    try {
      await updateAllowedModels(selectedUser.id, selectedModels)
    } finally {
      setIsSavingModels(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden animate-pop-in" onClick={handleModalClick}>
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">User Configuration</h3>
              <p className="text-sm text-gray-500 mt-1">Edit settings for {selectedUser.fullName || selectedUser.username}</p>
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
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {selectedUser.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {selectedUser.role || 'User'}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span>Last active: {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 150px)' }}>
          {/* Model Management Section */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Allowed Models</h4>
            <p className="text-sm text-gray-500 mb-4">Select which models this user can access</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allModels.map(model => (
                <div 
                  key={model.id} 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedModels.includes(model.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleModelToggle(model.id)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(model.id)}
                      onChange={() => handleModelToggle(model.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 block text-sm font-medium text-gray-700">
                      {model.name}
                      <span className="block text-xs text-gray-500 mt-1">{model.description}</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveModels}
                disabled={isSavingModels}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  isSavingModels ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSavingModels ? 'Saving...' : 'Save Model Access'}
              </button>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Configuration JSON</label>
            <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-100 overflow-x-auto">
              <pre className="whitespace-pre-wrap">{JSON.stringify(selectedUser.config || {}, null, 2)}</pre>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleUserStatus(selectedUser.id, selectedUser.isActive)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    selectedUser.isActive 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
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
                  {selectedUser.isActive ? 'User can access the system' : 'User cannot log in'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={() => setShowConfigModal(false)}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={() => updateUserConfig(selectedUser.id, selectedUser.config)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            type="button"
          >
            <Check className="mr-2" size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ 
  showDeleteModal, 
  setShowDeleteModal, 
  selectedUser, 
  handleDeleteUser 
}) => {
  if (!showDeleteModal || !selectedUser) return null

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
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center  p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden animate-pop-in" onClick={handleModalClick}>
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-50 to-pink-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Delete User</h3>
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
              <h4 className="text-lg font-medium text-gray-900">Are you sure you want to delete this user?</h4>
              <p className="mt-1 text-sm text-gray-500">
                This will permanently delete <span className="font-semibold">{selectedUser.fullName || selectedUser.username}</span> and all associated data.
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
            onClick={() => handleDeleteUser(selectedUser.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
            type="button"
          >
            <Trash2 className="mr-2" size={16} />
            Delete User
          </button>
        </div>
      </div>
    </div>
  )
}

// Dropdown Menu Component
const DropdownMenu = ({ 
  user, 
  openConfigModal, 
  toggleUserStatus, 
  setShowDeleteModal,
  setSelectedUser
}) => {
  const [isOpen, setIsOpen] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) setIsOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={(e) => {
                e.stopPropagation()
                openConfigModal(user)
                setIsOpen(false)
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              role="menuitem"
            >
              <Edit className="mr-3" size={14} />
              Edit Configuration
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleUserStatus(user.id, user.isActive)
                setIsOpen(false)
              }}
              className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                user.isActive 
                  ? 'text-red-600 hover:bg-red-50' 
                  : 'text-green-600 hover:bg-green-50'
              }`}
              role="menuitem"
            >
              {user.isActive ? (
                <>
                  <ToggleLeft className="mr-3" size={14} />
                  Deactivate User
                </>
              ) : (
                <>
                  <ToggleRight className="mr-3" size={14} />
                  Activate User
                </>
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedUser(user)
                setShowDeleteModal(true)
                setIsOpen(false)
              }}
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              role="menuitem"
            >
              <Trash2 className="mr-3" size={14} />
              Delete User
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [users, setUsers] = useState([])
  const [allModels, setAllModels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Add User Form State
  const [addUserForm, setAddUserForm] = useState({
    email: "",
    username: "",
    password: "",
    fullName: "",
    isActive: true
  })
  const [showPassword, setShowPassword] = useState(false)
  const [addUserLoading, setAddUserLoading] = useState(false)

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

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/get-all-users`, {
        headers: getApiHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all available models from API
  const fetchAllModels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/get-all-models`, {
        headers: getApiHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch models')
      }

      const data = await response.json()
      setAllModels(data.models || [])
    } catch (err) {
      console.error('Error fetching models:', err)
    }
  }

  // Update allowed models for a user
  const updateAllowedModels = async (userId, modelIds) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/update-allowed-models/${userId}`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ modelIds })
      })

      if (!response.ok) {
        throw new Error('Failed to update allowed models')
      }

      // Refresh users list
      await fetchUsers()
      setSuccess('Allowed models updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error updating allowed models:', err)
    }
  }

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  // Check if form is valid
  const isFormValid = () => {
    return (
      validateEmail(addUserForm.email) &&
      addUserForm.username.trim().length >= 3 &&
      addUserForm.password.length >= 6
    )
  }

  // Add new user
  const handleAddUser = async () => {
    // Trim all string fields
    const trimmedForm = {
      ...addUserForm,
      email: addUserForm.email.trim(),
      username: addUserForm.username.trim(),
      fullName: addUserForm.fullName.trim()
    }

    // Validate email format
    if (!validateEmail(trimmedForm.email)) {
      setError('Please enter a valid email address')
      return
    }

    // Validate username
    if (trimmedForm.username.length < 3) {
      setError('Username must be at least 3 characters long')
      return
    }

    // Validate password
    if (trimmedForm.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setAddUserLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/admin/add-user`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({...trimmedForm, role: 'user'})
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add user')
      }

      // Reset form and close modal
      setAddUserForm({
        email: "",
        username: "",
        password: "",
        fullName: "",
        isActive: true
      })
      setShowAddUserModal(false)
      
      // Refresh users list
      await fetchUsers()
      
      setSuccess('User added successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error adding user:', err)
    } finally {
      setAddUserLoading(false)
    }
  }

  // Toggle user status
  const toggleUserStatus = async (userId, currentStatus) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/toggle-status/${userId}`, {
        method: 'PATCH',
        headers: getApiHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to toggle user status')
      }

      // Refresh users list
      await fetchUsers()
      setSuccess(`User status ${currentStatus ? 'deactivated' : 'activated'} successfully!`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error toggling user status:', err)
    } finally {
      setLoading(false)
    }
  }

  // Delete user
  const handleDeleteUser = async (userId) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/delete-user/${userId}`, {
        method: 'DELETE',
        headers: getApiHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      // Refresh users list
      await fetchUsers()
      setShowDeleteModal(false)
      setSuccess('User deleted successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error deleting user:', err)
    } finally {
      setLoading(false)
    }
  }

  // Update user configuration
  const updateUserConfig = async (userId, config) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/config`, {
        method: 'PATCH',
        headers: getApiHeaders(),
        body: JSON.stringify({ config })
      })

      if (!response.ok) {
        throw new Error('Failed to update user configuration')
      }

      // Refresh users list
      await fetchUsers()
      setShowConfigModal(false)
      setSuccess('Configuration updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error updating user config:', err)
    }
  }

  // Export users data
  const exportUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/export`, {
        headers: getApiHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to export users')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      setSuccess('Users exported successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error exporting users:', err)
    }
  }

  // Load users and models on component mount
  useEffect(() => {
    fetchUsers()
    fetchAllModels()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive)
    return matchesSearch && matchesStatus
  })

  const openConfigModal = (user) => {
    setSelectedUser(user)
    setShowConfigModal(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Manage users and their model access</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <UserPlus size={16} className="mr-2" />
            Add User
          </button>
          <button 
            onClick={exportUsers}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
            <div className="ml-auto pl-3">
              <button 
                onClick={() => setSuccess(null)}
                className="text-green-500 hover:text-green-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-500">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading users...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowed Models</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName || user.username}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {user.allowedModels && user.allowedModels.length > 0 ? (
                          user.allowedModels.map(modelId => {
                            const model = allModels.find(m => m.id === modelId)
                            return model ? (
                              <span key={modelId} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {model.name}
                              </span>
                            ) : null
                          })
                        ) : (
                          <span className="text-xs text-gray-500">No models assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openConfigModal(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Edit Config"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          className={`p-2 rounded-full transition-colors ${
                            user.isActive 
                              ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={user.isActive ? "Deactivate" : "Activate"}
                          disabled={loading}
                        >
                          {user.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                          title="View History"
                        >
                          <History size={16} />
                        </button>
                        <DropdownMenu 
                          user={user} 
                          openConfigModal={openConfigModal} 
                          toggleUserStatus={toggleUserStatus}
                          setShowDeleteModal={setShowDeleteModal}
                          setSelectedUser={setSelectedUser}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && filteredUsers.length === 0 && (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
              <Search size={40} className="text-gray-300" />
              <p>No users found matching your criteria</p>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}
      </div>

      <AddUserModal 
        showAddUserModal={showAddUserModal}
        setShowAddUserModal={setShowAddUserModal}
        addUserForm={addUserForm}
        setAddUserForm={setAddUserForm}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        addUserLoading={addUserLoading}
        handleAddUser={handleAddUser}
        validateEmail={validateEmail}
        isFormValid={isFormValid}
      />
      
      <ConfigModal 
        showConfigModal={showConfigModal}
        setShowConfigModal={setShowConfigModal}
        selectedUser={selectedUser}
        toggleUserStatus={toggleUserStatus}
        updateUserConfig={updateUserConfig}
        allModels={allModels}
        updateAllowedModels={updateAllowedModels}
      />

      <DeleteConfirmationModal 
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        selectedUser={selectedUser}
        handleDeleteUser={handleDeleteUser}
      />
    </div>
  )
}

export default UserManagement