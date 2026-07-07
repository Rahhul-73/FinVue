const express = require('express');
const router = express.Router();
const { getSummary, getMonthlyTrend } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// Protect all routes below this line
router.use(protect);

router.get('/summary', getSummary);
router.get('/trend', getMonthlyTrend);

module.exports = router;
