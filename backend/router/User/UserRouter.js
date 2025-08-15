import Dashboard from "./Dashboard.js"

import express from "express";
const router = express.Router();


router.use("/dashboard", Dashboard);

export default router;
