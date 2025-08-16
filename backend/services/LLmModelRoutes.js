import Router from 'express';
import AllModelsConfig from '../models/AllModelConfig.js';
import { validateToken } from '../middleware/ValidateToken.js';
import { getAllModel } from '../controller/Admin/modelConfigController.js';

const LLmRouter = Router();

LLmRouter.post('/add', async (req, res) => {
    try {
    const { secretKey, name, provider, endpoint } = req.body;

    // Validate secret key
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: "Invalid secret key" });
    }

    // Validate inputs
    if (!name || !provider || !endpoint) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate
    const existing = await AllModelsConfig.findOne({ name, provider });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Model with this name and provider already exists" });
    }

    // Create new model
    const newModel = new AllModelsConfig({ name, provider, endpoint });
    await newModel.save();

    res.status(201).json({ message: "Model added successfully", model: newModel });
  } catch (error) {
    console.error("Error adding model:", error);
    res.status(500).json({ message: "Server error" });
  }
});

LLmRouter.get('/list', validateToken , getAllModel);
export default LLmRouter;