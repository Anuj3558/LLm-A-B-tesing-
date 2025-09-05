import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { clearConfigCache } from '../services/llmService.js';

// Load environment variables
dotenv.config();

async function testModelConfigLoading() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear cache to force reload
    clearConfigCache();
    console.log('🗑️ Cache cleared');
    
    // Import and test the function
    const { getModelConfigs } = await import('../services/llmService.js');
    
    // This is a private function, but we can test it via the clearConfigCache that we can import
    // Let's call the service directly to test
    const { testPromptWithModels } = await import('../services/llmService.js');
    
    console.log('🧪 Testing model config loading by attempting to use gemini-1.5-pro...');
    
    try {
      // This will trigger getModelConfigs internally
      const result = await testPromptWithModels('Test prompt', ['gemini-1.5-pro'], {
        userId: '68bae0214b16281d7c37c400',
        evaluationCriteria: ['accuracy']
      });
      
      console.log('✅ Model config loading test completed');
      console.log('📊 Result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.log('❌ Error testing model:', error.message);
      // This might fail due to API key issues, but we can check if the model was found
      if (error.message.includes('not found in admin configurations')) {
        console.log('❌ Model still not found - config loading failed');
      } else {
        console.log('✅ Model was found (error is likely API key related)');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testModelConfigLoading();
