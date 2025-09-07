import GlobalConfig from "../../models/Admin/ModelConfigSchema.js";
import AllModelsConfig from "../../models/AllModelConfig.js";
import UserDashboard from "../../models/User/UserDashboard.js";
import UserModel from "../../models/UserModel.js";
import PromptHistory from "../../models/User/PrompHistory.js";
import axios from "axios";
import AdminDashboard from "../../models/Admin/AdminDashboardSchema.js";
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
// controllers/promptTestingController.js

// Configure axios defaults
const axiosConfig = {
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * Controller function to handle prompt testing requests
 * Fetches configuration details and sends them to another server
 */
export const testPromptAcrossModels = async (req, res) => {
  try {
    const { userId, prompt, models, criteria } = req.body;
    console.log('Received prompt testing request:', { userId, prompt, models, criteria });
    // Input validation
    if (!userId || !prompt || !models || !criteria || models.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, prompt, models, or criteria'
      });
    }

    console.log('📋 Starting prompt testing process...');
    console.log('Selected Models:', models);
    console.log('Evaluation Criteria:', criteria);

    // Step 1: Verify user exists and get admin details
    const user = await UserModel.findById(userId)
      .populate('adminId')
      .populate('allowedModel');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Step 2: Filter selected models against user's allowed models
    const allowedModelIds = user.allowedModel.map(model => model._id.toString());
    const validSelectedModels = models.filter(modelId => 
      allowedModelIds.includes(modelId)
    );

    if (validSelectedModels.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'None of the selected models are allowed for this user'
      });
    }

    console.log('✅ Valid selected models:', validSelectedModels);

    // Step 3: Fetch all global configurations for the selected models
    const globalConfigs = await GlobalConfig.find({
      adminId: user.adminId._id,
      modelId: { $in: validSelectedModels },
      Enabled: true
    })
    .populate('modelId')
    .populate('modelConfigId')
    .populate('platformConfigId')
    .populate('adminId');

    if (globalConfigs.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No enabled configurations found for the selected models'
      });
    }

    console.log(`📊 Found ${globalConfigs.length} configurations`);

    // Step 4: Prepare the data structure to send to external server
    const configurationDetails = await Promise.all(
      globalConfigs.map(async (config) => {
        const modelDetails = await AllModelsConfig.findById(config.modelId._id);
        
        return {
          // Configuration Identity
          configId: config._id,
          adminId: config.adminId._id,
          adminUsername: config.adminId.username,
          
          // Model Information
          model: {
            id: modelDetails._id,
            name: modelDetails.name,
            provider: modelDetails.provider,
            endpoint: modelDetails.endpoint
          },
          
          // API Configuration
          apiKey: config.apiKey,
          
          // Model Configuration Parameters
          modelConfig: {
            temperature: config.modelConfigId.temperature,
            maxTokens: config.modelConfigId.maxTokens,
            topP: config.modelConfigId.topP,
            frequencyPenalty: config.modelConfigId.frequencyPenalty,
            presencePenalty: config.modelConfigId.presencePenalty
          },
          
          // Platform Configuration
          platformConfig: {
            defaultTimeout: config.platformConfigId.defaultTimeout,
            maxConcurrentRequests: config.platformConfigId.maxConcurrentRequests,
            rateLimitPerUser: config.platformConfigId.rateLimitPerUser,
            enableLogging: config.platformConfigId.enableLogging,
            enableAnalytics: config.platformConfigId.enableAnalytics
          },
          
          // Test Configuration
          testConfig: {
            prompt: prompt,
            evaluationCriteria: criteria,
            timestamp: new Date().toISOString()
          },
          
          // User Context
          userContext: {
            userId: user._id,
            userEmail: user.email,
            userFullName: user.fullName,
            isActive: user.isActive
          }
        };
      })
    );

    // Step 5: Prepare payload for external server
    const payloadToSend = {
      testSession: {
        sessionId: `test_${Date.now()}_${userId}`,
        prompt: prompt,
        evaluationCriteria: criteria,
        requestedAt: new Date().toISOString(),
        totalModels: configurationDetails.length
      },
      configurations: configurationDetails,
      metadata: {
        source: 'prompt-testing-platform',
        version: '1.0.0',
        adminDomain: user.adminId.username
      }
    };
    console.log(payloadToSend)
    console.log('📦 Prepared payload with', configurationDetails.length, 'configurations');

    // Step 6: Send data to external server
    const EXTERNAL_SERVER_URL = process.env.EXTERNAL_TESTING_SERVER_URL || 'http://localhost:3001/api/test-prompt';
    console.log(payloadToSend)
    try {
      console.log('🚀 Sending data to external server:', EXTERNAL_SERVER_URL);
      
      const externalResponse = await axios.post(EXTERNAL_SERVER_URL, payloadToSend, {
        ...axiosConfig,
        timeout: 60000, // Extended timeout for testing
        headers: {
          ...axiosConfig.headers,
          'X-Request-Source': 'prompt-testing-platform',
          'X-Session-Id': payloadToSend.testSession.sessionId
        }
      });

      console.log('✅ External server response received');
    console.log(externalResponse.data)
      // Step 7: Process and return the response
      if (externalResponse.data && externalResponse.data.success) {
        // Log the successful test for analytics
        await logTestActivity(userId, validSelectedModels, criteria, 'success');

        return res.status(200).json({
          success: true,
          message: 'Prompt testing completed successfully',
          data: {
            sessionId: payloadToSend.testSession.sessionId,
            results: externalResponse.data.results,
            summary: {
              totalModels: configurationDetails.length,
              testedModels: externalResponse.data.results?.length || 0,
              criteria: criteria,
              executionTime: externalResponse.data.executionTime
            },
            sentConfigurations: configurationDetails.map(config => ({
              modelName: config.model.name,
              provider: config.model.provider,
              configId: config.configId
            }))
          }
        });
      } else {
        throw new Error('External server returned unsuccessful response');
      }

    } catch (externalError) {
      console.error('❌ External server error:', externalError.message);
      
      // Log the failed test
      await logTestActivity(userId, validSelectedModels, criteria, 'external_server_error');

      // Check if it's a timeout or connection error
      if (externalError.code === 'ECONNABORTED' || externalError.code === 'ETIMEDOUT') {
        return res.status(504).json({
          success: false,
          error: 'External testing server timeout',
          details: 'The testing server is taking too long to respond',
          sentConfigurations: configurationDetails.map(config => ({
            modelName: config.model.name,
            provider: config.model.provider,
            configId: config.configId
          }))
        });
      }

      return res.status(503).json({
        success: false,
        error: 'External testing server unavailable',
        details: externalError.message,
        sentConfigurations: configurationDetails.map(config => ({
          modelName: config.model.name,
          provider: config.model.provider,
          configId: config.configId
        }))
      });
    }

  } catch (error) {
    console.error('💥 Error in testPromptAcrossModels:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error during prompt testing',
      details: error.message
    });
  }
};

