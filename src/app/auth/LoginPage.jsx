"use client"

import { useState } from "react"
import { Eye, EyeOff, Sparkles } from "lucide-react"

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Demo credentials
  const demoCredentials = [
    { email: "admin@genzeon.com", password: "admin123", role: "admin", name: "Admin User" },
    { email: "user@genzeon.com", password: "user123", role: "user", name: "John Doe" },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = demoCredentials.find((cred) => cred.email === email && cred.password === password)

    if (user) {
      onLogin(user)
    } else {
      alert("Invalid credentials. Please use demo credentials.")
    }

    setLoading(false)
  }

  const fillDemoCredentials = (role) => {
    const cred = demoCredentials.find((c) => c.role === role)
    setEmail(cred.email)
    setPassword(cred.password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 genzeon-gradient opacity-10"></div>

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

          {/* Demo Credentials */}
          <div className="mb-6 p-4 bg-lilly-white rounded-lg">
            <p className="text-sm font-medium text-whale-blue mb-3">Demo Credentials:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials("admin")}
                className="w-full text-left p-2 text-xs bg-white rounded border hover:bg-vibrant-blue hover:text-gray-500 transition-colors"
              >
                <strong>Admin:</strong> admin@genzeon.com / admin123
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials("user")}
                className="w-full text-left p-2 text-xs bg-white rounded border hover:bg-vibrant-blue hover:text-gray-500  transition-colors"
              >
                <strong>User:</strong> user@genzeon.com / user123
              </button>
            </div>
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal/50 hover:text-charcoal transition-colors"
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
