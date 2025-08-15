const mongoose = require("mongoose");

const llmSchema = new mongoose.Schema({
  name: { type: String, required: true },        // e.g., GPT-4, Claude 3
  provider: { type: String, required: true },    // e.g., OpenAI, Anthropic
  //apiKey: { type: String, required: true },      // Store securely later
  //endpoint: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Llm", llmSchema);
