import User from "../../models/UserModel.js";
import ModelConfig from "../../models/ModelConfig.js";

// Get models that the current user is allowed to access
export const getUserAllowedModels = async (req, res) => {
  try {
    const userId = req.user.id; // User ID from authenticated user

    console.log("Fetching allowed models for user:", userId);

    // Find the user
    const user = await User.findById(userId).select('allowedModels adminId');
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // If user has no allowed models, return empty array
    if (!user.allowedModels || user.allowedModels.length === 0) {
      return res.status(200).json({
        message: "No models available for this user",
        models: []
      });
    }

    // Get the actual model configurations
    const models = await ModelConfig.find({ 
      _id: { $in: user.allowedModels },
      adminId: user.adminId 
    }).select('_id providerId modelId parameters createdAt');

    // Format the response
    const formattedModels = models.map(model => ({
      id: model._id,
      name: `${model.providerId}-${model.modelId}`,
      providerId: model.providerId,
      modelId: model.modelId,
      description: `${model.providerId.toUpperCase()} ${model.modelId}`,
      parameters: model.parameters,
      createdAt: model.createdAt
    }));

    res.status(200).json({
      message: "Allowed models fetched successfully",
      models: formattedModels
    });

  } catch (error) {
    console.error("Error fetching user allowed models:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get user profile with allowed models
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // User ID from authenticated user

    console.log("Fetching user profile for:", userId);

    // Find the user with populated allowed models
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Get model configurations if user has allowed models
    let allowedModelDetails = [];
    if (user.allowedModels && user.allowedModels.length > 0) {
      const models = await ModelConfig.find({ 
        _id: { $in: user.allowedModels },
        adminId: user.adminId 
      }).select('_id providerId modelId');

      allowedModelDetails = models.map(model => ({
        id: model._id,
        name: `${model.providerId}-${model.modelId}`,
        providerId: model.providerId,
        modelId: model.modelId
      }));
    }

    res.status(200).json({
      message: "User profile fetched successfully",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        allowedModels: user.allowedModels || [],
        allowedModelDetails,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};
