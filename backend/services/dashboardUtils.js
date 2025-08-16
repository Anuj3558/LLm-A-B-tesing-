import Dashboard from '../models/Admin/AdminDashboardSchema.js'; // Ensure this path is correct

export const initializeDashboard = async (adminId) => {
  const defaultDashboard = {
    adminId,
    kpiData: [
      { 
        title: "Active Users", 
        value: "0", 
        change: "+0%", 
        icon: "Users", 
        color: "vibrant-blue" 
      },
      { 
        title: "Total Registered Users", 
        value: "0", 
        change: "+0%", 
        icon: "MessageSquare", 
        color: "vibrant-teal" 
      },
      { 
        title: "Total Prompts Tested", 
        value: "0", 
        change: "+0%", 
        icon: "Activity", 
        color: "dusky-orange" 
      },
      { 
        title: "Most Used LLM", 
        value: "None", 
        change: "0%", 
        icon: "Cpu", 
        color: "forest-green" 
      }
    ],
    tokenUsageData: [],
    modelLatencyData: [],
    responseAcceptanceData: [],
    recentActivity: []
  };

  return await Dashboard.create(defaultDashboard);
};