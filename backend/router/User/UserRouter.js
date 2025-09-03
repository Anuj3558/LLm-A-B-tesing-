import Dashboard from "./UserDashboard.js"

import express from "express";
const router = express.Router();


router.use("/dashboards", Dashboard);

export default router;
