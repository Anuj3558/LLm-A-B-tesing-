import mongoose from "mongoose";

const TestLogSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
    trim: true
  },
  time: {
    type: Date,
    default: Date.now
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  model: {
    type: String,
    enum: ["GPT-4", "GPT-3.5", "Claude 3", "Gemini", "LLaMA"],
    required: true
  },
  response: {
    type: mongoose.Schema.Types.Mixed, // could be text, structured JSON, etc.
    required: true
  },
  tokensUsed: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String,
    enum: ["positive", "negative", "neutral"],
    default: "neutral"
  }
});

const DashboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  promptsTested: {
    type: Number,
    default: 0
  },
  responseTimes: {
    type: [Number], // store in milliseconds
    default: []
  },
  averageResponseTime: {
    type: Number,
    default: 0
  },
  tokensUsed: {
    type: Number,
    default: 0
  },
  tokensUsedThisWeek: {
    type: Number,
    default: 0
  },
  bestPerformingModel: {
    type: String,
    enum: ["GPT-4", "GPT-3.5", "Claude 3", "Gemini", "LLaMA"],
    default: null
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  weeklyPerformanceScores: {
    type: [
      {
        day: { type: String, enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
        score: { type: Number, min: 0, max: 100 }
      }
    ],
    default: []
  },
  modelUsageDistribution: {
    type: Map,
    of: Number, // modelName -> count
    default: {}
  },
  feedback: {
    positive: { type: Number, default: 0 },
    negative: { type: Number, default: 0 }
  },
  testLogs: {
    type: [TestLogSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for analytics queries
DashboardSchema.index({ userId: 1, createdAt: -1 });
const Dashboard = mongoose.model("UserDashboard", DashboardSchema);
export default Dashboard;
