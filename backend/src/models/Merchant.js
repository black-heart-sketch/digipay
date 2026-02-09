const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  businessType: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  website: String,
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'],
    default: 'pending',
  },
  commissionTier: {
    type: String,
    enum: ['standard', 'premium', 'enterprise'],
    default: 'standard',
  },
  customCommissionRate: {
    type: Number,
    min: 0,
    max: 100,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
  totalCommissionPaid: {
    type: Number,
    default: 0,
  },
  settlementDetails: {
    mobileMoneyNumber: String,
    preferredProvider: String,
    autoSettlement: {
      type: Boolean,
      default: false,
    },
    minimumSettlementAmount: {
      type: Number,
      default: 10000, // 10,000 XAF minimum
    },
  },
  feePayer: {
    type: String,
    enum: ['merchant', 'client'],
    default: 'merchant',
  },
}, {
  timestamps: true,
});

// Method to calculate commission rate
merchantSchema.methods.getCommissionRate = async function() {
  if (this.customCommissionRate != null) {
    return this.customCommissionRate;
  }
  
  const CommissionTier = require('./CommissionTier');
  const tier = await CommissionTier.findOne({ name: this.commissionTier, isActive: true });
  
  if (tier) {
    return tier.rate;
  }
  
  // Default fallback
  const defaults = {
    standard: 5.0,
    premium: 3.5,
    enterprise: 2.0,
  };
  
  return defaults[this.commissionTier] || 5.0;
};

module.exports = mongoose.model('Merchant', merchantSchema);
