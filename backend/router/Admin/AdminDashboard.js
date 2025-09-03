// routes/adminDashboard.js
import express from "express";
import Dashboard from "../../models/Admin/AdminDashboardSchema.js";
import { ensureAdminDashboard, updateAdminDashboard } from "../../services/dashboardUtils.js";

const router = express.Router();

/**
 * CREATE - New Admin Dashboard (manual creation)
 */
router.post("/", async (req, res) => {
  try {
    const dashboard = new Dashboard(req.body);
    const savedDashboard = await dashboard.save();
    res.status(201).json({
      success: true,
      message: "Admin dashboard created successfully",
      data: savedDashboard
    });
  } catch (err) {
    console.error('Error creating admin dashboard:', err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

/**
 * READ - Get All Admin Dashboards (Paginated)
 */
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const dashboards = await Dashboard.find()
      .populate('adminId', 'username')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Dashboard.countDocuments();

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: dashboards
    });
  } catch (err) {
    console.error('Error fetching admin dashboards:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

/**
 * READ - Get Dashboard by Admin ID (Auto-creates if missing)
 */
router.get("/admin/:adminId", async (req, res) => {
  try {
    const dashboard = await ensureAdminDashboard(req.params.adminId);
    res.json({
      success: true,
      data: dashboard
    });
  } catch (err) {
    console.error('Error fetching/creating admin dashboard:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

/**
 * UPDATE - Modify Admin Dashboard
 */
router.put("/:id", async (req, res) => {
  try {
    const updatedDashboard = await Dashboard.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!updatedDashboard) {
      return res.status(404).json({ 
        success: false,
        error: "Admin dashboard not found" 
      });
    }
    
    res.json({
      success: true,
      message: "Admin dashboard updated successfully",
      data: updatedDashboard
    });
  } catch (err) {
    console.error('Error updating admin dashboard:', err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

/**
 * UPDATE - Add KPI Data to Admin Dashboard
 */
router.post("/admin/:adminId/kpi", async (req, res) => {
  try {
    const { kpiData } = req.body;
    const adminId = req.params.adminId;

    const dashboard = await ensureAdminDashboard(adminId);
    
    if (kpiData && Array.isArray(kpiData)) {
      dashboard.kpiData = kpiData;
    }
    
    dashboard.updatedAt = new Date();
    await dashboard.save();

    res.json({
      success: true,
      message: "KPI data updated successfully",
      data: dashboard
    });
  } catch (err) {
    console.error('Error updating KPI data:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

/**
 * UPDATE - Add Token Usage Data
 */
router.post("/admin/:adminId/token-usage", async (req, res) => {
  try {
    const { date, tokens } = req.body;
    const adminId = req.params.adminId;

    const dashboard = await ensureAdminDashboard(adminId);
    
    // Check if data for this date already exists
    const existingData = dashboard.tokenUsageData.find(item => item.date === date);
    
    if (existingData) {
      existingData.tokens += tokens;
    } else {
      dashboard.tokenUsageData.push({ date, tokens });
    }
    
    // Keep only last 30 days
    if (dashboard.tokenUsageData.length > 30) {
      dashboard.tokenUsageData = dashboard.tokenUsageData
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 30);
    }
    
    dashboard.updatedAt = new Date();
    await dashboard.save();

    res.json({
      success: true,
      message: "Token usage data updated successfully",
      data: dashboard
    });
  } catch (err) {
    console.error('Error updating token usage:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

/**
 * UPDATE - Add Model Latency Data
 */
router.post("/admin/:adminId/model-latency", async (req, res) => {
  try {
    const { model, latency } = req.body;
    const adminId = req.params.adminId;

    const dashboard = await ensureAdminDashboard(adminId);
    
    // Check if data for this model already exists
    const existingData = dashboard.modelLatencyData.find(item => item.model === model);
    
    if (existingData) {
      // Update with average
      existingData.latency = (existingData.latency + latency) / 2;
    } else {
      dashboard.modelLatencyData.push({ model, latency });
    }
    
    dashboard.updatedAt = new Date();
    await dashboard.save();

    res.json({
      success: true,
      message: "Model latency data updated successfully",
      data: dashboard
    });
  } catch (err) {
    console.error('Error updating model latency:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

/**
 * UPDATE - Add Recent Activity
 */
router.post("/admin/:adminId/activity", async (req, res) => {
  try {
    const { user, action, status } = req.body;
    const adminId = req.params.adminId;

    const dashboard = await ensureAdminDashboard(adminId);
    
    // Add new activity to the beginning of the array
    dashboard.recentActivity.unshift({
      user,
      action,
      time: new Date().toISOString(),
      status: status || 'info'
    });
    
    // Keep only last 20 activities
    if (dashboard.recentActivity.length > 20) {
      dashboard.recentActivity = dashboard.recentActivity.slice(0, 20);
    }
    
    dashboard.updatedAt = new Date();
    await dashboard.save();

    res.json({
      success: true,
      message: "Activity added successfully",
      data: dashboard
    });
  } catch (err) {
    console.error('Error adding activity:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

/**
 * UPDATE - Bulk Update Dashboard Data
 */
router.put("/admin/:adminId/bulk-update", async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const updateData = req.body;

    const dashboard = await updateAdminDashboard(adminId, updateData);

    res.json({
      success: true,
      message: "Dashboard updated successfully",
      data: dashboard
    });
  } catch (err) {
    console.error('Error bulk updating dashboard:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

/**
 * RESET - Initialize/Reset Admin Dashboard
 */
router.post("/admin/:adminId/reset", async (req, res) => {
  try {
    const adminId = req.params.adminId;
    
    // Delete existing dashboard if it exists
    await Dashboard.findOneAndDelete({ adminId });
    
    // Create new dashboard with default values
    const newDashboard = await ensureAdminDashboard(adminId);
    
    res.json({
      success: true,
      message: "Admin dashboard reset successfully",
      data: newDashboard
    });
  } catch (err) {
    console.error('Error resetting admin dashboard:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

/**
 * DELETE - Remove Admin Dashboard
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedDashboard = await Dashboard.findByIdAndDelete(req.params.id);
    
    if (!deletedDashboard) {
      return res.status(404).json({ 
        success: false,
        error: "Admin dashboard not found" 
      });
    }
    
    res.json({ 
      success: true,
      message: "Admin dashboard deleted successfully" 
    });
  } catch (err) {
    console.error('Error deleting admin dashboard:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

export default router;

// Export helper functions for use in other modules
export { ensureAdminDashboard, updateAdminDashboard };
