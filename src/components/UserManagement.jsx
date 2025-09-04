"use client"

import { useState, useEffect } from "react"
import { Search, Filter, UserPlus, Download } from "lucide-react"
import ConfigModal from "./utils/ConfigModal"
import DeleteConfirmationModal from "./utils/DeleteConfirmationModal"
import AddUserModal from "./utils/AddUserModal"
import { Filters, SkeletonLoading, StatusMessages, UsersTable } from "./utils/StatusMessages"


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

  const getAuthToken = () => getCookie('authToken')

  const getApiHeaders = () => {
    const token = getAuthToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/get-all-users`, {
        headers: getApiHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllModels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/models-raw`, {
        headers: getApiHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch models')
      const data = await response.json()
    console.log(data)
      setAllModels(data?.data || [])
    } catch (err) {
      console.error('Error fetching models:', err)
    }
  }

  const updateAllowedModels = async (userId, modelIds) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/update-allowed-models/${userId}`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ modelIds })
      })

      if (!response.ok) throw new Error('Failed to update allowed models')
      await fetchUsers()
      setSuccess('Allowed models updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error updating allowed models:', err)
    }
  }

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const isFormValid = () => (
    validateEmail(addUserForm.email) &&
    addUserForm.username.trim().length >= 3 &&
    addUserForm.password.length >= 6
  )

  const handleAddUser = async () => {
    const trimmedForm = {
      ...addUserForm,
      email: addUserForm.email.trim(),
      username: addUserForm.username.trim(),
      fullName: addUserForm.fullName.trim()
    }

    if (!validateEmail(trimmedForm.email)) {
      setError('Please enter a valid email address')
      return
    }

    if (trimmedForm.username.length < 3) {
      setError('Username must be at least 3 characters long')
      return
    }

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
      if (!response.ok) throw new Error(data.message || 'Failed to add user')

      setAddUserForm({
        email: "",
        username: "",
        password: "",
        fullName: "",
        isActive: true
      })
      setShowAddUserModal(false)
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

  const toggleUserStatus = async (userId, currentStatus) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/toggle-status/${userId}`, {
        method: 'PATCH',
        headers: getApiHeaders()
      })

      if (!response.ok) throw new Error('Failed to toggle user status')
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

  const handleDeleteUser = async (userId) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/delete-user/${userId}`, {
        method: 'DELETE',
        headers: getApiHeaders()
      })

      if (!response.ok) throw new Error('Failed to delete user')
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

  const updateUserConfig = async (userId, config) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/config`, {
        method: 'PATCH',
        headers: getApiHeaders(),
        body: JSON.stringify({ config })
      })

      if (!response.ok) throw new Error('Failed to update user configuration')
      await fetchUsers()
      setShowConfigModal(false)
      setSuccess('Configuration updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error updating user config:', err)
    }
  }

  const exportUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/export`, {
        headers: getApiHeaders()
      })

      if (!response.ok) throw new Error('Failed to export users')
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

      <StatusMessages error={error} success={success} setError={setError} setSuccess={setSuccess} />

      <Filters 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        statusFilter={statusFilter} 
        setStatusFilter={setStatusFilter} 
      />

      {loading ? (
        <SkeletonLoading />
      ) : (
        <UsersTable 
          users={filteredUsers} 
          allModels={allModels} 
          openConfigModal={openConfigModal} 
          toggleUserStatus={toggleUserStatus}
          setShowDeleteModal={setShowDeleteModal}
          setSelectedUser={setSelectedUser}
          loading={loading}
        />
      )}

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