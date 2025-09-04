// models/globalConfig.js
import mongoose from "mongoose";

const { Schema } = mongoose;
// ================= ModelConfig Schema =================
const modelConfigSchema = new Schema(
  {
    temperature: {
      type: Number,
      default: 0.7,
    },
    maxTokens: {
      type: Number,
      default: 2048,
    },
    topP: {
      type: Number,
      default: 1,
    },
    frequencyPenalty: {
      type: Number,
      default: 0,
    },
    presencePenalty: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ================= PlatformConfig Schema =================
const platformConfigSchema = new Schema(
  {
    defaultTimeout: {
      type: Number,
      default: 30,
      min: 1,
      max: 300
    },
    maxConcurrentRequests: {
      type: Number,
      default: 10,
      min: 1,
      max: 100
    },
    rateLimitPerUser: {
      type: Number,
      default: 100,
      min: 1,
      max: 1000
    },
    enableLogging: {
      type: Boolean,
      default: true
    },
    enableAnalytics: {
      type: Boolean,
      default: true
    },
  },
  { 
    timestamps: true 
  }
);

// ================= GlobalConfig Schema =================
const globalConfigSchema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    modelId: {
      type: Schema.Types.ObjectId,
      ref: "AllModels",
      required: true,
    },
   apiKey: {
      type: String,
      required: true,
    },
    modelConfigId: {
      type: Schema.Types.ObjectId,
      ref: "ModelConfig",
      required: true,
    },
    platformConfigId: {
      type: Schema.Types.ObjectId,
      ref: "PlatformConfig",
      required: true,
    },
    Enabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
const GlobalConfig = mongoose.model("GlobalConfig", globalConfigSchema);
export default GlobalConfig;