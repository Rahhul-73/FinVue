const Expense = require('../models/Expense');
const mongoose = require('mongoose');
const mockDb = require('../config/mockDb');

// @desc    Get all expenses for current user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res, next) => {
  try {
    // Dynamic Fallback check
    if (mongoose.connection.readyState !== 1) {
      const expenses = await mockDb.expenses.find(req.user.id, {
        category: req.query.category,
        search: req.query.search,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        sortBy: req.query.sortBy,
      });

      const total = expenses.length;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;
      const skip = (page - 1) * limit;
      const paginated = expenses.slice(skip, skip + limit);

      return res.status(200).json({
        success: true,
        count: paginated.length,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        expenses: paginated,
      });
    }

    // Standard MongoDB path
    const query = { user: req.user.id };

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (req.query.search) {
      query.description = { $regex: req.query.search, $options: 'i' };
    }

    let sortOptions = { date: -1 };
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sortOptions[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = async (req, res, next) => {
  try {
    // Dynamic Fallback check
    if (mongoose.connection.readyState !== 1) {
      const expense = await mockDb.expenses.findById(req.params.id);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found.',
        });
      }
      if (expense.user !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this expense.',
        });
      }
      return res.status(200).json({
        success: true,
        expense,
      });
    }

    // Standard MongoDB path
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found.',
      });
    }

    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this expense.',
      });
    }

    res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create an expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res, next) => {
  try {
    const { amount, category, description, date } = req.body;

    // Dynamic Fallback check
    if (mongoose.connection.readyState !== 1) {
      const expense = await mockDb.expenses.create(req.user.id, {
        amount,
        category,
        description,
        date,
      });
      return res.status(201).json({
        success: true,
        expense,
      });
    }

    // Standard MongoDB path
    const expense = await Expense.create({
      user: req.user.id,
      amount,
      category,
      description,
      date: date || undefined,
    });

    res.status(201).json({
      success: true,
      expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res, next) => {
  try {
    const { amount, category, description, date } = req.body;

    // Dynamic Fallback check
    if (mongoose.connection.readyState !== 1) {
      const expense = await mockDb.expenses.findById(req.params.id);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found.',
        });
      }
      if (expense.user !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this expense.',
        });
      }
      const updated = await mockDb.expenses.findByIdAndUpdate(req.params.id, {
        amount,
        category,
        description,
        date,
      });
      return res.status(200).json({
        success: true,
        expense: updated,
      });
    }

    // Standard MongoDB path
    let expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found.',
      });
    }

    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this expense.',
      });
    }

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { amount, category, description, date: date || expense.date },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res, next) => {
  try {
    // Dynamic Fallback check
    if (mongoose.connection.readyState !== 1) {
      const expense = await mockDb.expenses.findById(req.params.id);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found.',
        });
      }
      if (expense.user !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this expense.',
        });
      }
      await mockDb.expenses.deleteOne(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Expense deleted successfully.',
      });
    }

    // Standard MongoDB path
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found.',
      });
    }

    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this expense.',
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
