import ModelConfig from "../models/Admin/modelConfig.js";

// Create a new config
export const createModelConfig = async (adminId, configData) => {
  const config = new ModelConfig({
    adminId,
    ...configData
  });
  return await config.save();
};

// Get all configs for an admin
export const getAllModelConfigs = async (adminId) => {
  return await ModelConfig.find({ adminId });
};

// Update config
export const updateModelConfigById = async (adminId, id, updateData) => {
  return await ModelConfig.findOneAndUpdate(
    { _id: id, adminId },
    { $set: updateData },
    { new: true }
  );
};

// Delete config
export const deleteModelConfigById = async (adminId, id) => {
  return await ModelConfig.findOneAndDelete({ _id: id, adminId });
};
