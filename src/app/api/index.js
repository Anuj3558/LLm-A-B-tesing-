// API Base URL Configuration
const API_BASE_URL = import.meta.env.VITE_APP_ENV === 'production' 
  ? 'http://35.239.39.90:5000/api'
  : 'http://localhost:5000/api'

console.log('API Environment:', import.meta.env.VITE_APP_ENV)
console.log('API Base URL:', API_BASE_URL)

// ...existing functions...