"use client"

import { useState } from "react"
import { X, Eye, EyeOff, Check, ChevronDown } from "lucide-react"

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

  const handleModalClick = (e) => e.stopPropagation()
  const handleBackdropClick = (e) => e.target === e.currentTarget && setShowAddUserModal(false)

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden animate-pop-in" onClick={handleModalClick}>
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

        <div className="p-6 space-y-4">
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

export default AddUserModal