import { config } from '../../globalconfig.js';
import GlobalConfig from '../../models/GlobalConfig.js';

// Helper function to get or create global config from database
const getOrCreateGlobalConfig = async () => {
  try {
    let globalConfig = await GlobalConfig.findOne({ configKey: 'main' });
    
    if (!globalConfig) {
      // Create default config if it doesn't exist
      globalConfig = new GlobalConfig({
        configKey: 'main',
        models: [],
        platform: {
          defaultTimeout: 30,
          maxConcurrentRequests: 10,
          rateLimitPerUser: 100,
          enableLogging: true,
          enableAnalytics: true
        }
      });
      await globalConfig.save();
    }
    
    return globalConfig;
  } catch (error) {
    console.error('Error getting/creating global config:', error);
    throw error;
  }
};

// Export function to access global config data
export const getGlobalConfigData = async () => {
  try {
    const globalConfig = await getOrCreateGlobalConfig();
    
    // Convert array back to object format for compatibility
    const modelsObject = {};
    globalConfig.models.forEach(model => {
      modelsObject[model.modelId] = {
        enabled: model.enabled,
        apiKey: model.apiKey,
        maxTokens: model.maxTokens,
        temperature: model.temperature,
        topP: model.topP,
        frequencyPenalty: model.frequencyPenalty,
        presencePenalty: model.presencePenalty
      };
    });
    
    return {
      models: modelsObject,
      platform: globalConfig.platform
    };
  } catch (error) {
    console.error('Error getting global config data:', error);
    return {
      models: {},
      platform: {
        defaultTimeout: 30,
        maxConcurrentRequests: 10,
        rateLimitPerUser: 100,
        enableLogging: true,
        enableAnalytics: true
      }
    };
  }
};

