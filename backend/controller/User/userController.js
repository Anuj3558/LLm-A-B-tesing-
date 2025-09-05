import UserDashboard from "../../models/User/UserDashboard.js";
import UserModel from "../../models/UserModel.js";

// @desc    Get user dashboard data
// @route   GET /api/dashboards/user/:userId
// @access  Private
export const getUserDashboard = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the user is accessing their own dashboard
    console.log("Fetching dashboard for user:", userId);
    console.log("Authenticated user:", req.user.id.toString(), "Role:", req.user.role);
    if (userId !== req.user?.id?.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. You can only view your own dashboard.' 
      });
    }
    
    // Get dashboard data
    const dashboard = await UserDashboard.getUserDashboard(userId);
    console.log("Dashboard data retrieved:", dashboard);
    // If no dashboard found (shouldn't happen with getUserDashboard method)
    if (!dashboard) {
      return res.status(404).json({ 
        success: false,
        error: 'Dashboard not found' 
      });
    }
    
    // Convert Map to Object for JSON serialization
    const modelUsageDistribution = {};
    dashboard.modelUsageDistribution.forEach((value, key) => {
      modelUsageDistribution[key] = value;
    });
    
    // Prepare response data
    const dashboardData = {
      promptsTested: dashboard.promptsTested,
      bestPerformingModel: dashboard.bestPerformingModel,
      accuracy: dashboard.accuracy,
      averageResponseTime: dashboard.averageResponseTime,
      tokensUsedThisWeek: dashboard.tokensUsedThisWeek,
      modelUsageDistribution,
      weeklyPerformanceScores: dashboard.weeklyPerformanceScores,
      feedback: dashboard.feedback,
      testLogs: dashboard.testLogs
    };
    
    res.status(200).json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// @desc    Get allowed models for user
// @route   GET /api/user/allowed-models
// @access  Private
export const getAllowedModels = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch user from database
    const user = await UserModel.findById(userId).populate('allowedModel');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    // Return allowed models
    res.status(200).json({
      success: true,
      data: {
        models: user || []
      }
    });
    
  } catch (error) {
    console.error('Error fetching allowed models:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};