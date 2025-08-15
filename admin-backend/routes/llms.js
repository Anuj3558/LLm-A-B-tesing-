const express = require("express");
const router = express.Router();
const Llm = require("../models/Llm_manage");

// Get all LLMs
router.get("/", async (req, res) => {
  try {
    const llms = await Llm.find();
    //const llms = await Llm.find().select('-apiKey');  --avoiding direct api calls
    res.json(llms);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch LLMs" });
  }
});

// Add a new LLM
router.post("/", async (req, res) => {
  const { name, provider, apiKey, endpoint } = req.body;
  try {
    const newLlm = new Llm({ name, provider, apiKey, endpoint });
    await newLlm.save();
    res.status(201).json({ message: "LLM added", llm: newLlm });
  } catch (err) {
    res.status(400).json({ error: "Failed to add LLM", details: err });
  }
});

// Edit LLM
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedLlm = await Llm.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ message: "LLM updated", llm: updatedLlm });
  } catch (err) {
    res.status(400).json({ error: "Failed to update LLM" });
  }
});

// Delete LLM
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Llm.findByIdAndDelete(id);
    res.json({ message: "LLM deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete LLM" });
  }
});

module.exports = router;
