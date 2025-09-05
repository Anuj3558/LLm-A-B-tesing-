import mongoose from 'mongoose';

const { Schema } = mongoose;

// Test Log Sub-Schema
const testLogSchema = new Schema({
  prompt: { type: String, required: true },
  model: { type: String, required: true },
  time: { type: Date, default: Date.now },
  accuracy: { type: Number, required: true },
  feedback: { type: String, enum: ['positive', 'negative'], required: true }
});

// Weekly Performance Sub-Schema
const weeklyPerformanceSchema = new Schema({
  day: { type: String, required: true },
  score: { type: Number, required: true }
});

// Main User Dashboard Schema
const userDashboardSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    required: true,
    ref: 'User' 
  },
  promptsTested: { type: Number, default: 0 },
  bestPerformingModel: { type: String, default: '' },
  accuracy: { type: Number, default: 0 },
  averageResponseTime: { type: Number, default: 0 },
  tokensUsedThisWeek: { type: Number, default: 0 },
  modelUsageDistribution: { type: Map, of: Number },
  weeklyPerformanceScores: [weeklyPerformanceSchema],
  feedback: {
    positive: { type: Number, default: 0 },
    negative: { type: Number, default: 0 }
  },
  testLogs: [testLogSchema]
}, { timestamps: true });

// Static method to get or create user dashboard
userDashboardSchema.statics.getUserDashboard = async function(userId) {
  let dashboard = await this.findOne({ userId });
  
  if (!dashboard) {
    // Create a new dashboard with default data
    dashboard = new this({
      userId,
      promptsTested: 0,
      bestPerformingModel: 'GPT-4',
      accuracy: 0,
      averageResponseTime: 0,
      tokensUsedThisWeek: 0,
      modelUsageDistribution: new Map([
        ['GPT-4', 0],
        ['Claude-2', 0],
        ['Llama-2-70B', 0],
        ['PaLM-2', 0],
        ['Cohere-Command', 0]
      ]),
      weeklyPerformanceScores: [
        { day: 'Mon', score: 0 },
        { day: 'Tue', score: 0 },
        { day: 'Wed', score: 0 },
        { day: 'Thu', score: 0 },
        { day: 'Fri', score: 0 },
        { day: 'Sat', score: 0 },
        { day: 'Sun', score: 0 }
      ],
      feedback: {
        positive: 0,
        negative: 0
      },
      testLogs: []
    });
    
    await dashboard.save();
  }
  
  return dashboard;
};

// Method to add a test log
userDashboardSchema.methods.addTestLog = async function(logData) {
  const { prompt, model, accuracy, feedback } = logData;
  
  // Add to test logs
  this.testLogs.push({
    prompt,
    model,
    accuracy,
    feedback,
    time: new Date()
  });
  
  // Update prompts tested count
  this.promptsTested += 1;
  
  // Update model usage distribution
  const currentCount = this.modelUsageDistribution.get(model) || 0;
  this.modelUsageDistribution.set(model, currentCount + 1);
  
  // Update feedback counts
  if (feedback === 'positive') {
    this.feedback.positive += 1;
  } else {
    this.feedback.negative += 1;
  }
  
  // Update best performing model (simplified logic)
  if (accuracy > this.accuracy) {
    this.bestPerformingModel = model;
    this.accuracy = accuracy;
  }
  
  // Update average response time (mock calculation)
  this.averageResponseTime = (this.averageResponseTime * (this.promptsTested - 1) + 
                             (Math.random() * 2000 + 500)) / this.promptsTested;
  
  // Update tokens used (mock calculation)
  this.tokensUsedThisWeek += Math.floor(Math.random() * 1000) + 100;
  
  // Update weekly performance (mock data)
  const today = new Date().getDay();
  const dayIndex = today === 0 ? 6 : today - 1; // Adjust for Sunday
  this.weeklyPerformanceScores[dayIndex].score = Math.floor(Math.random() * 25) + 70;
  
  await this.save();
  return this;
};

const UserDashboard = mongoose.model('UserDashboard', userDashboardSchema);

export default UserDashboard;