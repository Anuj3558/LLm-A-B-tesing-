import UserDashboard from "../../../src/components/UserDashboard.jsx";

import express from "express";
const router = express.Router();


router.use("/dashboard", UserDashboard);

export default router;
