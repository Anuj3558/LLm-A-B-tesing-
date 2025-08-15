import {
  createModelConfig,
  getAllModelConfigs,
  updateModelConfigById,
  deleteModelConfigById
} from "../../services/modelConfigService.js";
import verifySecretKey from "../../../middleware/VerifySecrete.js";

export const createConfig = async (req, res) => {
  try {
    if (!verifySecretKey(req, res)) return;

    const adminId = req.user.id;
    const config = await createModelConfig(adminId, req.body);

    res.status(201).json({ message: 'Model config created', data: config });
  } catch (error) {
    console.error("Error creating config:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getConfigs = async (req, res) => {
  try {
    const adminId = req.user.id;
    const configs = await getAllModelConfigs(adminId);

    res.status(200).json({ data: configs });
  } catch (error) {
    console.error("Error fetching configs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;

    const updated = await updateModelConfigById(adminId, id, req.body);

    if (!updated) return res.status(404).json({ message: "Config not found" });

    res.status(200).json({ message: "Updated", data: updated });
  } catch (error) {
    console.error("Error updating config:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteConfig = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;

    const deleted = await deleteModelConfigById(adminId, id);

    if (!deleted) return res.status(404).json({ message: "Config not found" });

    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting config:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
