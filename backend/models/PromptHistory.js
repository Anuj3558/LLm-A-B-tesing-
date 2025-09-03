import mongoose from 'mongoose';

const promptHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  prompt: {
    type: String,
    required: true,
    maxlength: 10000
  },
  selectedModels: [{
    type: String,
    required: true
  }],
  evaluationCriteria: [{
    type: String,
    enum: ['accuracy', 'tokens', 'responseTime', 'coherence', 'creativity', 'relevance']
  }],
  results: [{
    modelId: String,
    modelName: String,
    provider: String,
    response: String,
    success: Boolean,
    error: String,
    errorType: String,
    metrics: {
      responseTime: Number,
      tokens: Number,
      inputTokens: Number,
      outputTokens: Number,
      accuracy: Number,
      coherence: Number,
      creativity: Number,
      relevance: Number,
      wordCount: Number
    }
  }],
  summary: {
    totalModels: Number,
    successfulModels: Number,
    bestModel: String,
    bestAccuracy: Number,
    averageResponseTime: Number,
    totalTokens: Number,
    outcome: {
      type: String,
      enum: ['Success', 'Partial', 'Error'],
      default: 'Error'
    }
  },
  feedback: {
    rating: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    },
    comment: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  metadata: {
    sessionId: String,
    userAgent: String,
    ipAddress: String,
    version: {
      type: String,
      default: '1.0'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
promptHistorySchema.index({ userId: 1, createdAt: -1 });
promptHistorySchema.index({ 'summary.outcome': 1 });
promptHistorySchema.index({ 'feedback.rating': 1 });
promptHistorySchema.index({ createdAt: -1 });

// Virtual for calculating response time statistics
promptHistorySchema.virtual('stats').get(function() {
  if (!this.results || this.results.length === 0) return null;
  
  const successfulResults = this.results.filter(r => r.success);
  if (successfulResults.length === 0) return null;
  
  return {
    averageResponseTime: successfulResults.reduce((acc, r) => acc + (r.metrics?.responseTime || 0), 0) / successfulResults.length,
    totalTokens: successfulResults.reduce((acc, r) => acc + (r.metrics?.tokens || 0), 0),
    bestAccuracy: Math.max(...successfulResults.map(r => r.metrics?.accuracy || 0))
  };
});

// Method to add feedback
promptHistorySchema.methods.addFeedback = function(rating, comment = '') {
  this.feedback = {
    rating,
    comment,
    timestamp: new Date()
  };
  return this.save();
};

// Method to update summary after test completion
promptHistorySchema.methods.updateSummary = function() {
  if (!this.results || this.results.length === 0) {
    this.summary = {
      totalModels: 0,
      successfulModels: 0,
      outcome: 'Error'
    };
    return;
  }
  
  const successfulResults = this.results.filter(r => r.success);
  const totalModels = this.results.length;
  const successfulModels = successfulResults.length;
  
  // Determine outcome
  let outcome = 'Error';
  if (successfulModels === totalModels) {
    outcome = 'Success';
  } else if (successfulModels > 0) {
    outcome = 'Partial';
  }
  
  // Find best model based on accuracy
  let bestModel = null;
  let bestAccuracy = 0;
  successfulResults.forEach(result => {
    if (result.metrics?.accuracy > bestAccuracy) {
      bestAccuracy = result.metrics.accuracy;
      bestModel = result.modelName;
    }
  });
  
  // Calculate averages
  const averageResponseTime = successfulResults.length > 0 
    ? successfulResults.reduce((acc, r) => acc + (r.metrics?.responseTime || 0), 0) / successfulResults.length 
    : 0;
  
  const totalTokens = successfulResults.reduce((acc, r) => acc + (r.metrics?.tokens || 0), 0);
  
  this.summary = {
    totalModels,
    successfulModels,
    bestModel,
    bestAccuracy,
    averageResponseTime: Math.round(averageResponseTime),
    totalTokens,
    outcome
  };
};

// Static method to get user's prompt history with pagination
promptHistorySchema.statics.getUserHistory = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    search = '',
    modelFilter = 'all',
    outcomeFilter = 'all',
    dateFilter = 'all',
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;
  
  const query = { userId };
  
  // Search filter
  if (search) {
    query.prompt = { $regex: search, $options: 'i' };
  }
  
  // Model filter
  if (modelFilter !== 'all') {
    query.selectedModels = { $in: [new RegExp(modelFilter, 'i')] };
  }
  
  // Outcome filter
  if (outcomeFilter !== 'all') {
    query['summary.outcome'] = outcomeFilter;
  }
  
  // Date filter
  if (dateFilter !== 'all') {
    const now = new Date();
    let startDate;
    
    switch (dateFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }
    
    if (startDate) {
      query.createdAt = { $gte: startDate };
    }
  }
  
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder };
  
  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('userId', 'username email')
    .lean();
};

const PromptHistory = mongoose.models.PromptHistory || mongoose.model('PromptHistory', promptHistorySchema);

export default PromptHistory;
