import GlobalConfig, { PlatformConfig } from "../../models/Admin/ModelConfigSchema.js";
import AllModelsConfig from "../../models/AllModelConfig.js";
import { ModelConfig } from "../../models/Admin/ModelConfigSchema.js";
import AdminDashboard from "../../models/Admin/AdminDashboardSchema.js";
import mongoose from "mongoose";

// Helper function to validate model config data
const validateModelConfigData = (config) => {
  const errors = [];

  if (!config.apiKey) {
    errors.push("API key is required");
  }

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
    if (!modelId || !config) {
      return res.status(400).json({
        success: false,
        message: "ModelId and config are required"
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
      adminId: adminId
    }).populate({
      path: 'modelConfigId',
      match: { modelId: modelId }
    });

    // Check if the model already exists in the modelConfigId array
    if (existingGlobalConfig && existingGlobalConfig.modelConfigId.length > 0) {
      const modelExists = existingGlobalConfig.modelConfigId.some(
        modelConfig => modelConfig && modelConfig.modelId.toString() === modelId.toString()
      );
      
      if (modelExists) {
        return res.status(409).json({
          success: false,
          message: "Model configuration already exists for this admin"
        });
      }
    }

    // Create ModelConfig document
    const modelConfig = new ModelConfig({
      modelId: modelId,
      apiKey: config.apiKey,
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 2048,
      topP: config.topP || 1,
      frequencyPenalty: config.frequencyPenalty || 0,
      presencePenalty: config.presencePenalty || 0,
      isActive: config.isActive !== undefined ? config.isActive : true
    });

    const savedModelConfig = await modelConfig.save();

    // Check if GlobalConfig already exists for this admin
    let globalConfig = await GlobalConfig.findOne({ adminId: adminId });
    
    if (globalConfig) {
      // Add the new modelConfigId to the existing array
      globalConfig.modelConfigId.push(savedModelConfig._id);
      await globalConfig.save();
    } else {
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

      // Create new GlobalConfig document
      globalConfig = new GlobalConfig({
        adminId: adminId,
        modelConfigId: [savedModelConfig._id],
        platformConfigId: platformConfigId,
        isActive: true
      });

      await globalConfig.save();
    }

    // Populate the response with related data
    const populatedConfig = await GlobalConfig.findById(globalConfig._id)
      .populate({
        path: 'modelConfigId',
        populate: {
          path: 'modelId',
          model: 'AllModels'
        }
      })
      .populate('platformConfigId')
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
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    // Handle duplicate key errors
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
      .populate({
        path: 'modelConfigId',
        populate: {
          path: 'modelId',
          model: 'AllModels',
          select: 'name description provider category'
        }
      })
      .populate('platformConfigId')
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 });

    if (!adminModels || adminModels.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No model configurations found for this admin"
      });
    }

    // Transform the data to handle array of modelConfigId
    const transformedData = [];
    
    adminModels.forEach(config => {
      config.modelConfigId.forEach(modelConfig => {
        if (modelConfig && modelConfig.modelId) {
          transformedData.push({
            _id: config._id,
            globalConfigId: config._id,
            adminId: config.adminId,
            isActive: config.isActive,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt,
            model: {
              _id: modelConfig.modelId._id,
              name: modelConfig.modelId.name,
              description: modelConfig.modelId.description,
              provider: modelConfig.modelId.provider,
              category: modelConfig.modelId.category
            },
            modelConfig: {
              _id: modelConfig._id,
              apiKey: modelConfig.apiKey,
              temperature: modelConfig.temperature,
              maxTokens: modelConfig.maxTokens,
              topP: modelConfig.topP,
              frequencyPenalty: modelConfig.frequencyPenalty,
              presencePenalty: modelConfig.presencePenalty,
              isActive: modelConfig.isActive,
              createdAt: modelConfig.createdAt,
              updatedAt: modelConfig.updatedAt
            },
            platformConfig: config.platformConfigId
          });
        }
      });
    });

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
    const { modelConfigId } = req.params;
    const updateData = req.body;
    const adminId = req.user.id;
   console.log(modelConfigId)
    // Validate modelConfigId
    if (!modelConfigId) {
      return res.status(400).json({
        success: false,
        message: "Model configuration ID is required",
      });
    }

    // Find the model configuration and verify ownership
    const modelConfig = await ModelConfig.findById(modelConfigId).populate('modelId');
    if (!modelConfig) {
      return res.status(404).json({
        success: false,
        message: "Model configuration not found",
      });
    }

    // Verify admin owns this configuration
    const globalConfig = await GlobalConfig.findOne({
      adminId: adminId,
      modelConfigId: modelConfigId
    });

    if (!globalConfig) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this configuration",
      });
    }

    // Validate update data
    const validationErrors = validateModelConfigData(updateData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }

    // Define allowed fields for update
    const allowedFields = [
      'apiKey',
      'temperature',
      'maxTokens',
      'topP',
      'frequencyPenalty',
      'presencePenalty',
      'isActive'
    ];

    // Filter update data
    const filteredUpdateData = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        filteredUpdateData[key] = value;
      }
    }

    // Check if there's any valid data to update
    if (Object.keys(filteredUpdateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    // Update the model configuration
    const updatedModelConfig = await ModelConfig.findByIdAndUpdate(
      modelConfigId,
      filteredUpdateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('modelId');

    // Update admin dashboard
    await updateAdminActivity(adminId, "Model Updated", updatedModelConfig.modelId.name);

    res.status(200).json({
      success: true,
      message: "Model configuration updated successfully",
      data: updatedModelConfig,
    });

  } catch (error) {
    console.error("Error updating model configuration:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Toggle Model Status
// Toggle Model Status
export const toggleModelStatus = async (req, res) => {
  try {
    const { modelConfigId } = req.params;
    const { isActive } = req.body;
    const currIsActive = !isActive;
    const adminId = req.user.id;
    console.log("Received isActive:", isActive);

    // Validate input
    if (!modelConfigId) {
      return res.status(400).json({
        success: false,
        message: "Model configuration ID is required",
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean value",
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(modelConfigId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid model configuration ID format",
      });
    }

    // Check if model config exists first
    const existingModelConfig = await ModelConfig.findById(modelConfigId).populate("modelId");
    if (!existingModelConfig) {
      console.log("ModelConfig not found with ID:", modelConfigId);
      return res.status(404).json({
        success: false,
        message: "Model configuration not found",
      });
    }

    console.log("Found ModelConfig:", existingModelConfig._id);

    // Verify admin owns this configuration
    const globalConfig = await GlobalConfig.findOne({
      adminId: adminId,
      modelConfigId: { $in: [modelConfigId] }
    });

    if (!globalConfig) {
      console.log("GlobalConfig not found for admin:", adminId, "with modelConfigId:", modelConfigId);
      
      // Debug: Show what global configs exist for this admin
      const adminGlobalConfigs = await GlobalConfig.find({ adminId: adminId });
      console.log("Admin's GlobalConfigs:", adminGlobalConfigs.map(gc => ({
        id: gc._id,
        modelConfigIds: gc.modelConfigId
      })));
      
      return res.status(403).json({
        success: false,
        message: "Unauthorized to modify this configuration",
      });
    }

    console.log("Found GlobalConfig:", globalConfig._id);

    // Update the isActive status using findByIdAndUpdate for better reliability
    console.log("Before update - isActive:", existingModelConfig.isActive);
    
    const updatedModelConfig = await ModelConfig.findByIdAndUpdate(
      modelConfigId,
      { isActive: isActive },
      { 
        new: true, 
        runValidators: true,
        useFindAndModify: false
      }
    ).populate("modelId");

    if (!updatedModelConfig) {
      return res.status(500).json({
        success: false,
        message: "Failed to update model configuration",
      });
    }

    console.log("After update - isActive:", updatedModelConfig.isActive);

    // Verify the update was successful
    const verifyUpdate = await ModelConfig.findById(modelConfigId);
    console.log("Verification from DB - isActive:", verifyUpdate.isActive);

    // Update admin dashboard
    const action = isActive ? "Model Activated" : "Model Deactivated";
    await updateAdminActivity(adminId, action, updatedModelConfig.modelId.name);

    res.status(200).json({
      success: true,
      message: `Model ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        modelConfig: updatedModelConfig,
        isActive: updatedModelConfig.isActive
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
    // Get all global configs with populated model configs and model info
    const globalConfigs = await GlobalConfig.find({})
      .populate({
        path: 'modelConfigId',
        populate: {
          path: 'modelId',
          model: 'AllModels'
        }
      })
      .populate('platformConfigId')
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 });

    if (!globalConfigs || globalConfigs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No configurations found"
      });
    }

    // Transform the data to match frontend expectations
    const transformedData = globalConfigs.flatMap(config => 
      config.modelConfigId
        .filter(modelConfig => modelConfig && modelConfig.modelId)
        .map(modelConfig => ({
          _id: modelConfig._id,
          globalConfigId: config._id,
          isActive: config.isActive,
          admin: {
            _id: config.adminId._id,
            name: config.adminId.name,
            email: config.adminId.email
          },
          modelConfig: {
            apiKey: modelConfig.apiKey,
            temperature: modelConfig.temperature,
            maxTokens: modelConfig.maxTokens,
            topP: modelConfig.topP,
            frequencyPenalty: modelConfig.frequencyPenalty,
            presencePenalty: modelConfig.presencePenalty,
            isActive: modelConfig.isActive,
          },
          model: modelConfig.modelId,
          createdAt: modelConfig.createdAt,
          updatedAt: modelConfig.updatedAt,
          platformConfig: config.platformConfigId
        }))
    );

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
    const { modelConfigId } = req.params;
    const adminId = req.user.id;

    // Validate input
    if (!modelConfigId) {
      return res.status(400).json({
        success: false,
        message: "Model configuration ID is required",
      });
    }

    // Find the model configuration and verify ownership
    const modelConfig = await ModelConfig.findById(modelConfigId).populate('modelId');
    if (!modelConfig) {
      return res.status(404).json({
        success: false,
        message: "Model configuration not found",
      });
    }

    // Verify admin owns this configuration
    const globalConfig = await GlobalConfig.findOne({
      adminId: adminId,
      modelConfigId: modelConfigId
    });

    if (!globalConfig) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this configuration",
      });
    }

    // Delete the model configuration
    await ModelConfig.findByIdAndDelete(modelConfigId);

    // Remove the model config reference from GlobalConfig
    await GlobalConfig.updateOne(
      { _id: globalConfig._id },
      { $pull: { modelConfigId: modelConfigId } }
    );

    // If no more model configs, delete the global config
    const updatedGlobalConfig = await GlobalConfig.findById(globalConfig._id);
    if (updatedGlobalConfig.modelConfigId.length === 0) {
      await GlobalConfig.findByIdAndDelete(globalConfig._id);
    }

    // Update admin dashboard
    await updateAdminActivity(adminId, "Model Deleted", modelConfig.modelId.name);

    res.status(200).json({
      success: true,
      message: "Model configuration deleted successfully",
      data: modelConfig,
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
    const { modelConfigId } = req.params;
    const adminId = req.user.id;

    if (!modelConfigId) {
      return res.status(400).json({
        success: false,
        message: "Model configuration ID is required"
      });
    }

    // Find model config and verify ownership
    const modelConfig = await ModelConfig.findById(modelConfigId).populate('modelId');
    if (!modelConfig) {
      return res.status(404).json({
        success: false,
        message: "Model configuration not found"
      });
    }

    // Verify admin owns this configuration
    const globalConfig = await GlobalConfig.findOne({
      adminId: adminId,
      modelConfigId: modelConfigId
    });

    if (!globalConfig) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this configuration"
      });
    }

    res.status(200).json({
      success: true,
      message: "Model configuration retrieved successfully",
      data: modelConfig
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