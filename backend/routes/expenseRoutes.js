const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const { expenseValidation } = require('../middleware/validator');

// Protect all routes below this line
router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(expenseValidation, createExpense);

router.route('/:id')
  .get(getExpense)
  .put(expenseValidation, updateExpense)
  .delete(deleteExpense);

module.exports = router;
