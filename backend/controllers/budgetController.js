const Budget = require('../models/Budget');
const mongoose = require('mongoose');
const mockDb = require('../config/mockDb');

// @desc    Get user budgets for a given month and year
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    // Dynamic Fallback check
    if (mongoose.connection.readyState !== 1) {
      const budgets = await mockDb.budgets.find(req.user.id, month, year);
      return res.status(200).json({
        success: true,
        month,
        year,
        count: budgets.length,
        budgets,
      });
    }

    // Standard MongoDB path
    const budgets = await Budget.find({
      user: req.user.id,
      month,
      year,
    });

    res.status(200).json({
      success: true,
      month,
      year,
      count: budgets.length,
      budgets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upsert budget (create new or update existing limit)
// @route   POST /api/budgets
// @access  Private
exports.setBudget = async (req, res, next) => {
  const { category, limit, month, year } = req.body;

  try {
    // Dynamic Fallback check
    if (mongoose.connection.readyState !== 1) {
      const budget = await mockDb.budgets.setBudget(req.user.id, {
        category,
        limit,
        month,
        year,
      });
      return res.status(200).json({
        success: true,
        message: 'Budget limit set successfully.',
        budget,
      });
    }

    // Standard MongoDB path
    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user.id,
        category,
        month,
        year,
      },
      { limit },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Budget limit set successfully.',
      budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget limit
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res, next) => {
  try {
    // Dynamic Fallback check
    if (mongoose.connection.readyState !== 1) {
      const budget = await mockDb.budgets.findById(req.params.id);
      if (!budget) {
        return res.status(404).json({
          success: false,
          message: 'Budget limit not found.',
        });
      }
      if (budget.user !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this budget.',
        });
      }
      await mockDb.budgets.deleteOne(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Budget limit removed successfully.',
      });
    }

    // Standard MongoDB path
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget limit not found.',
      });
    }

    if (budget.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this budget.',
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Budget limit removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
