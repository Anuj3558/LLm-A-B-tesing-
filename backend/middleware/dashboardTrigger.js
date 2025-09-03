// middleware/dashboardTrigger.js
import { triggerAdminDashboardUpdate } from '../services/dashboardUtils.js';

/**
 * Middleware to trigger admin dashboard updates
 */
export const triggerDashboardUpdate = (actionType) => {
  return async (req, res, next) => {
    // Store original res.json method
    const originalJson = res.json;
    
    // Override res.json to capture successful responses
    res.json = function(data) {
      // Call original method first
      originalJson.call(this, data);
      
      // If response was successful, trigger dashboard update
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setImmediate(async () => {
          try {
            let updateData = {};
            
            switch (actionType) {
              case 'USER_CREATED':
                if (req.user && req.user.id && data.user) {
                  updateData = {
                    username: data.user.username,
                    fullName: data.user.fullName,
                    email: data.user.email
                  };
                  await triggerAdminDashboardUpdate(req.user.id, actionType, updateData);
                }
                break;
                
              case 'USER_STATUS_CHANGED':
                if (req.user && req.user.id && data.user) {
                  updateData = {
                    username: data.user.username,
                    isActive: data.user.isActive
                  };
                  await triggerAdminDashboardUpdate(req.user.id, actionType, updateData);
                }
                break;
                
              case 'PROMPT_TESTED':
                if (req.body.adminId) {
                  updateData = {
                    tokens: req.body.tokensUsed || 0,
                    model: req.body.model,
                    latency: req.body.responseTime,
                    userCount: 1
                  };
                  await triggerAdminDashboardUpdate(req.body.adminId, actionType, updateData);
                }
                break;
                
              default:
                console.log(`Dashboard trigger: Unknown action type ${actionType}`);
            }
          } catch (error) {
            console.error(`Error in dashboard trigger middleware for ${actionType}:`, error);
          }
        });
      }
    };
    
    next();
  };
};

/**
 * Manual trigger function for dashboard updates
 */
export const manualTriggerDashboardUpdate = async (adminId, actionType, data) => {
  try {
    await triggerAdminDashboardUpdate(adminId, actionType, data);
  } catch (error) {
    console.error('Error in manual dashboard trigger:', error);
    throw error;
  }
};
