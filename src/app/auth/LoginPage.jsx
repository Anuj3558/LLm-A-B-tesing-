"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Sparkles } from "lucide-react"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

const loginAPI = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: email, password }),
  })
  

  
  return response.json()
}

const validateTokenAPI = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/validate`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error('Token validation failed')
  }
  
  return response.json()
}

// Cookie utility functions
const setCookie = (name, value, days = 7) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`
}

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

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Check for existing token on component mount
  useEffect(() => {
    const checkExistingToken = async () => {
      try {
        const token = getCookie('authToken')
        
        if (token) {
          toast.info('Validating existing session...', {
            autoClose: 2000,
          })

          const response = await validateTokenAPI(token)
          
          if (response.valid && response.user) {
            toast.success(`Authentication successful. Redirecting...`, {
              autoClose: 3000,
            })

            // Navigate based on role
          } else {
            // Invalid token, remove it
            deleteCookie('authToken')
            toast.warn('Session expired. Please login again.', {
              autoClose: 3000,
            })
          }
        }
      } catch (error) {
        console.error('Token validation error:', error)
        deleteCookie('authToken')
        toast.error('Failed to validate session. Please login.', {
          autoClose: 3000,
        })
      } finally {
        setInitialLoading(false)
      }
    }

    checkExistingToken()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await loginAPI(email, password)
      console.log('Login response:', response)
      if (response.token && response.message === 'Login successful') {
        // Store token in cookies
        setCookie('authToken', response.token, 7) // 7 days expiry
        
        // Show success notification
        toast.success(`Welcome back, ${response.user?.username || response.user?.email || 'User'}!`, {
          autoClose: 3000,
        })

        // Call onLogin prop if provided
        if (onLogin) {
          onLogin(response.user)
        }

        // Navigate based on role
        setTimeout(() => {
          // Your navigation logic here
        }, 1000)
      } else {
        throw new Error(response?.message || 'Invalid credentials. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Invalid credentials. Please try again.', {
        autoClose: 4000,
      })
    } finally {
      setLoading(false)
    }
  }

  // Show loading spinner while checking initial token
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="absolute inset-0 genzeon-gradient opacity-10"></div>
        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full genzeon-gradient mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-charcoal/70">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 genzeon-gradient opacity-10"></div>

      {/* Toast container - this is where notifications will appear */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="relative w-full max-w-md">
        <div className="bg-white shadow-2xl apple-blur p-8 animate-scale-in">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full genzeon-gradient mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-whale-blue mb-2">Welcome Back</h1>
            <p className="text-charcoal/70">Sign in to your LLM Testing Platform</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-whale-blue mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-whale-blue mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-storm-grey/30 rounded-lg focus:ring-2 focus:ring-vibrant-blue focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal/50 hover:text-charcoal transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 genzeon-gradient text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-charcoal/70">
              Powered by <span className="font-semibold text-vibrant-blue">Genzeon</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage