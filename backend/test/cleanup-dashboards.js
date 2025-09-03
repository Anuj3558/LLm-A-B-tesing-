// Script to clean up corrupted dashboard data
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Dashboard from '../models/Admin/AdminDashboardSchema.js';

dotenv.config();

async function cleanupDashboards() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/llm-testing');
    console.log('Connected to MongoDB');

    // Find all dashboards
    const dashboards = await Dashboard.find({});
    console.log(`Found ${dashboards.length} dashboards to check`);

    let fixedCount = 0;

    for (const dashboard of dashboards) {
      let needsSave = false;

      // Clean up malformed recentActivity entries
      if (dashboard.recentActivity && dashboard.recentActivity.length > 0) {
        const originalLength = dashboard.recentActivity.length;
        
        dashboard.recentActivity = dashboard.recentActivity.filter(activity => {
          // Check if all required fields are present and valid
          return activity.user && 
                 activity.action && 
                 activity.time && 
                 activity.status &&
                 typeof activity.user === 'string' &&
                 typeof activity.action === 'string' &&
                 typeof activity.time === 'string' &&
                 ['success', 'error', 'info'].includes(activity.status);
        });

        if (dashboard.recentActivity.length !== originalLength) {
          console.log(`Cleaned ${originalLength - dashboard.recentActivity.length} malformed activities from dashboard ${dashboard._id}`);
          needsSave = true;
        }
      }

      // Ensure required arrays exist
      if (!dashboard.tokenUsageData) {
        dashboard.tokenUsageData = [];
        needsSave = true;
      }
      if (!dashboard.modelLatencyData) {
        dashboard.modelLatencyData = [];
        needsSave = true;
      }
      if (!dashboard.responseAcceptanceData) {
        dashboard.responseAcceptanceData = [];
        needsSave = true;
      }
      if (!dashboard.recentActivity) {
        dashboard.recentActivity = [];
        needsSave = true;
      }

      // Ensure kpiData is valid
      if (!dashboard.kpiData || !Array.isArray(dashboard.kpiData)) {
        dashboard.kpiData = [];
        needsSave = true;
      }

      if (needsSave) {
        try {
          await dashboard.save();
          fixedCount++;
          console.log(`✅ Fixed dashboard ${dashboard._id}`);
        } catch (error) {
          console.error(`❌ Failed to fix dashboard ${dashboard._id}:`, error.message);
          
          // If still failing, reset the problematic data
          dashboard.recentActivity = [];
          dashboard.tokenUsageData = [];
          dashboard.modelLatencyData = [];
          dashboard.responseAcceptanceData = [];
          
          try {
            await dashboard.save();
            console.log(`✅ Fixed dashboard ${dashboard._id} after resetting all arrays`);
            fixedCount++;
          } catch (resetError) {
            console.error(`❌ Still failed after reset:`, resetError.message);
          }
        }
      }
    }

    console.log(`\n🎉 Cleanup complete! Fixed ${fixedCount} dashboards.`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

cleanupDashboards();
