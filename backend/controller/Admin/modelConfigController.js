import GlobalConfig, { PlatformConfig } from "../../models/Admin/ModelConfigSchema.js";
import AllModelsConfig from "../../models/AllModelConfig.js";
import { ModelConfig } from "../../models/Admin/ModelConfigSchema.js";
import AdminDashboard from "../../models/Admin/AdminDashboardSchema.js";
import mongoose from "mongoose";
import UserModel from "../../models/UserModel.js";

// Helper function to validate model config data
const validateModelConfigData = (config) => {
  const errors = [];

  if (config.temperature !== undefined) {
    const temp = Number(config.temperature);
    if (isNaN(temp) || temp < 0 || temp > 2) {
      errors.push("Temperature must be between 0 and 2");
    }
  }

  if (config.maxTokens !== undefined) {
    const tokens = Number(config.maxTokens);
    if (isNaN(tokens) || tokens < 1 || tokens > 32000) {
      errors.push("Max tokens must be between 1 and 32000");
    }
  }

  if (config.topP !== undefined) {
    const topP = Number(config.topP);
    if (isNaN(topP) || topP < 0 || topP > 1) {
      errors.push("Top P must be between 0 and 1");
    }
  }

  if (config.frequencyPenalty !== undefined) {
    const penalty = Number(config.frequencyPenalty);
    if (isNaN(penalty) || penalty < -2 || penalty > 2) {
      errors.push("Frequency penalty must be between -2 and 2");
    }
  }

  if (config.presencePenalty !== undefined) {
    const penalty = Number(config.presencePenalty);
    if (isNaN(penalty) || penalty < -2 || penalty > 2) {
      errors.push("Presence penalty must be between -2 and 2");
    }
  }

  return errors;
};

