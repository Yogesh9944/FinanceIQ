const Investment = require('../models/Investment');

// @desc  Add investment
// @route POST /api/investments
const addInvestment = async (req, res) => {
  try {
    const investment = await Investment.create({ userId: req.user._id, ...req.body });
    res.status(201).json(investment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get investments
// @route GET /api/investments
const getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const totalInvested = investments.reduce((a, i) => a + i.investedAmount, 0);
    const totalCurrentValue = investments.reduce((a, i) => a + i.currentValue, 0);
    const totalPnL = totalCurrentValue - totalInvested;
    const pnlPercentage = totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : 0;

    res.json({
      investments,
      summary: { totalInvested, totalCurrentValue, totalPnL, pnlPercentage },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update investment (e.g. update current value)
// @route PUT /api/investments/:id
const updateInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    res.json(investment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete investment
// @route DELETE /api/investments/:id
const deleteInvestment = async (req, res) => {
  try {
    await Investment.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Investment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addInvestment, getInvestments, updateInvestment, deleteInvestment };
