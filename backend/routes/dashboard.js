const express = require('express');
const router = express.Router();
const {
  getDashboard, getFinancialScore, getInsights,
  updateNetWorth, getNetWorthHistory,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getDashboard);
router.get('/financial-score', getFinancialScore);
router.get('/insights', getInsights);
router.post('/networth', updateNetWorth);
router.get('/networth', getNetWorthHistory);

module.exports = router;
