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
} from "lucide-react"
import { addUser, getUsers, updateUser } from "../app/api"

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [users, setUsers] = useState([])
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")

  
  useEffect(() => {
    (async () => {
      const fetchedUsers = await getUsers()
      setUsers(fetchedUsers)
    })()
   
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  const toggleUserStatus = (userId) => {
    // In a real app, this would make an API call
    // updateUser(userId, {active: })
    console.log("Toggle status for user:", userId)
  }

  const openConfigModal = (user) => {
    setSelectedUser(user)
    setShowConfigModal(true)
  }

  const ConfigModal = () => {
    if (!showConfigModal || !selectedUser) return null

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white shadow max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6 border-b border-storm-grey/20">
            <h3 className="text-lg font-semibold text-whale-blue">Edit Configuration - {selectedUser.username}</h3>
          </div>

          <div className="p-6">
            <div className="bg-charcoal rounded-lg p-4 font-mono text-sm text-white overflow-x-auto">
              <pre>{JSON.stringify(selectedUser.config, null, 2)}</pre>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-charcoal/70 hover:text-charcoal transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-vibrant-blue text-white rounded-lg hover:bg-vibrant-blue/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-whale-blue">User Management</h1>
            <p className="text-charcoal/70">Manage users, roles, and configurations</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => setShowNewUserModal(true)} className="flex items-center px-4 py-2 bg-vibrant-teal text-white bg-slate-800 rounded-lg hover:bg-vibrant-teal/90 transition-colors">
          <UserPlus size={16} className="mr-2" />
          Add User
            </button>
            <button className="flex items-center px-4 py-2 border border-storm-grey/30 text-charcoal/70 rounded-lg hover:bg-lilly-white transition-colors">
          <Download size={16} className="mr-2" />
          Export
            </button>
          </div>
        </div>

        {/* New User Modal */}
        {showNewUserModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white shadow max-w-md w-full rounded-lg">
          <div className="p-6 border-b border-storm-grey/20">
            <h3 className="text-lg font-semibold text-whale-blue">Add New User</h3>
          </div>
          <form
            className="p-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              await addUser({
            username: newUserName,
            email: newUserEmail,
            password: newUserPassword,
              })
              setShowNewUserModal(false)
              setNewUserName("")
              setNewUserEmail("")
              setNewUserPassword("")
              const fetchedUsers = await getUsers()
              setUsers(fetchedUsers)
            }}
          >
            <div>
              <label className="block text-sm font-medium text-whale-blue mb-1">Username</label>
              <input
            type="text"
            required
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-whale-blue mb-1">Email</label>
              <input
            type="email"
            required
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-whale-blue mb-1">Password</label>
              <input
            type="password"
            required
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
            className="w-full px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
            type="button"
            onClick={() => setShowNewUserModal(false)}
            className="px-4 py-2 text-charcoal/70 hover:text-charcoal transition-colors"
              >
            Cancel
              </button>
              <button
            type="submit"
            className="px-4 py-2 bg-vibrant-blue text-white bg-slate-900 rounded-lg hover:bg-vibrant-blue/90 transition-colors"
              >
            Add User
              </button>
            </div>
          </form>
            </div>
          </div>
        )}

        {/* Filters */}
      <div className="bg-white shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/50" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-charcoal/50" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-lilly-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-whale-blue">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-whale-blue">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-whale-blue">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-whale-blue">Last Active</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-whale-blue">Prompts</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-whale-blue">Models Access</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-whale-blue">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-storm-grey/20">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-lilly-white/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-whale-blue">{user.name}</div>
                      <div className="text-sm text-charcoal/70">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === "Admin"
                          ? "bg-vibrant-blue/10 text-vibrant-blue"
                          : "bg-vibrant-teal/10 text-vibrant-teal"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === "Active"
                          ? "bg-vibrant-teal/10 text-vibrant-teal"
                          : "bg-charcoal/10 text-charcoal"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal/70">{user.lastActive}</td>
                  <td className="px-6 py-4 text-sm font-medium text-whale-blue">{user.promptsCount}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.modelsAccess?.slice(0, 2).map((model, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs bg-dusky-orange/10 text-dusky-orange rounded"
                        >
                          {model}
                        </span>
                      ))}
                      {user.modelsAccess?.length > 2 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-storm-grey/20 text-charcoal/70 rounded">
                          +{user.modelsAccess?.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openConfigModal(user)}
                        className="p-2 text-charcoal/50 hover:text-vibrant-blue hover:bg-vibrant-blue/10 rounded-lg transition-colors"
                        title="Edit Config"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className="p-2 text-charcoal/50 hover:text-vibrant-teal hover:bg-vibrant-teal/10 rounded-lg transition-colors"
                        title="Toggle Access"
                      >
                        {user.status === "Active" ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button
                        className="p-2 text-charcoal/50 hover:text-dusky-orange hover:bg-dusky-orange/10 rounded-lg transition-colors"
                        title="View History"
                      >
                        <History size={16} />
                      </button>
                      <button className="p-2 text-charcoal/50 hover:text-charcoal hover:bg-storm-grey/10 rounded-lg transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfigModal />
    </div>
  )
}

export default UserManagement
