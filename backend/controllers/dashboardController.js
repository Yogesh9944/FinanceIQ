const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Investment = require('../models/Investment');
const NetWorth = require('../models/NetWorth');


const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    // Current month transactions
    const transactions = await Transaction.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    const monthlyIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((a, t) => a + t.amount, 0);

    const monthlyExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((a, t) => a + t.amount, 0);

    const savings = monthlyIncome - monthlyExpense;
    const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

    // Investments
    const investments = await Investment.find({ userId: req.user._id });
    const totalInvested = investments.reduce((a, i) => a + i.investedAmount, 0);
    const totalCurrentValue = investments.reduce((a, i) => a + i.currentValue, 0);

    // Net worth
    const latestNetWorth = await NetWorth.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    // Recent transactions
    const recentTransactions = await Transaction.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    // Budget alerts
    const budgets = await Budget.find({ userId: req.user._id, month, year });
    const alerts = [];
    for (const budget of budgets) {
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.category === budget.category)
        .reduce((a, t) => a + t.amount, 0);
      const pct = (spent / budget.limit) * 100;
      if (pct >= 100) {
        alerts.push({ type: 'danger', message: `Budget exceeded for ${budget.category} (${Math.round(pct)}% used)` });
      } else if (pct >= 80) {
        alerts.push({ type: 'warning', message: `${budget.category} budget at ${Math.round(pct)}% — running low!` });
      }
    }
    if (savingsRate < 10) {
      alerts.push({ type: 'warning', message: 'Low savings rate this month. Try cutting discretionary spending.' });
    }

    res.json({
      monthlyIncome,
      monthlyExpense,
      savings,
      savingsRate: savingsRate.toFixed(1),
      totalInvested,
      totalCurrentValue,
      investmentPnL: totalCurrentValue - totalInvested,
      netWorth: latestNetWorth,
      recentTransactions,
      alerts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Financial Health Score
// @route GET /api/financial-score
const getFinancialScore = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    });

    const income = transactions.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const expense = transactions.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    const savings = income - expense;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    const investments = await Investment.find({ userId: req.user._id });
    const totalInvested = investments.reduce((a, i) => a + i.investedAmount, 0);
    const investmentRatio = income > 0 ? (totalInvested / (income * 12)) * 100 : 0;

    const netWorth = await NetWorth.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    const totalDebt = netWorth ? netWorth.loans + netWorth.creditCardDues + netWorth.otherLiabilities : 0;
    const totalAssets = netWorth ? netWorth.cashInHand + netWorth.bankBalance + totalInvested : 0;
    const debtRatio = totalAssets > 0 ? (totalDebt / totalAssets) * 100 : 0;

    const expenseControlRatio = income > 0 ? ((income - expense) / income) * 100 : 0;

    // Score calculation (out of 100)
    let savingsScore = Math.min(30, (savingsRate / 30) * 30);  // 30% savings = full score
    let expenseScore = Math.min(25, expenseControlRatio > 0 ? 25 : 0); // basic control
    let debtScore = Math.min(20, debtRatio < 30 ? 20 : debtRatio < 60 ? 10 : 0);
    let investmentScore = Math.min(25, (Math.min(investmentRatio, 25) / 25) * 25);

    const totalScore = Math.round(savingsScore + expenseScore + debtScore + investmentScore);

    const feedback = [];
    if (savingsRate >= 20) feedback.push({ type: 'good', msg: 'Great savings habit! You\'re saving over 20% of income 👍' });
    else if (savingsRate >= 10) feedback.push({ type: 'ok', msg: 'Decent savings rate. Aim for 20%+ for financial freedom ✨' });
    else feedback.push({ type: 'bad', msg: 'Low savings this month. Reduce discretionary spending ⚠️' });

    if (debtRatio > 50) feedback.push({ type: 'bad', msg: 'High debt-to-asset ratio. Focus on debt repayment 🚨' });
    else if (debtRatio > 30) feedback.push({ type: 'ok', msg: 'Moderate debt levels. Keep paying it down 💪' });
    else feedback.push({ type: 'good', msg: 'Healthy debt ratio — well done! 🎉' });

    if (investmentRatio >= 20) feedback.push({ type: 'good', msg: 'Excellent investment discipline! Your money is working for you 📈' });
    else if (investmentRatio >= 10) feedback.push({ type: 'ok', msg: 'Good start on investing. Consider increasing SIP contributions 💡' });
    else feedback.push({ type: 'bad', msg: 'Start investing! Even ₹500/month compounds significantly over time ⚡' });

    // Top spending category
    const categoryBreakdown = {};
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });
    const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      feedback.push({ type: 'info', msg: `Your biggest expense is ${topCategory[0]} (₹${topCategory[1].toLocaleString()}) 📊` });
    }

    res.json({
      score: totalScore,
      breakdown: {
        savingsScore: Math.round(savingsScore),
        expenseScore: Math.round(expenseScore),
        debtScore: Math.round(debtScore),
        investmentScore: Math.round(investmentScore),
      },
      metrics: {
        savingsRate: savingsRate.toFixed(1),
        debtRatio: debtRatio.toFixed(1),
        investmentRatio: investmentRatio.toFixed(1),
        expenseControlRatio: expenseControlRatio.toFixed(1),
      },
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getInsights = async (req, res) => {
  try {
    const now = new Date();
    const currMonth = now.getMonth() + 1;
    const currYear = now.getFullYear();
    const prevMonth = currMonth === 1 ? 12 : currMonth - 1;
    const prevYear = currMonth === 1 ? currYear - 1 : currYear;

    const getMonthTransactions = async (m, y) => {
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59);
      return Transaction.find({ userId: req.user._id, date: { $gte: start, $lte: end } });
    };

    const curr = await getMonthTransactions(currMonth, currYear);
    const prev = await getMonthTransactions(prevMonth, prevYear);

    const currExpense = curr.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    const prevExpense = prev.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    const currIncome = curr.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const prevIncome = prev.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);

    const insights = [];

    if (prevExpense > 0) {
      const expenseChange = ((currExpense - prevExpense) / prevExpense) * 100;
      if (expenseChange > 15) {
        insights.push({ icon: '📈', type: 'warning', text: `Spending increased by ${expenseChange.toFixed(0)}% vs last month` });
      } else if (expenseChange < -10) {
        insights.push({ icon: '📉', type: 'good', text: `Great! Spending down ${Math.abs(expenseChange).toFixed(0)}% vs last month` });
      }
    }

    const currSavings = currIncome - currExpense;
    const prevSavings = prevIncome - prevExpense;
    if (prevSavings > 0 && currSavings < prevSavings) {
      const drop = ((prevSavings - currSavings) / prevSavings) * 100;
      if (drop > 15) {
        insights.push({ icon: '⚠️', type: 'warning', text: `Savings dropped by ${drop.toFixed(0)}% compared to last month` });
      }
    }

    // Category spike detection
    const currCat = {};
    const prevCat = {};
    curr.filter((t) => t.type === 'expense').forEach((t) => {
      currCat[t.category] = (currCat[t.category] || 0) + t.amount;
    });
    prev.filter((t) => t.type === 'expense').forEach((t) => {
      prevCat[t.category] = (prevCat[t.category] || 0) + t.amount;
    });

    for (const [cat, amt] of Object.entries(currCat)) {
      if (prevCat[cat] && amt > prevCat[cat] * 1.5) {
        insights.push({ icon: '🔥', type: 'warning', text: `${cat} spending spiked ${Math.round(((amt - prevCat[cat]) / prevCat[cat]) * 100)}% this month` });
      }
    }

    if (insights.length === 0) {
      insights.push({ icon: '✅', type: 'good', text: 'Your finances look stable this month. Keep it up!' });
    }

    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateNetWorth = async (req, res) => {
  try {
    const netWorth = await NetWorth.create({ userId: req.user._id, ...req.body });
    res.status(201).json(netWorth);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getNetWorthHistory = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id });
    const totalInvested = investments.reduce((a, i) => a + i.currentValue, 0);
    const history = await NetWorth.find({ userId: req.user._id }).sort({ createdAt: 1 }).limit(12);
    const enriched = history.map((nw) => ({
      ...nw.toObject(),
      investmentValue: totalInvested,
      netWorthValue: nw.cashInHand + nw.bankBalance + totalInvested - nw.loans - nw.creditCardDues - nw.otherLiabilities,
    }));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard, getFinancialScore, getInsights, updateNetWorth, getNetWorthHistory };
