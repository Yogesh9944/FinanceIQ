const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['Stocks', 'Mutual Funds', 'Crypto', 'Gold', 'Real Estate', 'FD', 'PPF', 'Other'],
    required: true,
  },
  investedAmount: {
    type: Number,
    required: true,
  },
  currentValue: {
    type: Number,
    required: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  units: {
    type: Number,
    default: 0,
  },
  symbol: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);
