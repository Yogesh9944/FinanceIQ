const Transaction = require('../models/Transaction');


const addTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, note, isRecurring, recurringFrequency } = req.body;
    const transaction = await Transaction.create({
      userId: req.user._id,
      title, amount, type, category,
      date: date || Date.now(),
      note, isRecurring, recurringFrequency,
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getTransactions = async (req, res) => {
  try {
    const { type, category, month, year, limit = 50 } = req.query;
    const filter = { userId: req.user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit));
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    await transaction.deleteOne();
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getMonthlyBreakdown = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getCategoryBreakdown = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = parseInt(month) || now.getMonth() + 1;
    const y = parseInt(year) || now.getFullYear();
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addTransaction, getTransactions, deleteTransaction,
  updateTransaction, getMonthlyBreakdown, getCategoryBreakdown,
};
