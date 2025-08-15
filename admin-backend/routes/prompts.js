const express = require("express");
const router = express.Router();
const Prompt = require("../models/Prompt");
const Llm = require("../models/Llm_manage");
const axios = require("axios");

require('dotenv').config();

const LLM_CONFIG = {
  GPT4: {
    apiKey: process.env.GPT4_API_KEY,
    endpoint: process.env.GPT4_ENDPOINT,
  },
  CLAUDE: {
    apiKey: process.env.CLAUDE_API_KEY,
    endpoint: process.env.CLAUDE_ENDPOINT,
  },
  // add more mappings here
};

// Create prompt and get model response
router.post("/", async (req, res) => {
  try {
    const { userId, adminId, llmId, promptText } = req.body;

    // 1. Find the LLM metadata
    const llm = await Llm.findById(llmId);
    if (!llm) return res.status(404).json({ error: "LLM not found" });

    // 2. Get API config from env vars by llm.name
    const config = LLM_CONFIG[llm.name.toUpperCase()];
    if (!config) return res.status(500).json({ error: "API config missing for LLM" });

    // 3. Call the model's API using config, not llm object
    const apiResponse = await axios.post(
      config.endpoint,
      { prompt: promptText },
      { headers: { Authorization: `Bearer ${config.apiKey}` } }
    );

    const responseText = apiResponse.data.choices?.[0]?.text || apiResponse.data.response || "";

    // 4. Save prompt + response
    const prompt = new Prompt({
      userId,
      adminId,
      llmId,
      promptText,
      responseText,
    });
    await prompt.save();

    res.json({ prompt, responseText });

  } catch (error) {
    console.error("Error handling prompt:", error);
    res.status(500).json({ error: "Failed to process prompt" });
  }
});

// Fetch all prompts (maybe filtered by user/admin)
router.get("/", async (req, res) => {
  try {
    // You can add query params to filter by userId/adminId later
    const prompts = await Prompt.find().populate("llmId").sort({ createdAt: -1 });
    res.json(prompts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch prompts" });
  }
});

module.exports = router;
