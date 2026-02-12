const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
    index: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  freemopayReference: {
    type: String,
    index: true,
  },
  freemopayExternalId: {
    type: String,
    index: true,
  },
  baseAmount: {
    type: Number,
    required: true,
  },
  commissionAmount: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'XAF',
  },
  commissionRate: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending',
    index: true,
  },
  paymentMethod: String,
  customerPhone: String,
  customerEmail: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  webhookUrl: {
    type: String,
    required: false,
  },
  webhookSent: {
    type: Boolean,
    default: false,
  },
  webhookAttempts: {
    type: Number,
    default: 0,
  },
  freemopayWebhookReceived: {
    type: Boolean,
    default: false,
  },
  settledToMerchant: {
    type: Boolean,
    default: false,
  },
  settlementDate: Date,
}, {
  timestamps: true,
});

// Method to mark transaction as successful
transactionSchema.methods.markSuccess = async function(freemopayRef) {
  this.status = 'success';
  this.freemopayReference = freemopayRef || this.freemopayReference;
  this.freemopayWebhookReceived = true;
  
  // Calculate net amount after commission deduction
  // Commission is always deducted from merchant balance for cash-in transactions
  // Balance = baseAmount - commissionAmount (amount merchant receives after commission)
  // Total Revenue = totalAmount (full transaction amount from customer)
  const netAmount = this.baseAmount - this.commissionAmount;
  
  // Update merchant balance and revenue
  const Merchant = require('./Merchant');
  await Merchant.findByIdAndUpdate(this.merchantId, {
    $inc: {
      balance: netAmount, // Amount after commission is deducted
      totalRevenue: this.totalAmount, // Full transaction amount from customer
      totalCommissionPaid: this.commissionAmount,
    },
  });
  
  await this.save();
};

// Method to mark transaction as failed
transactionSchema.methods.markFailed = async function(reason) {
  this.status = 'failed';
  this.metadata = { ...this.metadata, failureReason: reason };
  await this.save();
};

module.exports = mongoose.model('Transaction', transactionSchema);
