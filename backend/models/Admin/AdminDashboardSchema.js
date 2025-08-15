import mongoose from 'mongoose';

const { Schema } = mongoose;

// KPI Data Sub-Schema
const kpiSchema = new Schema({
  title: { type: String, required: true },
  value: { type: String, required: true },
  change: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true }
});

// Recent Activity Sub-Schema
const recentActivitySchema = new Schema({
  user: { type: String, required: true },
  action: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['success', 'error', 'info'], required: true }
});

// Main Dashboard Schema
const dashboardSchema = new Schema({
  adminId: { 
    type: Schema.Types.ObjectId, 
    required: true,
    ref: 'Admin' 
  },
  kpiData: [kpiSchema],
  tokenUsageData: [{
    date: { type: String, required: true },
    tokens: { type: Number, required: true }
  }],
  modelLatencyData: [{
    model: { type: String, required: true },
    latency: { type: Number, required: true }
  }],
  responseAcceptanceData: [{
    model: { type: String, required: true },
    value: { type: Number, required: true },
    color: { type: String, required: true }
  }],
  recentActivity: [recentActivitySchema]
}, { timestamps: true });

const Dashboard = mongoose.model('Dashboard', dashboardSchema);

export default Dashboard;