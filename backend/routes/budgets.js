// routes/budgets.js
const express = require('express');
const router = express.Router();
const { setBudget, getBudgets, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
router.post('/', setBudget);
router.get('/', getBudgets);
router.delete('/:id', deleteBudget);
module.exports = router;
