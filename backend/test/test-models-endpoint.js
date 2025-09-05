import mongoose from 'mongoose';
import User from '../models/UserModel.js';
import ModelConfig from '../models/ModelConfig.js';
import { getAvailableModels, validateApiKeys } from '../services/llmService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testModelsEndpoint() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find user by fullName since username is undefined
    const user = await User.findOne({ fullName: 'vineet1' }).select('allowedModels adminId username fullName');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('\n👤 Testing /models endpoint for user:');
    console.log(`  - ID: ${user._id}`);
    console.log(`  - Full Name: ${user.fullName}`);
    console.log(`  - Allowed Models: ${JSON.stringify(user.allowedModels, null, 2)}`);
    
    // If user has no allowed models, return empty array
    if (!user.allowedModels || user.allowedModels.length === 0) {
      console.log('❌ User has no allowed models');
      return;
    }

    // Get all available models from ModelConfig database
    const allModels = await getAvailableModels();
    console.log(`\n📦 ModelConfig models found: ${allModels.length}`);
    
    // Also get global config models for string-based model IDs
    const { getGlobalConfigData } = await import('../controller/Admin/GlobalConfigController.js');
    const globalConfigData = await getGlobalConfigData();
    
    // Create global config models array
    const globalConfigModels = [];
    if (globalConfigData && globalConfigData.models) {
      Object.entries(globalConfigData.models).forEach(([modelId, modelConfig]) => {
        globalConfigModels.push({
          id: modelId,
          name: modelId,
          provider: 'global',
          description: `Global Config: ${modelId}`,
          source: 'globalconfig',
          apiKeyConfigured: !!modelConfig.apiKey,
          parameters: {
            maxTokens: modelConfig.maxTokens,
            temperature: modelConfig.temperature,
            topP: modelConfig.topP,
            frequencyPenalty: modelConfig.frequencyPenalty,
            presencePenalty: modelConfig.presencePenalty
          },
          enabled: modelConfig.enabled
        });
      });
    }
    
    console.log(`🌐 Global config models found: ${globalConfigModels.length}`);
    globalConfigModels.forEach(model => {
      console.log(`  - ${model.id}: enabled=${model.enabled}, apiKey=${model.apiKeyConfigured}`);
    });
    
    // Combine both sources
    const allAvailableModels = [...allModels, ...globalConfigModels];
    console.log(`🔗 Total combined models: ${allAvailableModels.length}`);
    
    // Separate ObjectId and string model IDs from user's allowed models
    const objectIdModelIds = [];
    const stringModelIds = [];
    
    user.allowedModels.forEach(modelId => {
      if (modelId.match(/^[0-9a-fA-F]{24}$/)) {
        objectIdModelIds.push(modelId);
      } else {
        stringModelIds.push(modelId);
      }
    });
    
    console.log(`\n🔍 User allowed model analysis:`);
    console.log(`  - ObjectId models: ${objectIdModelIds.length}`);
    console.log(`  - String models: ${stringModelIds.length} - ${JSON.stringify(stringModelIds)}`);
    
    // Get ModelConfig entries for ObjectId-based models
    let userAllowedModelConfigs = [];
    if (objectIdModelIds.length > 0) {
      userAllowedModelConfigs = await ModelConfig.find({
        _id: { $in: objectIdModelIds },
        adminId: user.adminId
      });
    }

    // Create a map of allowed model IDs for quick lookup (both ObjectIds and strings)
    const allowedModelIds = new Set([
      ...userAllowedModelConfigs.map(m => m._id.toString()),
      ...stringModelIds
    ]);
    
    console.log(`\n🎯 Allowed model IDs set: ${Array.from(allowedModelIds)}`);
    
    // Filter the available models to only include allowed ones
    const filteredModels = allAvailableModels.filter(model => {
      console.log(`Checking model: ${model.id}, source: ${model.source}`);
      
      // For database-sourced models with configId, check if the configId is in user's allowed list
      if (model.source === 'database' && model.configId) {
        const allowed = allowedModelIds.has(model.configId.toString());
        console.log(`  - Database model ${model.id}: allowed=${allowed}`);
        return allowed;
      }
      // For global config models, check if the model ID is in user's allowed list
      if (model.source === 'globalconfig' && stringModelIds.includes(model.id)) {
        console.log(`  - Global config model ${model.id}: allowed=true`);
        return true;
      }
      console.log(`  - Model ${model.id}: allowed=false`);
      return false;
    });

    console.log(`\n✅ Final filtered models: ${filteredModels.length}`);
    filteredModels.forEach(model => {
      console.log(`  - ${model.name} (${model.source}): ${model.description}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testModelsEndpoint();
