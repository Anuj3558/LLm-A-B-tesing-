// routes/dashboard.js
import express from "express";
import Dashboard from "../../models/User/UserDashBoardSchema.js"; // Ensure this path is correct

const router = express.Router();

/**
 * CREATE - New Dashboard
 */
router.post("/", async (req, res) => {
  try {
    const dashboard = new Dashboard(req.body);
    const savedDashboard = await dashboard.save();
    res.status(201).json(savedDashboard);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * READ - Get All Dashboards (Paginated)
 */
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const dashboards = await Dashboard.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Dashboard.countDocuments();

    res.json({
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: dashboards
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * READ - Get Dashboard by User ID
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ userId: req.params.userId });
    if (!dashboard) return res.status(404).json({ error: "Dashboard not found" });
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * UPDATE - Modify Dashboard
 */
router.put("/:id", async (req, res) => {
  try {
    const updatedDashboard = await Dashboard.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedDashboard) return res.status(404).json({ error: "Dashboard not found" });
    res.json(updatedDashboard);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE - Remove Dashboard
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedDashboard = await Dashboard.findByIdAndDelete(req.params.id);
    if (!deletedDashboard) return res.status(404).json({ error: "Dashboard not found" });
    res.json({ message: "Dashboard deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
