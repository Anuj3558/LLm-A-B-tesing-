import mongoose from 'mongoose';
import User from '../models/UserModel.js';
import ModelConfig from '../models/ModelConfig.js';
import { getGlobalConfigData } from '../controller/Admin/GlobalConfigController.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function debugUserModels() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📁 Database Name: ${mongoose.connection.name}`);
    
    // Find user by fullName since username is undefined
    const user = await User.findOne({ fullName: 'vineet1' }).select('allowedModels adminId username fullName');
    
    if (!user) {
      console.log('❌ User vineet1 not found');
      return;
    }
    
    console.log('\n👤 User vineet1 details:');
    console.log(`  - ID: ${user._id}`);
    console.log(`  - Username: ${user.username}`);
    console.log(`  - Full Name: ${user.fullName}`);
    console.log(`  - Admin ID: ${user.adminId}`);
    console.log(`  - Allowed Models: ${JSON.stringify(user.allowedModels, null, 2)}`);
    console.log(`  - Allowed Models Count: ${user.allowedModels ? user.allowedModels.length : 0}`);
    
    if (!user.allowedModels || user.allowedModels.length === 0) {
      console.log('❌ User has no allowed models assigned');
      return;
    }
    
    // Separate ObjectId and string model IDs
    const objectIdModelIds = [];
    const stringModelIds = [];
    
    user.allowedModels.forEach(modelId => {
      if (modelId.match(/^[0-9a-fA-F]{24}$/)) {
        objectIdModelIds.push(modelId);
        console.log(`  📦 ObjectId Model: ${modelId}`);
      } else {
        stringModelIds.push(modelId);
        console.log(`  🔤 String Model: ${modelId}`);
      }
    });
    
    // Check ModelConfig collection for ObjectId-based models
    console.log('\n🔍 Checking ModelConfig collection:');
    if (objectIdModelIds.length > 0) {
      const modelConfigs = await ModelConfig.find({
        _id: { $in: objectIdModelIds },
        adminId: user.adminId
      });
      
      console.log(`  - Found ${modelConfigs.length} ModelConfig entries`);
      modelConfigs.forEach(config => {
        console.log(`    * ${config._id}: ${config.providerId}-${config.modelId}`);
      });
    } else {
      console.log('  - No ObjectId models to check');
    }
    
    // Check global config for string-based models
    console.log('\n🌐 Checking Global Config:');
    if (stringModelIds.length > 0) {
      try {
        const globalConfigData = await getGlobalConfigData();
        console.log(`  - Global config models: ${Object.keys(globalConfigData.models || {}).length}`);
        
        stringModelIds.forEach(modelId => {
          if (globalConfigData.models && globalConfigData.models[modelId]) {
            console.log(`    ✅ ${modelId}: configured in global config`);
          } else {
            console.log(`    ❌ ${modelId}: NOT found in global config`);
          }
        });
      } catch (error) {
        console.log(`  ❌ Error accessing global config: ${error.message}`);
      }
    } else {
      console.log('  - No string models to check');
    }
    
    // Check all ModelConfig entries for this admin
    console.log('\n📊 All ModelConfig entries for this admin:');
    const allAdminModels = await ModelConfig.find({ adminId: user.adminId });
    console.log(`  - Total ModelConfig entries: ${allAdminModels.length}`);
    allAdminModels.forEach(config => {
      console.log(`    * ${config._id}: ${config.providerId}-${config.modelId} (enabled: ${config.enabled})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugUserModels();
