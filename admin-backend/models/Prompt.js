const mongoose = require("mongoose");

const promptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // optional: for logged-in user
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: false }, // optional admin
  llmId: { type: mongoose.Schema.Types.ObjectId, ref: "Llm", required: true }, // linked model
  promptText: { type: String, required: true },
  responseText: { type: String },  // filled after model response
  //createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Prompt", promptSchema);
