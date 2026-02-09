const mongoose = require('mongoose');

const commissionTierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['standard', 'premium', 'enterprise'],
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  minTransactionVolume: {
    type: Number,
    default: 0,
  },
  features: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('CommissionTier', commissionTierSchema);
