import ModelConfig from "../models/ModelConfig.js";
import { config } from "../globalconfig.js";

/**
 * Creates a new model config for the admin
 */
export const createModelConfig = async (adminId, configData) => {
  const { providerId, modelId, apiKey, parameters = {} } = configData;

  // 1. Validate provider
  const provider = config.providers[providerId];
  if (!provider) {
    throw new Error(`Invalid providerId: '${providerId}'`);
  }

  // 2. Validate model
  const model = provider.models[modelId];
  if (!model) {
    throw new Error(`Invalid modelId: '${modelId}' for provider '${providerId}'`);
  }

  // 3. Apply default parameters if not provided
  const defaultParams = model.defaultParams || {
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  };

  const finalParams = {
    temperature: parameters.temperature ?? defaultParams.temperature,
    max_tokens: parameters.max_tokens ?? defaultParams.max_tokens,
    top_p: parameters.top_p ?? defaultParams.top_p,
    frequency_penalty: parameters.frequency_penalty ?? defaultParams.frequency_penalty,
    presence_penalty: parameters.presence_penalty ?? defaultParams.presence_penalty,
  };

  // 4. Save new config
  const configEntry = new ModelConfig({
    adminId,
    providerId,
    modelId,
    apiKey,
    parameters: finalParams,
  });

  return await configEntry.save();
};

/**
 * Fetch all model configs for an admin
 */
export const getAllModelConfigs = async (adminId) => {
  return await ModelConfig.find({ adminId });
};

/**
 * Update a config by ID
 */
export const updateModelConfigById = async (adminId, id, updateData) => {
  // Optional: Validate new provider/model if provided in updateData

  return await ModelConfig.findOneAndUpdate(
    { _id: id, adminId },
    { $set: updateData },
    { new: true }
  );
};

/**
 * Delete a config by ID
 */
export const deleteModelConfigById = async (adminId, id) => {
  return await ModelConfig.findOneAndDelete({ _id: id, adminId });
};