/**
 * Helper function to get user's allowed models with full configuration details
 */
export const getUserAllowedModelsWithConfig = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;

    const user = await UserModel.findById(userId)
      .populate({
        path: 'allowedModel',
        select: 'name provider endpoint'
      })
      .populate('adminId');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get global configs for user's allowed models
    const globalConfigs = await GlobalConfig.find({
      adminId: user.adminId._id,
      modelId: { $in: user.allowedModel.map(m => m._id) },
      Enabled: true
    }).populate('modelConfigId platformConfigId');

    const modelsWithConfig = user.allowedModel.map(model => {
      const config = globalConfigs.find(gc => 
        gc.modelId.toString() === model._id.toString()
      );

      return {
        _id: model._id,
        name: model.name,
        provider: model.provider,
        endpoint: model.endpoint,
        isConfigured: !!config,
        hasApiKey: config ? !!config.apiKey : false,
        isEnabled: config ? config.Enabled : false
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        models: {
          allowedModel: modelsWithConfig,
          totalCount: modelsWithConfig.length,
          configuredCount: modelsWithConfig.filter(m => m.isConfigured).length
        },
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user allowed models:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user allowed models',
      details: error.message
    });
  }
};

/**
 * Helper function to log test activities for analytics
 */
const logTestActivity = async (userId, modelIds, criteria, status) => {
  try {
    // You can implement your logging logic here
    // This could be stored in a separate TestLog collection
    console.log(`📝 Test Activity Log:`, {
      userId,
      modelIds,
      criteria,
      status,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging test activity:', error);
  }
};

/**
 * Health check endpoint for external server connectivity
 */
export const checkExternalServerHealth = async (req, res) => {
  try {
    const EXTERNAL_SERVER_URL = process.env.EXTERNAL_TESTING_SERVER_URL || 'http://localhost:3001';
    
    const response = await axios.get(`${EXTERNAL_SERVER_URL}/health`, {
      timeout: 5000
    });

    return res.status(200).json({
      success: true,
      externalServer: {
        status: 'healthy',
        responseTime: response.headers['x-response-time'],
        url: EXTERNAL_SERVER_URL
      }
    });

  } catch (error) {
    return res.status(503).json({
      success: false,
      externalServer: {
        status: 'unhealthy',
        error: error.message,
        url: process.env.EXTERNAL_TESTING_SERVER_URL
      }
    });
  }
};

export const savePromptHistory = async (req, res) => {
  try {
    const { userId, prompt, models, criteria, results } = req.body;

    if (!userId || !prompt || !models || !criteria || !results) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    // Ensure user is saving only their own history
    if (userId !== req.user?.id?.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only save your own history."
      });
    }

    const history = new PromptHistory({
      userId,
      prompt,
      models,
      criteria,
      results
    });

    await history.save();
    
    // Get adminId from user
    const user = await UserModel.findById(req.user.id).select('adminId');
    const adminId = user.adminId;
    
    console.log('Admin ID:', adminId);

    // Update the dashboard - use aggregation pipeline to handle string conversion
    try {
      const result = await AdminDashboard.findOneAndUpdate(
        { adminId: adminId, 'kpiData.title': 'Total Prompts Tested' },
        [
          {
            $set: {
              'kpiData': {
                $map: {
                  input: '$kpiData',
                  as: 'kpi',
                  in: {
                    $cond: [
                      { $eq: ['$$kpi.title', 'Total Prompts Tested'] },
                      { 
                        $mergeObjects: [
                          '$$kpi',
                          { 
                            value: { 
                              $add: [
                                { $toInt: '$$kpi.value' }, 
                                1
                              ] 
                            } 
                          }
                        ]
                      },
                      '$$kpi'
                    ]
                  }
                }
              }
            }
          }
        ],
        { new: true, runValidators: true }
      );

      if (!result) {
        console.log('AdminDashboard not found for adminId:', adminId);
        // You might want to create a dashboard if it doesn't exist
      } else {
        console.log('Dashboard updated successfully');
      }
    } catch (dashboardError) {
      console.error('Error updating dashboard:', dashboardError);
      // Don't fail the entire request if dashboard update fails
    }

    return res.status(201).json({
      success: true,
      message: "Prompt history saved successfully",
      data: history
    });
  } catch (error) {
    console.error("Error saving prompt history:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while saving prompt history",
      details: error.message
    });
  }
};

