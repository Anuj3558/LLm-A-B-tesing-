import Dashboard from "./Dashboard"

import express from "express";
const router = express.Router();


router.use("/dashboard", Dashboard);

export default router;
