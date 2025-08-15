import axios from 'axios';

// Base API URL - adjust this to match your backend server
const API_BASE_URL = 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// ADMIN AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * Admin login
 * @param {Object} credentials - { username, password }
 * @returns {Promise} Response with login status
 */
export const adminLogin = async (credentials) => {
  try {
    const response = await api.post('/admin/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ============================================================================
// USER MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * Get all users
 * @returns {Promise} Array of users
 */
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Add a new user
 * @param {Object} userData - { username, email, password }
 * @returns {Promise} Created user data
 */
export const addUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update user by ID
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} Updated user data
 */
export const updateUser = async (userId, updateData) => {
  try {
    const response = await api.put(`/users/${userId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete user by ID
 * @param {string} userId - User ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ============================================================================
// LLM MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * Get all LLMs
 * @returns {Promise} Array of LLMs
 */
export const getLLMs = async () => {
  try {
    const response = await api.get('/llms');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Add a new LLM
 * @param {Object} llmData - { name, provider, apiKey, endpoint }
 * @returns {Promise} Created LLM data
 */
export const addLLM = async (llmData) => {
  try {
    const response = await api.post('/llms', llmData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update LLM by ID
 * @param {string} llmId - LLM ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} Updated LLM data
 */
export const updateLLM = async (llmId, updateData) => {
  try {
    const response = await api.put(`/llms/${llmId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete LLM by ID
 * @param {string} llmId - LLM ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteLLM = async (llmId) => {
  try {
    const response = await api.delete(`/llms/${llmId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ============================================================================
// PROMPT MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * Create a prompt and get model response
 * @param {Object} promptData - { userId, adminId, llmId, promptText }
 * @returns {Promise} Response with prompt and model response
 */
export const createPrompt = async (promptData) => {
  try {
    const response = await api.post('/prompts', promptData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all prompts with populated LLM data
 * @param {Object} params - Optional query parameters for filtering
 * @returns {Promise} Array of prompts
 */
export const getPrompts = async (params = {}) => {
  try {
    const response = await api.get('/prompts', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get prompts by user ID
 * @param {string} userId - User ID
 * @returns {Promise} Array of user's prompts
 */
export const getPromptsByUser = async (userId) => {
  try {
    const response = await api.get(`/prompts?userId=${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get prompts by admin ID
 * @param {string} adminId - Admin ID
 * @returns {Promise} Array of admin's prompts
 */
export const getPromptsByAdmin = async (adminId) => {
  try {
    const response = await api.get(`/prompts?adminId=${adminId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Set authentication token
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

/**
 * Get authentication token
 * @returns {string|null} JWT token or null
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Clear authentication token
 */
export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Batch delete users
 * @param {Array} userIds - Array of user IDs
 * @returns {Promise} Results of all delete operations
 */
export const batchDeleteUsers = async (userIds) => {
  try {
    const deletePromises = userIds.map(userId => deleteUser(userId));
    const results = await Promise.allSettled(deletePromises);
    return results;
  } catch (error) {
    throw error;
  }
};

/**
 * Batch delete LLMs
 * @param {Array} llmIds - Array of LLM IDs
 * @returns {Promise} Results of all delete operations
 */
export const batchDeleteLLMs = async (llmIds) => {
  try {
    const deletePromises = llmIds.map(llmId => deleteLLM(llmId));
    const results = await Promise.allSettled(deletePromises);
    return results;
  } catch (error) {
    throw error;
  }
};

// ============================================================================
// A/B TESTING SPECIFIC FUNCTIONS
// ============================================================================

/**
 * Run A/B test with multiple LLMs for the same prompt
 * @param {Object} testData - { userId, adminId, llmIds, promptText }
 * @returns {Promise} Results from all LLMs
 */
export const runABTest = async (testData) => {
  try {
    const { userId, adminId, llmIds, promptText } = testData;
    
    const testPromises = llmIds.map(llmId => 
      createPrompt({ userId, adminId, llmId, promptText })
    );
    
    const results = await Promise.allSettled(testPromises);
    return results;
  } catch (error) {
    throw error;
  }
};

/**
 * Compare responses from different LLMs
 * @param {Array} promptIds - Array of prompt IDs to compare
 * @returns {Promise} Comparison data
 */
export const comparePromptResponses = async (promptIds) => {
  try {
    // This would need to be implemented on the backend
    // For now, we'll fetch individual prompts
    const prompts = await getPrompts();
    const filteredPrompts = prompts.filter(prompt => promptIds.includes(prompt._id));
    return filteredPrompts;
  } catch (error) {
    throw error;
  }
};

// Export the axios instance for custom requests
export { api };

// Default export for convenience
export default {
  // Admin
  adminLogin,
  
  // Users
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  batchDeleteUsers,
  
  // LLMs
  getLLMs,
  addLLM,
  updateLLM,
  deleteLLM,
  batchDeleteLLMs,
  
  // Prompts
  createPrompt,
  getPrompts,
  getPromptsByUser,
  getPromptsByAdmin,
  
  // A/B Testing
  runABTest,
  comparePromptResponses,
  
  // Auth utilities
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  isAuthenticated,
  
  // Axios instance
  api
};