// controller/User/userController.js
export const getPromptHistory = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "Missing userId query parameter",
      });
    }

    // Ensure user can only access their own history unless admin
    if (userId !== req.user?.id?.toString() && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only view your own history.",
      });
    }

    // Disable caching to avoid 304 responses
    res.set("Cache-Control", "no-store");

    // Fetch prompt history and populate both models and results.modelId
    const history = await PromptHistory.find({ userId })
      .sort({ createdAt: -1 })
      .populate("models", "name provider endpoint")
      .populate("results.modelId", "name provider endpoint")
      .lean();

    // Format history
    const formattedHistory = history.map((item) => ({
      ...item,
      models: Array.isArray(item.models)
        ? item.models.map((m) => ({
            name: m?.name || "Unknown",
            provider: m?.provider || "Unknown",
            endpoint: m?.endpoint || "Unknown",
          }))
        : [],
      results: Array.isArray(item.results)
        ? item.results.map((r) => ({
            ...r,
            model: r.modelId
              ? {
                  name: r.modelId.name || "Unknown",
                  provider: r.modelId.provider || "Unknown",
                  endpoint: r.modelId.endpoint || "Unknown",
                }
              : null,
          }))
        : [],
    }));

    return res.status(200).json({
      success: true,
      history: formattedHistory,
    });
  } catch (error) {
    console.error("Error fetching prompt history:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while fetching prompt history",
      details: error.message,
    });
  }
};

