// routes/llmTesting.js - Routes for LLM prompt testing
import express from 'express';
import { testPromptWithModels, getAvailableModels, validateApiKeys } from '../services/llmService.js';
import authenticateToken from '../middleware/authMiddleware.js';
import User from '../models/UserModel.js';
import ModelConfig from '../models/ModelConfig.js';

const router = express.Router();

// Test prompt with multiple models
router.post('/test-prompt', authenticateToken, async (req, res) => {
  try {
    const { prompt, modelIds, evaluationCriteria } = req.body;
    const userId = req.user.id; // Get userId from authenticated token

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required and must be a non-empty string',
      });
    }

    if (!modelIds || !Array.isArray(modelIds) || modelIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Model IDs are required and must be a non-empty array',
      });
    }

    // Validate that user has access to the requested models
    const user = await User.findById(userId).select('allowedModels adminId');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if user has any allowed models
    if (!user.allowedModels || user.allowedModels.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'No model access granted. Contact your administrator.',
      });
    }

    // Get user's allowed model configs to validate against modelIds
    const userAllowedModelConfigs = await ModelConfig.find({
      _id: { $in: user.allowedModels },
      adminId: user.adminId
    });

    const allowedModelIds = new Set(userAllowedModelConfigs.map(m => m._id.toString()));
    
    // Validate that all requested modelIds are in user's allowed list
    const unauthorizedModels = modelIds.filter(id => !allowedModelIds.has(id));
    if (unauthorizedModels.length > 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to some models',
        unauthorizedModels,
        message: 'You can only test with models you have been granted access to.',
      });
    }

    console.log(`Testing prompt with ${modelIds.length} models for user ${userId}:`, modelIds);
    
    const results = await testPromptWithModels(prompt, modelIds, {
      userId,
      evaluationCriteria: evaluationCriteria || ['accuracy', 'tokens', 'responseTime'],
      saveHistory: true
    });

    // Log the results for debugging
    console.log('LLM Test Results:', results.map(r => ({
      model: r.modelName,
      success: r.success,
      responseLength: r.response?.length || 0,
      error: r.error,
    })));

    res.json({
      success: true,
      data: {
        prompt,
        timestamp: new Date().toISOString(),
        results,
        summary: {
          totalModels: modelIds.length,
          successfulResponses: results.filter(r => r.success).length,
          failedResponses: results.filter(r => !r.success).length,
          averageResponseTime: results
            .filter(r => r.success)
            .reduce((sum, r) => sum + (r.metrics?.responseTime || 0), 0) / 
            Math.max(1, results.filter(r => r.success).length),
        },
      },
    });
  } catch (error) {
    console.error('Error in /test-prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while testing prompt',
      details: error.message,
    });
  }
});

// Get available models (filtered by user permissions)
router.get('/models', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's allowed models
    const user = await User.findById(userId).select('allowedModels adminId');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // If user has no allowed models, return empty array
    if (!user.allowedModels || user.allowedModels.length === 0) {
      return res.json({
        success: true,
        data: {
          models: [],
          apiKeyStatus: {},
          apiKeyDetails: {},
          totalModels: 0,
          availableProviders: [],
          configuredInDatabase: 0,
          message: 'No models available. Contact your administrator to get model access.'
        },
      });
    }

    // Get all available models
    const allModels = await getAvailableModels();
    
    // Filter models to only include those the user is allowed to access
    const userAllowedModelConfigs = await ModelConfig.find({
      _id: { $in: user.allowedModels },
      adminId: user.adminId
    });

    // Create a map of allowed model IDs for quick lookup
    const allowedModelIds = new Set(userAllowedModelConfigs.map(m => m._id.toString()));
    
    // Filter the available models to only include allowed ones
    const filteredModels = allModels.filter(model => {
      // For database-sourced models, check if the model ID is in user's allowed list
      if (model.source === 'database' && model.configId) {
        return allowedModelIds.has(model.configId.toString());
      }
      return false; // Don't include non-database models for security
    });

    const apiKeyStatus = await validateApiKeys();

    res.json({
      success: true,
      data: {
        models: filteredModels,
        apiKeyStatus: apiKeyStatus.combined,
        apiKeyDetails: apiKeyStatus,
        totalModels: filteredModels.length,
        availableProviders: Object.keys(apiKeyStatus.combined).filter(key => apiKeyStatus.combined[key]),
        configuredInDatabase: filteredModels.filter(m => m.source === 'database').length,
        userAllowedModels: user.allowedModels.length,
      },
    });
  } catch (error) {
    console.error('Error in /models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available models',
      details: error.message,
    });
  }
});

// Health check for LLM services
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const apiKeyStatus = await validateApiKeys();
    const healthStatus = {};
    
    // Create health status for each provider
    for (const provider of Object.keys(apiKeyStatus.combined)) {
      if (apiKeyStatus.database[provider]) {
        healthStatus[provider] = 'configured_in_database';
      } else if (apiKeyStatus.environment[provider]) {
        healthStatus[provider] = 'configured_in_environment';
      } else {
        healthStatus[provider] = 'not_configured';
      }
    }

    const overallHealth = Object.values(apiKeyStatus.combined).some(status => status) ? 'healthy' : 'no_providers_configured';

    res.json({
      success: true,
      data: {
        status: overallHealth,
        providers: healthStatus,
        timestamp: new Date().toISOString(),
        configuredProviders: Object.keys(healthStatus).filter(key => healthStatus[key].includes('configured')),
        databaseConfigs: Object.keys(apiKeyStatus.database).filter(key => apiKeyStatus.database[key]),
        environmentConfigs: Object.keys(apiKeyStatus.environment).filter(key => apiKeyStatus.environment[key]),
      },
    });
  } catch (error) {
    console.error('Error in /health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check LLM service health',
      details: error.message,
    });
  }
});

// Test single model (useful for debugging)
router.post('/test-single', authenticateToken, async (req, res) => {
  try {
    const { prompt, modelId } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required and must be a non-empty string',
      });
    }

    if (!modelId || typeof modelId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Model ID is required and must be a string',
      });
    }

    console.log(`Testing single model: ${modelId}`);
    
    const results = await testPromptWithModels(prompt, [modelId]);
    const result = results[0];

    res.json({
      success: true,
      data: {
        prompt,
        modelId,
        timestamp: new Date().toISOString(),
        result,
      },
    });
  } catch (error) {
    console.error('Error in /test-single:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while testing single model',
      details: error.message,
    });
  }
});

export default router;
