import mongoose from 'mongoose';
import User from '../models/UserModel.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testPromptValidation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the user vineet1
    const user = await User.findOne({ 
      $or: [
        { username: 'vineet1' },
        { fullName: 'vineet1' },
        { email: 'vineet1@example.com' }
      ]
    });
    
    if (!user) {
      console.log('❌ User vineet1 not found');
      return;
    }
    
    console.log('👤 Found user:', {
      id: user._id,
      username: user.username,
      email: user.email,
      allowedModels: user.allowedModels
    });
    
    // Test the model validation logic
    const modelIds = ['gemini-1.5-pro']; // Test with the problematic model ID
    
    // Separate ObjectId and string model IDs
    const objectIdModelIds = [];
    const stringModelIds = [];
    
    user.allowedModels.forEach(modelId => {
      if (modelId.match(/^[0-9a-fA-F]{24}$/)) {
        objectIdModelIds.push(modelId);
      } else {
        stringModelIds.push(modelId);
      }
    });
    
    console.log('🔍 Separated model IDs:');
    console.log('  ObjectId models:', objectIdModelIds);
    console.log('  String models:', stringModelIds);
    
    // Create allowed set
    const allowedModelIds = new Set([
      ...objectIdModelIds, // These would be from ModelConfig query
      ...stringModelIds
    ]);
    
    console.log('✅ Allowed model IDs set:', Array.from(allowedModelIds));
    
    // Test validation
    const unauthorizedModels = modelIds.filter(id => !allowedModelIds.has(id));
    
    if (unauthorizedModels.length > 0) {
      console.log('❌ Unauthorized models:', unauthorizedModels);
    } else {
      console.log('✅ All models authorized:', modelIds);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testPromptValidation();
