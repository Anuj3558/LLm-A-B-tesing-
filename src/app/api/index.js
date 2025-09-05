import axios from 'axios';

// Get API base URL based on environment  
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://genzeon-ab.vercel.app/api'
  : 'http://localhost:5000/api';

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🏗️ Environment:', import.meta.env.VITE_APP_ENV || 'development');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clean up all authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page to prevent loops
      if (!window.location.pathname.includes('/login')) {
        console.warn('Authentication failed, redirecting to login...');
        // Use a timeout to prevent immediate redirect loops
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

// ===== AUTHENTICATION FUNCTIONS =====
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Login failed' 
    };
  }
};

// ===== ADMIN DASHBOARD FUNCTIONS =====
export const fetchAdminDashboard = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    // Don't throw, just return error information
    return { 
      success: false, 
      error: error.response?.status === 401 
        ? 'Authentication required. Please log in again.' 
        : error.response?.data?.message || 'Failed to fetch admin dashboard' 
    };
  }
};

export const updateAdminKPIs = async (kpiData) => {
  try {
    const response = await api.put('/admin/dashboards/kpis', kpiData);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update KPIs' 
    };
  }
};

export const updateTokenUsage = async (tokenData) => {
  try {
    const response = await api.put('/admin/dashboards/token-usage', tokenData);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update token usage' 
    };
  }
};

export const addActivityLog = async (activity) => {
  try {
    const response = await api.post('/admin/dashboards/activities', activity);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to add activity log' 
    };
  }
};

// ===== USER MANAGEMENT FUNCTIONS =====
export const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/get-all-users');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch users' 
    };
  }
};

export const addUser = async (userData) => {
  try {
    const response = await api.post('/admin/add-user', userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to add user' 
    };
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/delete-user/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to delete user' 
    };
  }
};

export const toggleUserStatus = async (userId) => {
  try {
    const response = await api.patch(`/admin/toggle-status/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to toggle user status' 
    };
  }
};

// Update allowed models for a user (Admin only)
export const updateUserAllowedModels = async (userId, modelIds) => {
  try {
    const response = await api.post(`/admin/update-allowed-models/${userId}`, { modelIds });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update user model access' 
    };
  }
};

// Get all models available to admin
export const getAllAdminModels = async () => {
  try {
    const response = await api.get('/admin/get-all-models');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch admin models' 
    };
  }
};

// Get configured models from global config
export const getConfiguredModels = async () => {
  try {
    const response = await api.get('/admin/configured-models');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch configured models' 
    };
  }
};

// ===== USER DASHBOARD FUNCTIONS =====
export const fetchUserDashboard = async (userId) => {
  try {
    const response = await api.get(`/user/dashboards/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch user dashboard' 
    };
  }
};

export const updateUserStats = async (userId, stats) => {
  try {
    const response = await api.put(`/user/dashboards/${userId}/stats`, stats);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update user stats' 
    };
  }
};

export const addTestHistory = async (userId, testData) => {
  try {
    const response = await api.post(`/user/dashboards/${userId}/tests`, testData);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to add test history' 
    };
  }
};

export const updateUserPreferences = async (userId, preferences) => {
  try {
    const response = await api.put(`/user/dashboards/${userId}/preferences`, preferences);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update preferences' 
    };
  }
};

// Get user's allowed models
export const getUserAllowedModels = async () => {
  try {
    const response = await api.get('/user/allowed-models');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch user allowed models' 
    };
  }
};

// Get user profile with model access
export const getUserProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch user profile' 
    };
  }
};

// ===== MODEL CONFIG FUNCTIONS =====
export const getModelConfigs = async () => {
  try {
    const response = await api.get('/admin/model-configs');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch model configs' 
    };
  }
};

export const createModelConfig = async (config) => {
  try {
    const response = await api.post('/admin/model-config', config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to create model config' 
    };
  }
};

export const updateModelConfig = async (configId, config) => {
  try {
    const response = await api.put(`/admin/model-config/${configId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update model config' 
    };
  }
};

export const deleteModelConfig = async (configId) => {
  try {
    const response = await api.delete(`/admin/model-config/${configId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to delete model config' 
    };
  }
};

// ***** LLM Testing Functions *****

// Test prompt with multiple models
export const testPromptWithModels = async (prompt, modelIds, evaluationCriteria = null) => {
  try {
    const response = await api.post('/llm/test-prompt', {
      prompt,
      modelIds,
      evaluationCriteria,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error testing prompt with models:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to test prompt with models' 
    };
  }
};

// Test prompt with single model
export const testPromptWithSingleModel = async (prompt, modelId) => {
  try {
    const response = await api.post('/llm/test-single', {
      prompt,
      modelId,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error testing prompt with single model:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to test prompt with single model' 
    };
  }
};

// Get available LLM models
export const getAvailableModels = async () => {
  try {
    const response = await api.get('/llm/models');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching available models:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to fetch available models' 
    };
  }
};

// Check LLM service health
export const checkLLMHealth = async () => {
  try {
    const response = await api.get('/llm/health');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error checking LLM health:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to check LLM health' 
    };
  }
};

// ===== PROMPT HISTORY API FUNCTIONS =====

// Get user's prompt history with pagination and filtering
export const getPromptHistory = async (params = {}) => {
  try {
    const response = await api.get('/prompt-history', { params });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching prompt history:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch prompt history'
    };
  }
};

// Get specific prompt history entry by ID
export const getPromptHistoryById = async (id) => {
  try {
    const response = await api.get(`/prompt-history/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching prompt history entry:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch prompt history entry'
    };
  }
};

// Delete prompt history entry
export const deletePromptHistory = async (id) => {
  try {
    const response = await api.delete(`/prompt-history/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting prompt history entry:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to delete prompt history entry'
    };
  }
};

// Add or update feedback for a prompt history entry
export const addPromptFeedback = async (id, rating, comment = '') => {
  try {
    const response = await api.post(`/prompt-history/${id}/feedback`, {
      rating,
      comment
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error adding prompt feedback:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to add feedback'
    };
  }
};

// Get user's prompt history statistics
export const getPromptHistoryStats = async () => {
  try {
    const response = await api.get('/prompt-history/stats/overview');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching prompt history stats:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch prompt history statistics'
    };
  }
};

// Bulk delete prompt history entries
export const bulkDeletePromptHistory = async (ids) => {
  try {
    const response = await api.post('/prompt-history/bulk-delete', { ids });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error bulk deleting prompt history:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to delete prompt history entries'
    };
  }
};

// ===== HELPER FUNCTIONS =====
export const getApiHeaders = () => getAuthHeaders();

export default api;