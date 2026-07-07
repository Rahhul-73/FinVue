const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const mockDb = require('../config/mockDb');

// @desc    Get summary statistics and category breakdowns for a month
// @route   GET /api/analytics/summary
// @access  Private
exports.getSummary = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    // Dynamic Fallback check
    if (mongoose.connection.readyState !== 1) {
      const allExpenses = await mockDb.expenses.find(req.user.id);
      
      // Filter expenses by month and year
      const monthlyExpenses = allExpenses.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });

      const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
      const count = monthlyExpenses.length;
      const avgSpent = count > 0 ? totalSpent / count : 0;

      // Group spent amounts by category
      const categoryMap = {};
      monthlyExpenses.forEach((e) => {
        categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
      });

      // Get budgets for this month
      const budgets = await mockDb.budgets.find(req.user.id, month, year);
      const budgetMap = {};
      budgets.forEach((b) => {
        budgetMap[b.category] = b.limit;
      });

      // Merge statistics
      const breakdown = [];
      Object.keys(categoryMap).forEach((cat) => {
        const spent = categoryMap[cat];
        const limit = budgetMap[cat] || 0;
        const percentage = limit > 0 ? parseFloat(((spent / limit) * 100).toFixed(1)) : 0;
        breakdown.push({
          category: cat,
          spent,
          limit,
          percentage,
        });
      });

      // Include budget items with no transactions yet
      budgets.forEach((b) => {
        const exists = breakdown.some((item) => item.category === b.category);
        if (!exists) {
          breakdown.push({
            category: b.category,
            spent: 0,
            limit: b.limit,
            percentage: 0,
          });
        }
      });

      // Sort by spent descending
      breakdown.sort((a, b) => b.spent - a.spent);

      return res.status(200).json({
        success: true,
        month,
        year,
        summary: {
          totalSpent,
          avgSpent: parseFloat(avgSpent.toFixed(2)),
          count,
          breakdown,
        },
      });
    }

    // Standard MongoDB path
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const matchUserAndDate = {
      user: new mongoose.Types.ObjectId(req.user.id),
      date: { $gte: startDate, $lte: endDate },
    };

    const overallStats = await Expense.aggregate([
      { $match: matchUserAndDate },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          avgSpent: { $avg: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalSpent = overallStats[0] ? overallStats[0].totalSpent : 0;
    const avgSpent = overallStats[0] ? overallStats[0].avgSpent : 0;
    const count = overallStats[0] ? overallStats[0].count : 0;

    const categoryStats = await Expense.aggregate([
      { $match: matchUserAndDate },
      {
        $group: {
          _id: '$category',
          spent: { $sum: '$amount' },
        },
      },
      { $sort: { spent: -1 } },
    ]);

    const budgets = await Budget.find({
      user: req.user.id,
      month,
      year,
    });

    const budgetMap = {};
    budgets.forEach((b) => {
      budgetMap[b.category] = b.limit;
    });

    const breakdown = categoryStats.map((stat) => {
      const category = stat._id;
      const spent = stat.spent;
      const limit = budgetMap[category] || 0;
      const percentage = limit > 0 ? parseFloat(((spent / limit) * 100).toFixed(1)) : 0;

      return {
        category,
        spent,
        limit,
        percentage,
      };
    });

    budgets.forEach((b) => {
      const exists = breakdown.some((item) => item.category === b.category);
      if (!exists) {
        breakdown.push({
          category: b.category,
          spent: 0,
          limit: b.limit,
          percentage: 0,
        });
      }
    });

    res.status(200).json({
      success: true,
      month,
      year,
      summary: {
        totalSpent,
        avgSpent: parseFloat(avgSpent.toFixed(2)),
        count,
        breakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly spending trend for the last 6 months
// @route   GET /api/analytics/trend
// @access  Private
exports.getMonthlyTrend = async (req, res, next) => {
  try {
    // Dynamic Fallback check
    if (mongoose.connection.readyState !== 1) {
      const trend = [];
      const today = new Date();
      const allExpenses = await mockDb.expenses.find(req.user.id);
      // Retrieve budgets across all months for the user
      const allBudgets = mockDb.store.budgets.filter((b) => b.user === req.user.id);

      for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const m = targetDate.getMonth() + 1;
        const y = targetDate.getFullYear();

        // Calculate expenses sum
        const monthlyExpenses = allExpenses.filter((e) => {
          const d = new Date(e.date);
          return d.getMonth() + 1 === m && d.getFullYear() === y;
        });
        const spent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

        // Calculate budget limits sum
        const monthlyBudgets = allBudgets.filter((b) => b.month === m && b.year === y);
        const budget = monthlyBudgets.reduce((sum, b) => sum + b.limit, 0);

        const monthName = targetDate.toLocaleString('default', { month: 'short' });
        trend.push({
          month: `${monthName} ${y.toString().slice(-2)}`,
          spent,
          budget,
        });
      }

      return res.status(200).json({
        success: true,
        trend,
      });
    }

    // Standard MongoDB path
    const trend = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const m = targetDate.getMonth() + 1;
      const y = targetDate.getFullYear();

      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59, 999);

      const expenseAgg = await Expense.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(req.user.id),
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      const budgetAgg = await Budget.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(req.user.id),
            month: m,
            year: y,
          },
        },
        {
          $group: {
            _id: null,
            totalLimit: { $sum: '$limit' },
          },
        },
      ]);

      const monthName = targetDate.toLocaleString('default', { month: 'short' });
      trend.push({
        month: `${monthName} ${y.toString().slice(-2)}`,
        spent: expenseAgg[0] ? expenseAgg[0].total : 0,
        budget: budgetAgg[0] ? budgetAgg[0].totalLimit : 0,
      });
    }

    res.status(200).json({
      success: true,
      trend,
    });
  } catch (error) {
    next(error);
  }
};
