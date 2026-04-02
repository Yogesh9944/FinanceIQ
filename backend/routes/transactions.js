const express = require('express');
const router = express.Router();
const {
  addTransaction, getTransactions, deleteTransaction,
  updateTransaction, getMonthlyBreakdown, getCategoryBreakdown,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', addTransaction);
router.get('/', getTransactions);
router.get('/monthly-breakdown', getMonthlyBreakdown);
router.get('/category-breakdown', getCategoryBreakdown);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
