import mongoose from 'mongoose';
import GlobalConfig from '../models/GlobalConfig.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkGlobalConfig() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📁 Database Name: ${mongoose.connection.name}`);
    
    // List all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📂 Collections in database:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Check if GlobalConfig collection exists and get documents
    const globalConfigs = await GlobalConfig.find();
    console.log(`\n🔧 GlobalConfig documents found: ${globalConfigs.length}`);
    
    if (globalConfigs.length > 0) {
      console.log('\n📋 GlobalConfig data:');
      globalConfigs.forEach((config, index) => {
        console.log(`\nConfig ${index + 1}:`);
        console.log(`  - configKey: ${config.configKey}`);
        console.log(`  - models count: ${config.models ? config.models.length : 0}`);
        if (config.models && config.models.length > 0) {
          console.log('  - models:');
          config.models.forEach(model => {
            console.log(`    * ${model.modelId}: enabled=${model.enabled}, apiKey=${model.apiKey ? 'configured' : 'not set'}`);
          });
        }
        console.log(`  - platform: ${JSON.stringify(config.platform, null, 4)}`);
        console.log(`  - lastUpdated: ${config.lastUpdated}`);
      });
    } else {
      console.log('❌ No GlobalConfig documents found');
      
      // Create a test document
      console.log('\n🔨 Creating test GlobalConfig document...');
      const testConfig = new GlobalConfig({
        configKey: 'main',
        models: [{
          modelId: 'test-model',
          enabled: true,
          apiKey: 'test-key',
          maxTokens: 4000,
          temperature: 0.7,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0
        }],
        platform: {
          defaultTimeout: 30,
          maxConcurrentRequests: 10,
          rateLimitPerUser: 100,
          enableLogging: true,
          enableAnalytics: true
        }
      });
      
      await testConfig.save();
      console.log('✅ Test GlobalConfig document created successfully');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkGlobalConfig();
