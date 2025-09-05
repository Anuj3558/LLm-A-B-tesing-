"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./app/auth/LoginPage"
import AdminLayout from "./components/AdminLayout"
import UserLayout from "./components/UserLayout"
import AdminDashboard from "./components/AdminDashboard"
import UserManagement from "./components/UserManagement"
import GlobalConfig from "./components/GlobalConfig"
import ModelPerformance from "./components/ModelPerformance"
import UserDashboard from "./components/UserDashboard"
import PromptTesting from "./components/PromptTesting"
import PromptHistory from "./components/PromptHistory"
import UserSettings from "./components/UserSettings"
import "./app/globals.css"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F5EF5]"></div>
      </div>
    )
  }
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Routes>
          <Route
            path="/login"
            element={
              !user ? <LoginPage onLogin={login} /> : <Navigate to={user.role === "admin" ? "/admin" : "/user"} />
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              user && user.role === "admin" ? <AdminLayout user={user} onLogout={logout} /> : <Navigate to="/login" />
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="config" element={<GlobalConfig />} />
            <Route path="models" element={<ModelPerformance />} />
          </Route>

          {/* User Routes */}
          <Route
            path="/user"
            element={
              user && user.role === "user" ? <UserLayout user={user} onLogout={logout} /> : <Navigate to="/login" />
            }
          >
            <Route index element={<Navigate to="/user/dashboard" />} />
            <Route path="dashboard" element={<UserDashboard userId = {user ? user.id :"null"}/>} />
            <Route path="test" element={<PromptTesting />} />
            <Route path="history" element={<PromptHistory />} />
            <Route path="settings" element={<UserSettings />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
