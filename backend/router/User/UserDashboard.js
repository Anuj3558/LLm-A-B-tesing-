// routes/dashboard.js
import express from "express";

import UserDashboard from "../../models/User/UserDashBoardSchema.js"; // Correct path to the schema
const router = express.Router();

/**
 * Helper function to create default dashboard data
 */
const createDefaultDashboard = (userId) => {
  return {
    userId: userId,
    promptsTested: 0,
    responseTimes: [], // Array of numbers (response times in milliseconds)
    averageResponseTime: 0,
    tokensUsed: 0,
    tokensUsedThisWeek: 0,
    bestPerformingModel: null,
    accuracy: 0,
    weeklyPerformanceScores: [],
    modelUsageDistribution: new Map(),
    feedback: {
      positive: 0,
      negative: 0
    },
    testLogs: []
  };
};

/**
 * Helper function to ensure user has a dashboard
 */
const ensureUserDashboard = async (userId) => {
  let dashboard = await UserDashboard.findOne({ userId });
  
  if (!dashboard) {
    dashboard = new UserDashboard(createDefaultDashboard(userId));
    await dashboard.save();
    console.log(`Created new dashboard for user: ${userId}`);
  }
  
  return dashboard;
};

/**
 * CREATE - New Dashboard
 */
router.post("/", async (req, res) => {
  try {
    const dashboard = new UserDashboard(req.body);
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
    const dashboards = await UserDashboard.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await UserDashboard.countDocuments();

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
    const dashboard = await ensureUserDashboard(req.params.userId);
    res.json(dashboard);
  } catch (err) {
    console.error('Error fetching/creating dashboard:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * UPDATE - Modify Dashboard
 */
router.put("/:id", async (req, res) => {
  try {
    const updatedDashboard = await UserDashboard.findByIdAndUpdate(
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
 * UPDATE Dashboard Statistics - Add new test result
 */
router.post("/user/:userId/add-test", async (req, res) => {
  try {
    const { prompt, model, response, responseTime, accuracy, feedback } = req.body;
    const userId = req.params.userId;

    // Ensure user has a dashboard
    const dashboard = await ensureUserDashboard(userId);

    // Add new test log
    const newTestLog = {
      prompt,
      model,
      response,
      time: new Date(),
      accuracy: accuracy || 0,
      tokensUsed: response ? response.length : 0,
      feedback: feedback || "neutral"
    };

    dashboard.testLogs.push(newTestLog);
    dashboard.promptsTested += 1;

    // Update response times
    if (responseTime) {
      dashboard.responseTimes.push(responseTime);
      
      // Calculate new average response time
      const totalTime = dashboard.responseTimes.reduce((sum, time) => sum + time, 0);
      dashboard.averageResponseTime = totalTime / dashboard.responseTimes.length;
    }

    // Update tokens used
    if (response) {
      dashboard.tokensUsed += response.length;
      dashboard.tokensUsedThisWeek += response.length;
    }

    // Update accuracy
    if (accuracy) {
      dashboard.accuracy = accuracy; // You might want to calculate average accuracy instead
    }

    // Update weekly performance scores
    const today = new Date();
    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][today.getDay()];
    const existingDay = dashboard.weeklyPerformanceScores.find(item => item.day === dayName);
    
    if (existingDay) {
      existingDay.score = accuracy || existingDay.score;
    } else if (accuracy) {
      dashboard.weeklyPerformanceScores.push({
        day: dayName,
        score: accuracy
      });
    }

    // Update model usage distribution
    const currentCount = dashboard.modelUsageDistribution.get(model) || 0;
    dashboard.modelUsageDistribution.set(model, currentCount + 1);

    // Update feedback counts
    if (feedback === "positive") {
      dashboard.feedback.positive += 1;
    } else if (feedback === "negative") {
      dashboard.feedback.negative += 1;
    }

    // Determine best performing model (simplified logic)
    if (model && accuracy && accuracy > 80) {
      dashboard.bestPerformingModel = model;
    }

    dashboard.updatedAt = new Date();
    await dashboard.save();

    res.json({ 
      success: true,
      message: "Dashboard updated successfully", 
      data: dashboard 
    });
  } catch (err) {
    console.error('Error updating dashboard:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

/**
 * UPDATE - Add Response Time Data
 */
router.post("/user/:userId/response-time", async (req, res) => {
  try {
    const { responseTime } = req.body;
    const userId = req.params.userId;

    const dashboard = await ensureUserDashboard(userId);
    
    if (responseTime && typeof responseTime === 'number') {
      dashboard.responseTimes.push(responseTime);
      
      // Calculate new average
      const totalTime = dashboard.responseTimes.reduce((sum, time) => sum + time, 0);
      dashboard.averageResponseTime = totalTime / dashboard.responseTimes.length;
      
      dashboard.updatedAt = new Date();
      await dashboard.save();
    }

    res.json({
      success: true,
      message: "Response time updated successfully",
      data: dashboard
    });
  } catch (err) {
    console.error('Error updating response time:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

/**
 * UPDATE - Update Token Usage
 */
router.post("/user/:userId/tokens", async (req, res) => {
  try {
    const { tokensUsed, isWeekly = false } = req.body;
    const userId = req.params.userId;

    const dashboard = await ensureUserDashboard(userId);
    
    if (tokensUsed && typeof tokensUsed === 'number') {
      dashboard.tokensUsed += tokensUsed;
      
      if (isWeekly) {
        dashboard.tokensUsedThisWeek += tokensUsed;
      }
      
      dashboard.updatedAt = new Date();
      await dashboard.save();
    }

    res.json({
      success: true,
      message: "Token usage updated successfully",
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
 * UPDATE - Update Weekly Performance
 */
router.post("/user/:userId/weekly-performance", async (req, res) => {
  try {
    const { day, score } = req.body;
    const userId = req.params.userId;

    const dashboard = await ensureUserDashboard(userId);
    
    const validDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    if (validDays.includes(day) && typeof score === 'number' && score >= 0 && score <= 100) {
      const existingDay = dashboard.weeklyPerformanceScores.find(item => item.day === day);
      
      if (existingDay) {
        existingDay.score = score;
      } else {
        dashboard.weeklyPerformanceScores.push({ day, score });
      }
      
      dashboard.updatedAt = new Date();
      await dashboard.save();
    }

    res.json({
      success: true,
      message: "Weekly performance updated successfully",
      data: dashboard
    });
  } catch (err) {
    console.error('Error updating weekly performance:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

/**
 * UPDATE - Update Model Usage
 */
router.post("/user/:userId/model-usage", async (req, res) => {
  try {
    const { model, increment = 1 } = req.body;
    const userId = req.params.userId;

    const dashboard = await ensureUserDashboard(userId);
    
    if (model) {
      const currentCount = dashboard.modelUsageDistribution.get(model) || 0;
      dashboard.modelUsageDistribution.set(model, currentCount + increment);
      
      dashboard.updatedAt = new Date();
      await dashboard.save();
    }

    res.json({
      success: true,
      message: "Model usage updated successfully",
      data: dashboard
    });
  } catch (err) {
    console.error('Error updating model usage:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

/**
 * UPDATE - Add Feedback
 */
router.post("/user/:userId/feedback", async (req, res) => {
  try {
    const { feedback } = req.body;
    const userId = req.params.userId;

    const dashboard = await ensureUserDashboard(userId);
    
    if (feedback === "positive") {
      dashboard.feedback.positive += 1;
    } else if (feedback === "negative") {
      dashboard.feedback.negative += 1;
    }
    
    dashboard.updatedAt = new Date();
    await dashboard.save();

    res.json({
      success: true,
      message: "Feedback updated successfully",
      data: dashboard
    });
  } catch (err) {
    console.error('Error updating feedback:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

/**
 * READ - Get Dashboard Statistics
 */
router.get("/user/:userId/stats", async (req, res) => {
  try {
    const userId = req.params.userId;
    const dashboard = await ensureUserDashboard(userId);

    const stats = {
      totalPrompts: dashboard.promptsTested,
      averageResponseTime: dashboard.averageResponseTime,
      totalTokens: dashboard.tokensUsed,
      weeklyTokens: dashboard.tokensUsedThisWeek,
      bestModel: dashboard.bestPerformingModel,
      overallAccuracy: dashboard.accuracy,
      positiveFeedback: dashboard.feedback.positive,
      negativeFeedback: dashboard.feedback.negative,
      feedbackRatio: dashboard.feedback.positive + dashboard.feedback.negative > 0 
        ? (dashboard.feedback.positive / (dashboard.feedback.positive + dashboard.feedback.negative) * 100).toFixed(2)
        : 0,
      recentTests: dashboard.testLogs.slice(-5),
      modelDistribution: Object.fromEntries(dashboard.modelUsageDistribution),
      weeklyProgress: dashboard.weeklyPerformanceScores
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

/**
 * RESET - Initialize/Reset Dashboard for User
 */
router.post("/user/:userId/reset", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Delete existing dashboard if it exists
    await UserDashboard.findOneAndDelete({ userId });
    
    // Create new dashboard with default values
    const newDashboard = new UserDashboard(createDefaultDashboard(userId));
    await newDashboard.save();
    
    res.json({ 
      message: "Dashboard reset successfully", 
      dashboard: newDashboard 
    });
  } catch (err) {
    console.error('Error resetting dashboard:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE - Remove Dashboard
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedDashboard = await UserDashboard.findByIdAndDelete(req.params.id);
    if (!deletedDashboard) return res.status(404).json({ error: "Dashboard not found" });
    res.json({ message: "Dashboard deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

// Export helper functions for use in other modules
export { ensureUserDashboard, createDefaultDashboard };
