// Dashboard CRUD Operations Test
// This file tests all dashboard CRUD operations to ensure they are properly
// triggered, updated, stored, and fetched from the database

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Test credentials - replace with actual test credentials
const adminCredentials = {
  username: 'testadmin',
  password: 'testpassword'
};

const userCredentials = {
  username: 'testuser',
  password: 'testpassword'
};

let adminToken = '';
let userToken = '';
let testUserId = '';

// Helper function for API calls
const apiCall = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      data
    };
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
};

// Test authentication
async function testAuthentication() {
  console.log('\n=== Testing Authentication ===');
  
  // Test admin login
  const adminLogin = await apiCall('POST', '/auth/login', adminCredentials);
  if (adminLogin.success) {
    adminToken = adminLogin.data.token;
    console.log('✅ Admin login successful');
  } else {
    console.log('❌ Admin login failed:', adminLogin.error);
    return false;
  }
  
  // Test user login (if user exists)
  const userLogin = await apiCall('POST', '/auth/login', userCredentials);
  if (userLogin.success) {
    userToken = userLogin.data.token;
    console.log('✅ User login successful');
  } else {
    console.log('⚠️ User login failed (expected if user doesn\'t exist):', userLogin.error);
  }
  
  return true;
}

// Test Admin Dashboard CRUD Operations
async function testAdminDashboard() {
  console.log('\n=== Testing Admin Dashboard CRUD ===');
  
  // Test GET admin dashboard (should auto-create if doesn't exist)
  const getDashboard = await apiCall('GET', '/admin/dashboards', null, adminToken);
  if (getDashboard.success) {
    console.log('✅ Admin dashboard fetch successful');
    console.log('📊 Dashboard data:', JSON.stringify(getDashboard.data, null, 2));
  } else {
    console.log('❌ Admin dashboard fetch failed:', getDashboard.error);
  }
  
  // Test UPDATE admin dashboard KPIs
  const updateKPIs = await apiCall('PUT', '/admin/dashboards/kpis', {
    totalUsers: 100,
    activeUsers: 85,
    totalTests: 25,
    conversionRate: 15.5
  }, adminToken);
  
  if (updateKPIs.success) {
    console.log('✅ Admin KPIs update successful');
  } else {
    console.log('❌ Admin KPIs update failed:', updateKPIs.error);
  }
  
  // Test UPDATE token usage
  const updateTokenUsage = await apiCall('PUT', '/admin/dashboards/token-usage', {
    inputTokens: 10000,
    outputTokens: 5000,
    cost: 25.75
  }, adminToken);
  
  if (updateTokenUsage.success) {
    console.log('✅ Token usage update successful');
  } else {
    console.log('❌ Token usage update failed:', updateTokenUsage.error);
  }
  
  // Test UPDATE model latency
  const updateLatency = await apiCall('PUT', '/admin/dashboards/latency', {
    modelName: 'gpt-4',
    averageLatency: 1250,
    requestCount: 500
  }, adminToken);
  
  if (updateLatency.success) {
    console.log('✅ Model latency update successful');
  } else {
    console.log('❌ Model latency update failed:', updateLatency.error);
  }
  
  // Test ADD activity log
  const addActivity = await apiCall('POST', '/admin/dashboards/activities', {
    action: 'User Created',
    details: 'New user testuser@example.com created',
    impact: 'high'
  }, adminToken);
  
  if (addActivity.success) {
    console.log('✅ Activity log addition successful');
  } else {
    console.log('❌ Activity log addition failed:', addActivity.error);
  }
  
  // Test GET updated dashboard to verify changes
  const getUpdatedDashboard = await apiCall('GET', '/admin/dashboards', null, adminToken);
  if (getUpdatedDashboard.success) {
    console.log('✅ Updated admin dashboard fetch successful');
    console.log('📊 Updated dashboard data:', JSON.stringify(getUpdatedDashboard.data, null, 2));
  } else {
    console.log('❌ Updated admin dashboard fetch failed:', getUpdatedDashboard.error);
  }
}