// Helper function to update admin dashboard activity
const updateAdminActivity = async (adminId, type, modelName, status = "success") => {
  try {
    await AdminDashboard.findOneAndUpdate(
      { adminId: adminId },
      {
        $push: {
          recentActivity: {
            type,
            user: modelName || "Unknown Model",
            status,
            time: new Date().toDateString(),
            action: `Model '${modelName || "Unknown Model"}' ${type.toLowerCase()} by admin`
          }
        }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Error updating admin dashboard:", error);
  }
};

// Add Admin Model Configuration
export const AddAdminModelConfig = async (req, res) => {
  try {
    const { modelId, config } = req.body;
    const adminId = req.user.id;

    // Validate required fields
    if (!modelId || !config ) {
      return res.status(400).json({
        success: false,
        message: "ModelId, config, and apiKey are required"
      });
    }

    // Validate config data
    const validationErrors = validateModelConfigData(config);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }

    // Check if model exists
    const modelExists = await AllModelsConfig.findById(modelId);
    if (!modelExists) {
      return res.status(404).json({
        success: false,
        message: "Model not found"
      });
    }

    // Check if this specific model already exists for this admin
    const existingGlobalConfig = await GlobalConfig.findOne({
      adminId: adminId,
      modelId: modelId
    });

    if (existingGlobalConfig) {
      return res.status(409).json({
        success: false,
        message: "Model configuration already exists for this admin"
      });
    }

    // Create ModelConfig document
    const modelConfig = new ModelConfig({
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 2048,
      topP: config.topP || 1,
      frequencyPenalty: config.frequencyPenalty || 0,
      presencePenalty: config.presencePenalty || 0
    });

    const savedModelConfig = await modelConfig.save();

    // Handle PlatformConfig
    let platformConfigId;
    const existingPlatformConfig = await PlatformConfig.findOne({});

    if (existingPlatformConfig) {
      platformConfigId = existingPlatformConfig._id;
    } else {
      const platformConfig = new PlatformConfig({
        defaultTimeout: config.platformConfig?.defaultTimeout || 30,
        maxConcurrentRequests: config.platformConfig?.maxConcurrentRequests || 10,
        rateLimitPerUser: config.platformConfig?.rateLimitPerUser || 100,
        enableLogging: config.platformConfig?.enableLogging !== undefined ? config.platformConfig.enableLogging : true,
        enableAnalytics: config.platformConfig?.enableAnalytics !== undefined ? config.platformConfig.enableAnalytics : true
      });

      const savedPlatformConfig = await platformConfig.save();
      platformConfigId = savedPlatformConfig._id;
    }
    console.log(config.apiKey)
    // Create new GlobalConfig document
    const globalConfig = new GlobalConfig({
      adminId: adminId,
      modelId: modelId,
      apiKey: config.apiKey,
      modelConfigId: savedModelConfig._id,
      platformConfigId: platformConfigId,
      Enabled: config.Enabled !== undefined ? config.Enabled : true
    });

    await globalConfig.save();

    // Populate the response with related data
    const populatedConfig = await GlobalConfig.findById(globalConfig._id)
      .populate('modelId')
      .populate('platformConfigId')
      .populate('modelConfigId')
      .populate('adminId');

    // Update admin dashboard
    const modelName = modelExists.name;
    await updateAdminActivity(adminId, "Model Added", modelName);

    res.status(201).json({
      success: true,
      message: "Model configuration added successfully",
      data: populatedConfig
    });

  } catch (error) {
    console.error("Error adding model configuration:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Configuration already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get All Admin Models (Raw Data)
export const GetAllAdminModelsRaw = async (req, res) => {
  try {
    const adminId = req.user.id;

    const adminModels = await GlobalConfig.find({ adminId: adminId })
      .populate('modelId')
      .populate('platformConfigId')
      .populate('modelConfigId')
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 });

    if (!adminModels || adminModels.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No model configurations found for this admin"
      });
    }

    // Transform the data
    const transformedData = adminModels.map(config => ({
      _id: config._id,
      globalConfigId: config._id,
      adminId: config.adminId,
      Enabled: config.Enabled,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
      model: config.modelId,
      modelConfig: config.modelConfigId,
      platformConfig: config.platformConfigId,
      apiKey: config.apiKey
    }));

    res.status(200).json({
      success: true,
      message: "Admin model configurations retrieved successfully",
      count: transformedData.length,
      data: transformedData
    });

  } catch (error) {
    console.error("Error fetching admin model configurations:", error);
    
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get All Available Models
export const getAllModel = async (req, res) => {
  try {
    const allModels = await AllModelsConfig.find({}).sort({ createdAt: -1 });
    
    if (!allModels || allModels.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No models found"
      });
    }

    res.status(200).json({
      success: true,
      message: "All models retrieved successfully",
      count: allModels.length,
      data: allModels
    });
  } catch (error) {
    console.error("Error fetching all models:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update Model Configuration
export const updateModelConfig = async (req, res) => {
  try {
    const { globalConfigId } = req.params;
    const updateData = req.body;
    const adminId = req.user.id;
    
    console.log("Update request received:", { globalConfigId, updateData });

    // Validate globalConfigId
    if (!globalConfigId) {
      return res.status(400).json({
        success: false,
        message: "Global configuration ID is required",
      });
    }

    // Verify admin owns this configuration
    const globalConfig = await GlobalConfig.findOne({
      _id: globalConfigId,
      adminId: adminId
    }).populate('modelId').populate('modelConfigId');

    if (!globalConfig) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this configuration",
      });
    }

    // Separate API key updates from model config updates
    let apiKeyUpdated = false;
    let modelConfigUpdated = false;
    const modelConfigUpdateData = {};
    const validationErrors = [];

    // Handle API key update
    if (updateData.apiKey !== undefined) {
      if (typeof updateData.apiKey !== 'string' || updateData.apiKey.trim() === '') {
        validationErrors.push("API key must be a non-empty string");
      } else {
        globalConfig.apiKey = updateData.apiKey;
        apiKeyUpdated = true;
      }
    }

    // Handle model configuration updates
    const modelConfigFields = ['temperature', 'maxTokens', 'topP', 'frequencyPenalty', 'presencePenalty'];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (modelConfigFields.includes(key)) {
        // Validate model config fields
        const fieldValidation = validateModelConfigData({ [key]: value });
        if (fieldValidation.length > 0) {
          validationErrors.push(...fieldValidation);
        } else {
          modelConfigUpdateData[key] = value;
          modelConfigUpdated = true;
        }
      }
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }

    // Check if there's any valid data to update
    if (!apiKeyUpdated && Object.keys(modelConfigUpdateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    // Update model configuration if needed
    if (modelConfigUpdated) {
      await ModelConfig.findByIdAndUpdate(
        globalConfig.modelConfigId,
        modelConfigUpdateData,
        { 
          new: true, 
          runValidators: true 
        }
      );
    }

    // Save global config if API key was updated
    if (apiKeyUpdated) {
      await globalConfig.save();
    }

    // Get updated data for response
    const updatedGlobalConfig = await GlobalConfig.findById(globalConfigId)
      .populate('modelId')
      .populate('modelConfigId')
      .populate('platformConfigId');

    // Update admin dashboard
    let activityMessage = "Model Configuration Updated";
    if (apiKeyUpdated && modelConfigUpdated) {
      activityMessage = "Model Configuration and API Key Updated";
    } else if (apiKeyUpdated) {
      activityMessage = "API Key Updated";
    }
    
    await updateAdminActivity(adminId, activityMessage, globalConfig.modelId.name);

    res.status(200).json({
      success: true,
      message: "Configuration updated successfully",
      data: {
        globalConfig: updatedGlobalConfig,
        updatedFields: {
          apiKey: apiKeyUpdated,
          modelConfig: modelConfigUpdated
        }
      },
    });

  } catch (error) {
    console.error("Error updating configuration:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update API Key
export const updateApiKey = async (req, res) => {
  try {
    const { globalConfigId } = req.params;
    const { apiKey } = req.body;
    const adminId = req.user.id;

    if (!globalConfigId || !apiKey) {
      return res.status(400).json({
        success: false,
        message: "Global config ID and API key are required"
      });
    }

    // Verify admin owns this configuration
    const globalConfig = await GlobalConfig.findOne({
      _id: globalConfigId,
      adminId: adminId
    }).populate('modelId');

    if (!globalConfig) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this configuration",
      });
    }

    // Update API key
    globalConfig.apiKey = apiKey;
    await globalConfig.save();

    // Update admin dashboard
    await updateAdminActivity(adminId, "API Key Updated", globalConfig.modelId.name);

    res.status(200).json({
      success: true,
      message: "API key updated successfully",
      data: { apiKey: globalConfig.apiKey }
    });

  } catch (error) {
    console.error("Error updating API key:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Toggle Model Status
export const toggleModelStatus = async (req, res) => {
  try {
    const { modelConfigId } = req.params;
    const { isActive } = req.body;
    const adminId = req.user.id;
    console.log(req.body)
    // Validate input
    if (!modelConfigId) {
      return res.status(400).json({
        success: false,
        message: "Global configuration ID is required",
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "Enabled must be a boolean value",
      });
    }

    // Verify admin owns this configuration
    const globalConfig = await GlobalConfig.findOne({
      _id: modelConfigId,
      adminId: adminId
    }).populate('modelId');
    console.log(modelConfigId)
    if (!globalConfig) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to modify this configuration",
      });
    }

    // Update the Enabled status
    globalConfig.Enabled = isActive;
    await globalConfig.save();

    // Update admin dashboard
    const action = isActive ? "Model Activated" : "Model Deactivated";
    await updateAdminActivity(adminId, action, globalConfig.modelId.name);

    res.status(200).json({
      success: true,
      message: `Model ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        globalConfigId: globalConfig._id,
        Enabled: globalConfig.Enabled
      },
    });

  } catch (error) {
    console.error("Error toggling model status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Admin Models Raw (All Admins)
export const getAdminModelsRaw = async (req, res) => {
  try {
    // Get all global configs with populated references
    const globalConfigs = await GlobalConfig.find({})
      .populate('modelId')
      .populate('modelConfigId')
      .populate('platformConfigId')
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 });

    if (!globalConfigs || globalConfigs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No configurations found"
      });
    }

    // Transform the data
    const transformedData = globalConfigs.map(config => ({
      _id: config._id,
      globalConfigId: config._id,
      Enabled: config.Enabled,
      admin: {
        _id: config.adminId._id,
        name: config.adminId.name,
        email: config.adminId.email
      },
      modelConfig: config.modelConfigId,
      model: config.modelId,
      apiKey: config.apiKey,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
      platformConfig: config.platformConfigId
    }));

    res.status(200).json({
      success: true,
      message: "Admin models retrieved successfully",
      count: transformedData.length,
      data: transformedData,
    });

  } catch (error) {
    console.error("Error fetching admin models:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete Model Configuration
export const deleteModelConfig = async (req, res) => {
  try {
    const { globalConfigId } = req.params;
    const adminId = req.user.id;

    if (!globalConfigId) {
      return res.status(400).json({
        success: false,
        message: "Global configuration ID is required",
      });
    }

    // Verify ownership
    const globalConfig = await GlobalConfig.findOne({
      _id: globalConfigId,
      adminId: adminId,
    }).populate("modelId");

    if (!globalConfig) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this configuration",
      });
    }

    const modelId = new mongoose.Types.ObjectId(globalConfig.modelId._id);
    const newAdminId = new mongoose.Types.ObjectId(adminId);

    // Pull model from users’ allowedModel arrays
    await UserModel.updateMany(
      { adminId: newAdminId, allowedModel: modelId },
      { $pull: { allowedModel: modelId } }
    );

    // Delete the model config + global config
    await ModelConfig.findByIdAndDelete(modelId);
    await GlobalConfig.findByIdAndDelete(globalConfigId);

    // Track activity
    await updateAdminActivity(adminId, "Model Deleted", globalConfig.modelId.name);

    res.status(200).json({
      success: true,
      message: "Model configuration deleted successfully",
      data: globalConfig,
    });
  } catch (error) {
    console.error("Error deleting model configuration:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// Update Platform Configuration
export const updatePlatformConfig = async (req, res) => {
  try {
    const { platformConfig } = req.body;
    const adminId = req.user.id;

    if (!platformConfig) {
      return res.status(400).json({
        success: false,
        message: "Platform configuration data is required",
      });
    }

    // Validate platform config fields
    const allowedFields = [
      'defaultTimeout',
      'maxConcurrentRequests', 
      'rateLimitPerUser',
      'enableLogging',
      'enableAnalytics'
    ];

    const filteredConfig = {};
    const errors = [];

    for (const [key, value] of Object.entries(platformConfig)) {
      if (allowedFields.includes(key)) {
        // Validate numeric fields
        if (['defaultTimeout', 'maxConcurrentRequests', 'rateLimitPerUser'].includes(key)) {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            errors.push(`${key} must be a number`);
            continue;
          }

          if (key === 'defaultTimeout' && (numValue < 1 || numValue > 300)) {
            errors.push("Default timeout must be between 1 and 300 seconds");
            continue;
          }

          if (key === 'maxConcurrentRequests' && (numValue < 1 || numValue > 100)) {
            errors.push("Max concurrent requests must be between 1 and 100");
            continue;
          }

          if (key === 'rateLimitPerUser' && (numValue < 1 || numValue > 1000)) {
            errors.push("Rate limit per user must be between 1 and 1000");
            continue;
          }

          filteredConfig[key] = numValue;
        } else {
          // Boolean fields
          filteredConfig[key] = Boolean(value);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    if (Object.keys(filteredConfig).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    // Find existing platform config or create new one
    let updatedPlatformConfig = await PlatformConfig.findOneAndUpdate(
      {},
      filteredConfig,
      { 
        new: true, 
        upsert: true, 
        runValidators: true 
      }
    );

    // Update admin dashboard
    await updateAdminActivity(adminId, "Platform Config Updated", "Platform Settings");

    res.status(200).json({
      success: true,
      message: "Platform configuration updated successfully",
      data: updatedPlatformConfig,
    });

  } catch (error) {
    console.error("Error updating platform configuration:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Platform Configuration
export const getPlatformConfig = async (req, res) => {
  try {
    const platformConfig = await PlatformConfig.findOne({});
    
    if (!platformConfig) {
      return res.status(404).json({
        success: false,
        message: "Platform configuration not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Platform configuration retrieved successfully",
      data: platformConfig
    });

  } catch (error) {
    console.error("Error fetching platform configuration:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get Single Model Configuration
export const getModelConfig = async (req, res) => {
  try {
    const { globalConfigId } = req.params;
    const adminId = req.user.id;

    if (!globalConfigId) {
      return res.status(400).json({
        success: false,
        message: "Global configuration ID is required"
      });
    }

    // Find global config and verify ownership
    const globalConfig = await GlobalConfig.findOne({
      _id: globalConfigId,
      adminId: adminId
    })
    .populate('modelId')
    .populate('modelConfigId')
    .populate('platformConfigId');

    if (!globalConfig) {
      return res.status(404).json({
        success: false,
        message: "Configuration not found or unauthorized"
      });
    }

    res.status(200).json({
      success: true,
      message: "Model configuration retrieved successfully",
      data: globalConfig
    });

  } catch (error) {
    console.error("Error fetching model configuration:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};