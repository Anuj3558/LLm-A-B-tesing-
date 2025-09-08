// API Base URL Configuration
const API_BASE_URL = import.meta.env.PROD
  ? 'http://35.239.39.90:5000/api'
  : 'http://localhost:5000/api'

console.log('Environment PROD:', import.meta.env.PROD)
console.log('Environment MODE:', import.meta.env.MODE)
console.log('Environment VITE_APP_ENV:', import.meta.env.VITE_APP_ENV)
console.log('API Base URL:', API_BASE_URL)

// ...existing functions...