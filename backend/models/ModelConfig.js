import mongoose from 'mongoose';

const { Schema } = mongoose;

const modelConfigSchema = new Schema({
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  providerId: {
    type: String, // e.g., 'openai', 'anthropic'
    required: true,
  },
  modelId: {
    type: String, // e.g., 'gpt-4', 'claude-v1'
    required: true,
  },
  apiKey: {
    type: String,
    required: true,
  },
  endpoint: {
    type: String,
    required: true,
  },
  route: {
    type: String,
    required: true,
  },
  parameters: {
    temperature: { type: Number, default: 0.7 },
    max_tokens: { type: Number, default: 1000 },
    top_p: { type: Number, default: 1 },
    frequency_penalty: { type: Number, default: 0 },
    presence_penalty: { type: Number, default: 0 },
  },
}, { timestamps: true });

const ModelConfig = mongoose.model('ModelConfig', modelConfigSchema);
export default ModelConfig;
