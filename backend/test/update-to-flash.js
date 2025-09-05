import mongoose from 'mongoose';
import User from '../models/UserModel.js';
import { getGlobalConfigData } from '../controller/Admin/GlobalConfigController.js';
import GlobalConfig from '../models/GlobalConfig.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function updateUserToFlash() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the user
    const user = await User.findOne({ fullName: 'vineet1' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 Current user models:', user.allowedModels);
    
    // Update user's allowed models to use gemini-1.5-flash
    const updatedModels = user.allowedModels.map(model => {
      if (model === 'gemini-1.5-pro') {
        return 'gemini-1.5-flash';
      }
      return model;
    });
    
    user.allowedModels = updatedModels;
    await user.save();
    
    console.log('✅ Updated user models to:', updatedModels);
    
    // Also update the global config to use gemini-1.5-flash
    const globalConfig = await GlobalConfig.findOne({ configKey: 'main' });
    if (globalConfig) {
      console.log('\n🔧 Updating global config...');
      
      // Find and update gemini-1.5-pro to gemini-1.5-flash
      const updatedGlobalModels = globalConfig.models.map(model => {
        if (model.modelId === 'gemini-1.5-pro') {
          return {
            ...model,
            modelId: 'gemini-1.5-flash'
          };
        }
        return model;
      });
      
      globalConfig.models = updatedGlobalModels;
      await globalConfig.save();
      
      console.log('✅ Updated global config models');
      console.log('📋 New global config models:');
      globalConfig.models.forEach(model => {
        console.log(`  - ${model.modelId}: enabled=${model.enabled}, apiKey=${model.apiKey ? 'configured' : 'not set'}`);
      });
    }
    
    console.log('\n🎉 Migration complete! User can now use gemini-1.5-flash for testing');
    console.log('💡 gemini-1.5-flash has higher free tier limits than gemini-1.5-pro');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

updateUserToFlash();
