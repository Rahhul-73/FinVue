const express = require('express');
const router = express.Router();
const { getBudgets, setBudget, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');
const { budgetValidation } = require('../middleware/validator');

// Protect all routes below this line
router.use(protect);

router.route('/')
  .get(getBudgets)
  .post(budgetValidation, setBudget);

router.route('/:id')
  .delete(deleteBudget);

module.exports = router;
