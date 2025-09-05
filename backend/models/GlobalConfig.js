import mongoose from 'mongoose';

const GlobalConfigSchema = new mongoose.Schema({
  configKey: {
    type: String,
    required: true,
    unique: true,
    default: 'main' // Single config document
  },
  models: [{
    modelId: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    apiKey: { type: String, required: true },
    maxTokens: { type: Number, default: 4000 },
    temperature: { type: Number, default: 0.7 },
    topP: { type: Number, default: 1 },
    frequencyPenalty: { type: Number, default: 0 },
    presencePenalty: { type: Number, default: 0 }
  }],
  platform: {
    defaultTimeout: { type: Number, default: 30 },
    maxConcurrentRequests: { type: Number, default: 10 },
    rateLimitPerUser: { type: Number, default: 100 },
    enableLogging: { type: Boolean, default: true },
    enableAnalytics: { type: Boolean, default: true }
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

const GlobalConfig = mongoose.model('GlobalConfig', GlobalConfigSchema);

export default GlobalConfig;
