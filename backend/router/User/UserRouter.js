import Dashboard from "./UserDashboard.js"
import { getUserAllowedModels, getUserProfile } from "../../controller/User/UserController.js";
import { validateToken } from "../../middleware/ValidateToken.js";

import express from "express";
const router = express.Router();

// User profile and model access routes
router.get("/profile", validateToken, getUserProfile);
router.get("/allowed-models", validateToken, getUserAllowedModels);

router.use("/dashboards", Dashboard);

export default router;
