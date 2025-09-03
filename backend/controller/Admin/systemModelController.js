import { MODEL_CONFIGS } from "../../services/llmService.js";
import { config } from "../../globalconfig.js";

// Get all available system models
export const getSystemModels = async (req, res) => {
  try {
    // Combine hardcoded models with global config
    const systemModels = Object.entries(MODEL_CONFIGS).map(([id, modelConfig]) => ({
      id,
      name: modelConfig.displayName,
      provider: modelConfig.provider,
      modelName: modelConfig.modelName,
      maxTokens: modelConfig.maxTokens,
      temperature: modelConfig.temperature,
      source: 'hardcoded'
    }));

    const providersInfo = Object.entries(config.providers).map(([providerId, provider]) => ({
      providerId,
      name: provider.name,
      models: Object.entries(provider.models).map(([modelId, model]) => ({
        modelId,
        name: model.name,
        route: model.route,
        defaultParams: model.defaultParams
      }))
    }));

    res.status(200).json({
      success: true,
      data: {
        systemModels,
        availableProviders: providersInfo,
        totalModels: systemModels.length
      }
    });
  } catch (error) {
    console.error("Error fetching system models:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Add a new provider to the system (requires restart)
export const addSystemProvider = async (req, res) => {
  try {
    const { providerId, providerName, models } = req.body;

    // Validate input
    if (!providerId || !providerName || !models || !Array.isArray(models)) {
      return res.status(400).json({
        success: false,
        message: "Provider ID, name, and models array are required"
      });
    }

    // Check if provider already exists
    if (config.providers[providerId]) {
      return res.status(409).json({
        success: false,
        message: `Provider '${providerId}' already exists`
      });
    }

    // Format models
    const formattedModels = {};
    models.forEach(model => {
      if (model.modelId && model.name) {
        formattedModels[model.modelId] = {
          name: model.name,
          route: model.route || '/v1/chat/completions',
          defaultParams: model.defaultParams || {
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
          }
        };
      }
    });

    // Add to global config (runtime only - requires code update for persistence)
    config.providers[providerId] = {
      name: providerName,
      models: formattedModels
    };

    res.status(201).json({
      success: true,
      message: `Provider '${providerId}' added successfully. Restart server to persist changes.`,
      data: {
        providerId,
        providerName,
        modelsCount: Object.keys(formattedModels).length
      }
    });
  } catch (error) {
    console.error("Error adding system provider:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Get available model templates for adding new models
export const getModelTemplates = async (req, res) => {
  try {
    const templates = {
      openai: {
        name: "OpenAI",
        models: ["gpt-4", "gpt-3.5-turbo", "gpt-4-turbo", "gpt-4o"],
        defaultParams: {
          temperature: 0.7,
          max_tokens: 4096,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        }
      },
      anthropic: {
        name: "Anthropic",
        models: ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
        defaultParams: {
          temperature: 0.7,
          max_tokens: 4096,
          top_p: 1
        }
      },
      groq: {
        name: "Groq",
        models: ["llama2-70b-4096", "mixtral-8x7b-32768", "gemma-7b-it"],
        defaultParams: {
          temperature: 0.7,
          max_tokens: 4096,
          top_p: 1
        }
      },
      google: {
        name: "Google",
        models: ["gemini-pro", "gemini-pro-vision"],
        defaultParams: {
          temperature: 0.7,
          max_tokens: 2048,
          top_p: 1
        }
      },
      azure: {
        name: "Azure OpenAI",
        models: ["gpt-4", "gpt-35-turbo"],
        defaultParams: {
          temperature: 0.7,
          max_tokens: 4096,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        }
      }
    };

    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error("Error fetching model templates:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
