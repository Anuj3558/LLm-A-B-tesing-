import fetch from 'node-fetch';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testApiEndpoints() {
  try {
    // Connect to get user data for JWT
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find the user
    const user = await User.findOne({ fullName: 'vineet1' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    // Create a JWT token for the user
    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('🔑 Generated JWT token for user:', user.fullName || user.username);
    
    await mongoose.disconnect();
    
    const baseUrl = 'http://localhost:5000/api/llm';
    
    // Test 1: Get models endpoint
    console.log('\n🔍 Testing GET /api/llm/models...');
    try {
      const modelsResponse = await fetch(`${baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const modelsData = await modelsResponse.json();
      console.log('Status:', modelsResponse.status);
      console.log('Response:', JSON.stringify(modelsData, null, 2));
      
      if (modelsResponse.status === 200 && modelsData.success) {
        console.log('✅ GET /models succeeded');
        console.log(`📊 Found ${modelsData.data.totalModels} models`);
      } else {
        console.log('❌ GET /models failed');
      }
    } catch (error) {
      console.log('❌ Error testing /models:', error.message);
    }
    
    // Test 2: Test prompt endpoint
    console.log('\n🧪 Testing POST /api/llm/test-prompt...');
    try {
      const testPromptResponse = await fetch(`${baseUrl}/test-prompt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: 'What is the capital of France?',
          modelIds: ['gemini-1.5-pro'],
          evaluationCriteria: ['accuracy', 'responseTime']
        })
      });
      
      const promptData = await testPromptResponse.json();
      console.log('Status:', testPromptResponse.status);
      console.log('Response:', JSON.stringify(promptData, null, 2));
      
      if (testPromptResponse.status === 200 && promptData.success) {
        console.log('✅ POST /test-prompt succeeded');
      } else {
        console.log('❌ POST /test-prompt failed');
      }
    } catch (error) {
      console.log('❌ Error testing /test-prompt:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testApiEndpoints();