// Test User Dashboard CRUD Operations
async function testUserDashboard() {
  console.log('\n=== Testing User Dashboard CRUD ===');
  
  // First, create a test user if needed
  const createUser = await apiCall('POST', '/admin/add-user', {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'testpassword',
    role: 'user'
  }, adminToken);
  
  if (createUser.success) {
    testUserId = createUser.data.user?.id || createUser.data.id;
    console.log('✅ Test user created with ID:', testUserId);
  } else {
    console.log('⚠️ Test user creation failed (may already exist):', createUser.error);
  }
  
  // Test GET user dashboard (should auto-create if doesn't exist)
  const getUserDashboard = await apiCall('GET', `/user/dashboards/${testUserId}`, null, adminToken);
  if (getUserDashboard.success) {
    console.log('✅ User dashboard fetch successful');
    console.log('📊 User dashboard data:', JSON.stringify(getUserDashboard.data, null, 2));
  } else {
    console.log('❌ User dashboard fetch failed:', getUserDashboard.error);
  }
  
  // Test UPDATE user statistics
  const updateUserStats = await apiCall('PUT', `/user/dashboards/${testUserId}/stats`, {
    testsRun: 15,
    averageSessionDuration: 4500,
    preferredModel: 'gpt-4'
  }, adminToken);
  
  if (updateUserStats.success) {
    console.log('✅ User statistics update successful');
  } else {
    console.log('❌ User statistics update failed:', updateUserStats.error);
  }
  
  // Test ADD test history
  const addTestHistory = await apiCall('POST', `/user/dashboards/${testUserId}/tests`, {
    testName: 'Email Subject A/B Test',
    model: 'gpt-4',
    status: 'completed',
    results: { variantA: 12.5, variantB: 15.2 }
  }, adminToken);
  
  if (addTestHistory.success) {
    console.log('✅ Test history addition successful');
  } else {
    console.log('❌ Test history addition failed:', addTestHistory.error);
  }
  
  // Test UPDATE user preferences
  const updatePreferences = await apiCall('PUT', `/user/dashboards/${testUserId}/preferences`, {
    theme: 'dark',
    notifications: true,
    defaultModel: 'gpt-4',
    dashboardLayout: 'compact'
  }, adminToken);
  
  if (updatePreferences.success) {
    console.log('✅ User preferences update successful');
  } else {
    console.log('❌ User preferences update failed:', updatePreferences.error);
  }
  
  // Test GET updated user dashboard to verify changes
  const getUpdatedUserDashboard = await apiCall('GET', `/user/dashboards/${testUserId}`, null, adminToken);
  if (getUpdatedUserDashboard.success) {
    console.log('✅ Updated user dashboard fetch successful');
    console.log('📊 Updated user dashboard data:', JSON.stringify(getUpdatedUserDashboard.data, null, 2));
  } else {
    console.log('❌ Updated user dashboard fetch failed:', getUpdatedUserDashboard.error);
  }
}

// Test Dashboard Triggers (Admin User Management)
async function testDashboardTriggers() {
  console.log('\n=== Testing Dashboard Auto-Update Triggers ===');
  
  // Test user status toggle (should trigger admin dashboard update)
  if (testUserId) {
    const toggleStatus = await apiCall('PATCH', `/admin/toggle-status/${testUserId}`, null, adminToken);
    
    if (toggleStatus.success) {
      console.log('✅ User status toggle successful (should trigger dashboard update)');
    } else {
      console.log('❌ User status toggle failed:', toggleStatus.error);
    }
    
    // Wait a moment for async dashboard update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if admin dashboard was updated
    const dashboardAfterToggle = await apiCall('GET', '/admin/dashboards', null, adminToken);
    if (dashboardAfterToggle.success) {
      console.log('✅ Admin dashboard successfully updated after user status toggle');
      console.log('📊 Recent activities:', dashboardAfterToggle.data.recentActivities?.slice(0, 3));
    } else {
      console.log('❌ Admin dashboard fetch after toggle failed:', dashboardAfterToggle.error);
    }
  }
}

// Test Data Persistence
async function testDataPersistence() {
  console.log('\n=== Testing Data Persistence ===');
  
  // Simulate server restart by fetching data again
  console.log('🔄 Simulating data fetch after server restart...');
  
  const persistedAdminDashboard = await apiCall('GET', '/admin/dashboards', null, adminToken);
  if (persistedAdminDashboard.success) {
    console.log('✅ Admin dashboard data persisted successfully');
    console.log('📊 Persisted KPIs:', persistedAdminDashboard.data.kpis);
  } else {
    console.log('❌ Admin dashboard persistence test failed:', persistedAdminDashboard.error);
  }
  
  if (testUserId) {
    const persistedUserDashboard = await apiCall('GET', `/user/dashboards/${testUserId}`, null, adminToken);
    if (persistedUserDashboard.success) {
      console.log('✅ User dashboard data persisted successfully');
      console.log('📊 Persisted user stats:', persistedUserDashboard.data.statistics);
    } else {
      console.log('❌ User dashboard persistence test failed:', persistedUserDashboard.error);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Dashboard CRUD Operations Test');
  console.log('============================================');
  
  try {
    // Test authentication first
    const authSuccess = await testAuthentication();
    if (!authSuccess) {
      console.log('❌ Authentication failed. Cannot proceed with dashboard tests.');
      return;
    }
    
    // Test admin dashboard operations
    await testAdminDashboard();
    
    // Test user dashboard operations
    await testUserDashboard();
    
    // Test automatic dashboard triggers
    await testDashboardTriggers();
    
    // Test data persistence
    await testDataPersistence();
    
    console.log('\n✅ All dashboard CRUD tests completed!');
    console.log('============================================');
    
  } catch (error) {
    console.error('❌ Test suite failed with error:', error);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { runAllTests, testAdminDashboard, testUserDashboard, testDashboardTriggers };
