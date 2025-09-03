import {
  createModelConfig,
  getAllModelConfigs,
  updateModelConfigById,
  deleteModelConfigById
} from "../../services/modelConfigService.js";
import { clearConfigCache } from "../../services/llmService.js";
import verifySecretKey from "../../middleware/VerifySecrete.js";

export const createConfig = async (req, res) => {
  try {
    // Remove secret key verification - using JWT authentication instead
    const adminId = req.user.id;
    const config = await createModelConfig(adminId, req.body);

    // Clear LLM service cache so new config is picked up
    clearConfigCache();

    res.status(201).json({ 
      success: true,
      message: 'Model config created successfully', 
      data: config 
    });
  } catch (error) {
    console.error("Error creating config:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

export const getConfigs = async (req, res) => {
  try {
    const adminId = req.user.id;
    const configs = await getAllModelConfigs(adminId);

    res.status(200).json({ 
      success: true,
      data: configs 
    });
  } catch (error) {
    console.error("Error fetching configs:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;

    const updated = await updateModelConfigById(adminId, id, req.body);

    if (!updated) {
      return res.status(404).json({ 
        success: false,
        message: "Config not found or you don't have permission to modify it" 
      });
    }

    // Clear LLM service cache so updated config is picked up
    clearConfigCache();

    res.status(200).json({ 
      success: true,
      message: "Configuration updated successfully", 
      data: updated 
    });
  } catch (error) {
    console.error("Error updating config:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

export const deleteConfig = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;

    const deleted = await deleteModelConfigById(adminId, id);

    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        message: "Config not found or you don't have permission to delete it" 
      });
    }

    // Clear LLM service cache so deleted config is removed
    clearConfigCache();

    res.status(200).json({ 
      success: true,
      message: "Configuration deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting config:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};
