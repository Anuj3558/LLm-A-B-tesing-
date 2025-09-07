// models/User/PromptHistory.js
import mongoose from "mongoose";

const PromptHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true },
  prompt: { type: String, required: true },
  models: [{ type: mongoose.Schema.Types.ObjectId, ref: "AllModels" }],
  criteria: [{ type: String }],
  results: [
    {
      modelId: { type: mongoose.Schema.Types.ObjectId, ref: "AllModels" },
      modelName: String,
      response: String,
      accuracy: Number,
      tokens: Number,
      responseTime: Number
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("PromptHistory", PromptHistorySchema);
