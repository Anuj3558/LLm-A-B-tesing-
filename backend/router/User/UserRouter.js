import UserDashboard from "./UserDashboard.js"

import express from "express";
const router = express.Router();


router.use("/dashboard", UserDashboard);

export default router;
