const mongoose = require('mongoose');

const netWorthSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Assets
  cashInHand: { type: Number, default: 0 },
  bankBalance: { type: Number, default: 0 },
  // Liabilities
  loans: { type: Number, default: 0 },
  creditCardDues: { type: Number, default: 0 },
  otherLiabilities: { type: Number, default: 0 },
  // Snapshot date for history
  snapshotDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('NetWorth', netWorthSchema);
