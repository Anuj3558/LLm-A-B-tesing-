import Dashboard from '../models/Admin/AdminDashboardSchema.js'; // Ensure this path is correct
import User from '../models/UserModel.js';
import UserDashboard from '../models/User/UserDashBoardSchema.js';
import ModelConfig from '../models/ModelConfig.js';

/**
 * Calculate real-time KPI data from database
 */
export const calculateRealKPIs = async () => {
  try {
    // Total registered users
    const totalUsers = await User.countDocuments();
    
    // Active users (users who are not deactivated and have logged in recently)
    const activeUsers = await User.countDocuments({ 
      isActive: { $ne: false },
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    
    // Total prompts tested from all user dashboards
    const userDashboards = await UserDashboard.find({});
    const totalPrompts = userDashboards.reduce((total, dashboard) => {
      return total + (dashboard.promptsTested || 0);
    }, 0);

    // Count provider configurations
    const providerConfigCount = await ModelConfig.countDocuments();
    
    // Most used model - get from user dashboards
    const modelUsage = new Map();
    userDashboards.forEach(dashboard => {
      if (dashboard.bestPerformingModel) {
        const count = modelUsage.get(dashboard.bestPerformingModel) || 0;
        modelUsage.set(dashboard.bestPerformingModel, count + 1);
      }
    });
    
    let mostUsedModel = "None";
    let maxUsage = 0;
    for (const [model, usage] of modelUsage.entries()) {
      if (usage > maxUsage) {
        maxUsage = usage;
        mostUsedModel = model;
      }
    }
    
    return {
      totalUsers,
      activeUsers,
      totalPrompts,
      providerConfigCount,
      mostUsedModel,
      modelUsageCount: maxUsage
    };
  } catch (error) {
    console.error('Error calculating real KPIs:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalPrompts: 0,
      providerConfigCount: 0,
      mostUsedModel: "None",
      modelUsageCount: 0
    };
  }
};

export const initializeDashboard = async (adminId) => {
  const defaultDashboard = {
    adminId,
    kpiData: [
      { 
        title: "Active Users", 
        value: "0", 
        change: "+0%", 
        icon: "Users", 
        color: "vibrant-blue" 
      },
      { 
        title: "Total Registered Users", 
        value: "0", 
        change: "+0%", 
        icon: "MessageSquare", 
        color: "vibrant-teal" 
      },
      { 
        title: "Total Prompts Tested", 
        value: "0", 
        change: "+0%", 
        icon: "Activity", 
        color: "dusky-orange" 
      },
      { 
        title: "Provider Configs", 
        value: "0", 
        change: "Active", 
        icon: "Server", 
        color: "forest-green" 
      }
    ],
    tokenUsageData: [],
    modelLatencyData: [],
    responseAcceptanceData: [],
    recentActivity: []
  };

  return await Dashboard.create(defaultDashboard);
};

/**
 * Helper function to ensure admin has a dashboard with real-time data
 */
export const ensureAdminDashboard = async (adminId) => {
  let dashboard = await Dashboard.findOne({ adminId });
  
  if (!dashboard) {
    dashboard = await initializeDashboard(adminId);
    console.log(`Created new dashboard for admin: ${adminId}`);
  }
  
  // Clean up any malformed recentActivity entries
  if (dashboard.recentActivity && dashboard.recentActivity.length > 0) {
    dashboard.recentActivity = dashboard.recentActivity.filter(activity => 
      activity.user && activity.action && activity.time && activity.status
    );
  }
  
  // Update dashboard with real-time KPI data
  const realKPIs = await calculateRealKPIs();
  
  // Update KPI data with real values
  dashboard.kpiData = [
    { 
      title: "Active Users", 
      value: realKPIs.activeUsers.toString(), 
      change: "+0%", 
      icon: "Users", 
      color: "vibrant-blue" 
    },
    { 
      title: "Total Registered Users", 
      value: realKPIs.totalUsers.toString(), 
      change: "+0%", 
      icon: "MessageSquare", 
      color: "vibrant-teal" 
    },
    { 
      title: "Total Prompts Tested", 
      value: realKPIs.totalPrompts.toString(), 
      change: "+0%", 
      icon: "Activity", 
      color: "dusky-orange" 
    },
    { 
      title: "Provider Configs", 
      value: realKPIs.providerConfigCount.toString(), 
      change: "Active", 
      icon: "Server", 
      color: "forest-green" 
    }
  ];
  
  // Save the updated dashboard with better error handling
  try {
    await dashboard.save();
  } catch (saveError) {
    console.error('Error saving dashboard, trying to fix data:', saveError);
    
    // If save fails, reset recentActivity and try again
    dashboard.recentActivity = [];
    await dashboard.save();
    console.log('Dashboard saved after cleaning recentActivity');
  }
  
  return dashboard;
};

/**
 * Update admin dashboard with new data
 */
export const updateAdminDashboard = async (adminId, updateData) => {
  try {
    const dashboard = await ensureAdminDashboard(adminId);
    
    // Update KPI data
    if (updateData.kpiUpdate) {
      const { title, value, change } = updateData.kpiUpdate;
      const existingKpi = dashboard.kpiData.find(kpi => kpi.title === title);
      
      if (existingKpi) {
        existingKpi.value = value;
        existingKpi.change = change;
      }
    }
    
    // Add new user activity
    if (updateData.newUser) {
      // Validate required fields before adding activity
      if (updateData.newUser.username && updateData.newUser.fullName) {
        // Add to recent activity
        dashboard.recentActivity.unshift({
          user: updateData.newUser.username,
          action: `New user '${updateData.newUser.fullName}' registered`,
          time: new Date().toISOString(),
          status: 'success'
        });
        
        // Update total users KPI
        const totalUsersKpi = dashboard.kpiData.find(kpi => kpi.title === "Total Registered Users");
        if (totalUsersKpi) {
          const currentValue = parseInt(totalUsersKpi.value) || 0;
          totalUsersKpi.value = (currentValue + 1).toString();
          totalUsersKpi.change = "+1";
        }
        
        // Keep only last 10 activities
        if (dashboard.recentActivity.length > 10) {
          dashboard.recentActivity = dashboard.recentActivity.slice(0, 10);
        }
      } else {
        console.warn('Skipping activity log due to missing user data:', updateData.newUser);
      }
    }
    
    // Handle user status changes
    if (updateData.userStatusChange) {
      const { username, isActive } = updateData.userStatusChange;
      
      // Validate username exists before adding activity
      if (username) {
        dashboard.recentActivity.unshift({
          user: username,
          action: `User ${isActive ? 'activated' : 'deactivated'}`,
          time: new Date().toISOString(),
          status: isActive ? 'success' : 'info'
        });
        
        if (dashboard.recentActivity.length > 10) {
          dashboard.recentActivity = dashboard.recentActivity.slice(0, 10);
        }
      } else {
        console.warn('Skipping status change activity due to missing username');
      }
    }
    
    // Handle prompt test data
    if (updateData.promptTest) {
      const { tokens, model, latency, userCount } = updateData.promptTest;
      
      // Update token usage data
      const today = new Date().toISOString().split('T')[0];
      const existingTokenData = dashboard.tokenUsageData.find(item => item.date === today);
      
      if (existingTokenData) {
        existingTokenData.tokens += tokens || 0;
      } else {
        dashboard.tokenUsageData.push({
          date: today,
          tokens: tokens || 0
        });
      }
      
      // Update total prompts KPI
      const totalPromptsKpi = dashboard.kpiData.find(kpi => kpi.title === "Total Prompts Tested");
      if (totalPromptsKpi) {
        const currentValue = parseInt(totalPromptsKpi.value) || 0;
        totalPromptsKpi.value = (currentValue + 1).toString();
        totalPromptsKpi.change = "+1";
      }
      
      // Update model latency if provided
      if (model && latency) {
        const existingModel = dashboard.modelLatencyData.find(
          item => item.model === model
        );
        
        if (existingModel) {
          // Update with average
          existingModel.latency = (existingModel.latency + latency) / 2;
        } else {
          dashboard.modelLatencyData.push({
            model: model,
            latency: latency
          });
        }
        
        // Update most used LLM KPI (simplified logic)
        const mostUsedKpi = dashboard.kpiData.find(kpi => kpi.title === "Most Used LLM");
        if (mostUsedKpi) {
          mostUsedKpi.value = model;
        }
      }
      
      // Update active users if provided
      if (userCount) {
        const activeUsersKpi = dashboard.kpiData.find(kpi => kpi.title === "Active Users");
        if (activeUsersKpi) {
          activeUsersKpi.value = userCount.toString();
        }
      }
    }
    
    // Update response acceptance data
    if (updateData.responseAcceptance) {
      const { model, acceptance } = updateData.responseAcceptance;
      const existingData = dashboard.responseAcceptanceData.find(item => item.model === model);
      
      if (existingData) {
        existingData.value = acceptance;
      } else {
        dashboard.responseAcceptanceData.push({
          model,
          value: acceptance,
          color: getColorForModel(model)
        });
      }
    }
    
    dashboard.updatedAt = new Date();
    await dashboard.save();
    return dashboard;
    
  } catch (error) {
    console.error('Error updating admin dashboard:', error);
    throw error;
  }
};

/**
 * Helper function to get color for model (for charts)
 */
const getColorForModel = (model) => {
  const colors = {
    'GPT-4': '#3b82f6',
    'GPT-3.5': '#10b981',
    'Claude 3': '#f59e0b',
    'Gemini': '#ef4444',
    'LLaMA': '#8b5cf6'
  };
  return colors[model] || '#6b7280';
};

/**
 * Auto-update admin dashboard when user performs actions
 */
export const triggerAdminDashboardUpdate = async (adminId, actionType, data) => {
  try {
    const updateData = {};
    
    switch (actionType) {
      case 'USER_CREATED':
        updateData.newUser = data;
        break;
      case 'USER_STATUS_CHANGED':
        updateData.userStatusChange = data;
        break;
      case 'PROMPT_TESTED':
        updateData.promptTest = data;
        break;
      case 'RESPONSE_FEEDBACK':
        updateData.responseAcceptance = data;
        break;
      default:
        console.log(`Unknown action type: ${actionType}`);
        return;
    }
    
    await updateAdminDashboard(adminId, updateData);
    console.log(`Admin dashboard updated for action: ${actionType}`);
    
  } catch (error) {
    console.error(`Error triggering dashboard update for ${actionType}:`, error);
  }
};