// Get global configuration
export const getGlobalConfig = async (req, res) => {
  try {
    const globalConfig = await getOrCreateGlobalConfig();
    
    // Convert array back to object format for response
    const modelsObject = {};
    globalConfig.models.forEach(model => {
      modelsObject[model.modelId] = {
        enabled: model.enabled,
        apiKey: model.apiKey,
        maxTokens: model.maxTokens,
        temperature: model.temperature,
        topP: model.topP,
        frequencyPenalty: model.frequencyPenalty,
        presencePenalty: model.presencePenalty
      };
    });
    
    res.status(200).json({
      message: "Global configuration retrieved successfully",
      config: {
        models: modelsObject,
        platform: globalConfig.platform
      }
    });
  } catch (error) {
    console.error("Error getting global config:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update global configuration
export const updateGlobalConfig = async (req, res) => {
  try {
    const { config: newConfig } = req.body;
    
    if (!newConfig) {
      return res.status(400).json({ 
        message: "Configuration data is required" 
      });
    }

    // Get or create the global config document
    const globalConfig = await getOrCreateGlobalConfig();
    
    // Update the configuration
    if (newConfig.models) {
      // Convert object to array format
      globalConfig.models = Object.entries(newConfig.models).map(([modelId, modelConfig]) => ({
        modelId,
        enabled: modelConfig.enabled || true,
        apiKey: modelConfig.apiKey || '',
        maxTokens: modelConfig.maxTokens || 4000,
        temperature: modelConfig.temperature || 0.7,
        topP: modelConfig.topP || 1,
        frequencyPenalty: modelConfig.frequencyPenalty || 0,
        presencePenalty: modelConfig.presencePenalty || 0
      }));
    }
    
    if (newConfig.platform) {
      globalConfig.platform = { ...globalConfig.platform, ...newConfig.platform };
    }
    
    globalConfig.lastUpdated = new Date();
    globalConfig.updatedBy = req.user.id;
    
    // Save to database
    await globalConfig.save();
    
    // Convert back to object format for response
    const modelsObject = {};
    globalConfig.models.forEach(model => {
      modelsObject[model.modelId] = {
        enabled: model.enabled,
        apiKey: model.apiKey,
        maxTokens: model.maxTokens,
        temperature: model.temperature,
        topP: model.topP,
        frequencyPenalty: model.frequencyPenalty,
        presencePenalty: model.presencePenalty
      };
    });
    
    console.log("Configuration saved to database:", {
      models: modelsObject,
      platform: globalConfig.platform
    });
    
    res.status(200).json({
      message: "Configuration saved successfully",
      config: {
        models: modelsObject,
        platform: globalConfig.platform
      }
    });
  } catch (error) {
    console.error("Error updating global config:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get available models from all providers
export const getAvailableModels = async (req, res) => {
  try {
    const models = [];
    
    // Extract models from the global config
    Object.entries(config.providers).forEach(([providerId, provider]) => {
      Object.entries(provider.models).forEach(([modelId, model]) => {
        models.push({
          id: modelId,
          name: model.name,
          provider: providerId,
          providerName: provider.name,
          route: model.route,
          defaultParams: model.defaultParams
        });
      });
    });

    res.status(200).json({
      message: "Available models retrieved successfully",
      models: models
    });
  } catch (error) {
    console.error("Error getting available models:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get configured models from global config (models that have been configured by admins)
export const getConfiguredModels = async (req, res) => {
  try {
    const configuredModels = [];
    
    // Get the saved global config from database
    const globalConfig = await getOrCreateGlobalConfig();
    const savedModels = globalConfig.models || [];
    
    // Extract configured models from the saved global config
    if (savedModels && savedModels.length > 0) {
      savedModels.forEach((modelConfig) => {
        const modelId = modelConfig.modelId;
        
        // Find the model info from the base config
        let modelInfo = null;
        let providerName = 'Unknown';
        
        // Search through providers to find model details
        Object.entries(config.providers).forEach(([providerId, provider]) => {
          if (provider.models[modelId]) {
            modelInfo = provider.models[modelId];
            providerName = provider.name;
          }
        });
        
        if (modelInfo || modelConfig.enabled) {
          configuredModels.push({
            id: modelId,
            name: modelInfo ? modelInfo.name : modelId,
            provider: providerName.toLowerCase().replace(' ', '_'),
            description: modelInfo ? `${providerName} ${modelInfo.name}` : `Custom model: ${modelId}`,
            enabled: modelConfig.enabled || false,
            adminId: req.user.id, // Current admin
            adminUsername: req.user.username || "Current Admin",
            apiKey: modelConfig.apiKey ? "***configured***" : "Not configured",
            maxTokens: modelConfig.maxTokens || 4000,
            temperature: modelConfig.temperature || 0.7
          });
        }
      });
    }

    console.log('Returning configured models from database:', configuredModels);

    res.status(200).json({
      message: "Configured models retrieved successfully",
      models: configuredModels
    });
  } catch (error) {
    console.error("Error getting configured models:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get providers list
export const getProviders = async (req, res) => {
  try {
    const providers = Object.entries(config.providers).map(([id, provider]) => ({
      id,
      name: provider.name,
      modelCount: Object.keys(provider.models).length
    }));

    res.status(200).json({
      message: "Providers retrieved successfully",
      providers: providers
    });
  } catch (error) {
    console.error("Error getting providers:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get models for specific provider
export const getProviderModels = async (req, res) => {
  try {
    const { providerId } = req.params;
    
    if (!config.providers[providerId]) {
      return res.status(404).json({ 
        message: "Provider not found" 
      });
    }

    const provider = config.providers[providerId];
    const models = Object.entries(provider.models).map(([modelId, model]) => ({
      id: modelId,
      name: model.name,
      route: model.route,
      defaultParams: model.defaultParams
    }));

    res.status(200).json({
      message: "Provider models retrieved successfully",
      provider: {
        id: providerId,
        name: provider.name
      },
      models: models
    });
  } catch (error) {
    console.error("Error getting provider models:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};
