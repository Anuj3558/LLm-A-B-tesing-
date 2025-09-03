// routes/promptHistory.js - Routes for prompt history management
import express from 'express';
import PromptHistory from '../models/PromptHistory.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user's prompt history with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      search = '',
      modelFilter = 'all',
      outcomeFilter = 'all',
      dateFilter = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      modelFilter,
      outcomeFilter,
      dateFilter,
      sortBy,
      sortOrder: sortOrder === 'desc' ? -1 : 1
    };

    const history = await PromptHistory.getUserHistory(userId, options);
    const totalCount = await PromptHistory.countDocuments({ userId });

    // Get filter counts for UI
    const filterCounts = await Promise.all([
      PromptHistory.countDocuments({ userId, 'summary.outcome': 'Success' }),
      PromptHistory.countDocuments({ userId, 'summary.outcome': 'Partial' }),
      PromptHistory.countDocuments({ userId, 'summary.outcome': 'Error' }),
    ]);

    res.json({
      success: true,
      data: {
        history,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit),
          hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        },
        filters: {
          total: totalCount,
          success: filterCounts[0],
          partial: filterCounts[1],
          error: filterCounts[2]
        }
      }
    });
  } catch (error) {
    console.error('Error fetching prompt history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prompt history',
      details: error.message
    });
  }
});

// Get specific prompt history entry by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const historyEntry = await PromptHistory.findOne({ _id: id, userId })
      .populate('userId', 'username email');

    if (!historyEntry) {
      return res.status(404).json({
        success: false,
        error: 'Prompt history entry not found'
      });
    }

    res.json({
      success: true,
      data: historyEntry
    });
  } catch (error) {
    console.error('Error fetching prompt history entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prompt history entry',
      details: error.message
    });
  }
});

// Delete prompt history entry
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const historyEntry = await PromptHistory.findOneAndDelete({ _id: id, userId });

    if (!historyEntry) {
      return res.status(404).json({
        success: false,
        error: 'Prompt history entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Prompt history entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting prompt history entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete prompt history entry',
      details: error.message
    });
  }
});

// Add or update feedback for a prompt history entry
router.post('/:id/feedback', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating, comment = '' } = req.body;

    if (!rating || !['positive', 'negative', 'neutral'].includes(rating)) {
      return res.status(400).json({
        success: false,
        error: 'Rating is required and must be one of: positive, negative, neutral'
      });
    }

    const historyEntry = await PromptHistory.findOne({ _id: id, userId });

    if (!historyEntry) {
      return res.status(404).json({
        success: false,
        error: 'Prompt history entry not found'
      });
    }

    await historyEntry.addFeedback(rating, comment);

    res.json({
      success: true,
      message: 'Feedback added successfully',
      data: historyEntry.feedback
    });
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add feedback',
      details: error.message
    });
  }
});

// Get user's prompt history statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await PromptHistory.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalPrompts: { $sum: 1 },
          successfulPrompts: {
            $sum: { $cond: [{ $eq: ['$summary.outcome', 'Success'] }, 1, 0] }
          },
          partialPrompts: {
            $sum: { $cond: [{ $eq: ['$summary.outcome', 'Partial'] }, 1, 0] }
          },
          errorPrompts: {
            $sum: { $cond: [{ $eq: ['$summary.outcome', 'Error'] }, 1, 0] }
          },
          totalTokens: { $sum: '$summary.totalTokens' },
          averageResponseTime: { $avg: '$summary.averageResponseTime' },
          totalModelsUsed: { $sum: '$summary.totalModels' }
        }
      }
    ]);

    // Get most used models
    const modelStats = await PromptHistory.aggregate([
      { $match: { userId: userId } },
      { $unwind: '$selectedModels' },
      {
        $group: {
          _id: '$selectedModels',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = await PromptHistory.countDocuments({
      userId,
      createdAt: { $gte: sevenDaysAgo }
    });

    const result = stats[0] || {
      totalPrompts: 0,
      successfulPrompts: 0,
      partialPrompts: 0,
      errorPrompts: 0,
      totalTokens: 0,
      averageResponseTime: 0,
      totalModelsUsed: 0
    };

    res.json({
      success: true,
      data: {
        overview: {
          ...result,
          successRate: result.totalPrompts > 0 ? Math.round((result.successfulPrompts / result.totalPrompts) * 100) : 0,
          recentActivity
        },
        mostUsedModels: modelStats.map(stat => ({
          model: stat._id,
          count: stat.count
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching prompt history stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prompt history statistics',
      details: error.message
    });
  }
});

// Bulk delete prompt history entries
router.post('/bulk-delete', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'IDs array is required and must not be empty'
      });
    }

    const result = await PromptHistory.deleteMany({
      _id: { $in: ids },
      userId
    });

    res.json({
      success: true,
      message: `${result.deletedCount} prompt history entries deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting prompt history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete prompt history entries',
      details: error.message
    });
  }
});

export default router;
