const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
    index: true,
  },
  url: {
    type: String,
    required: true,
  },
  events: [{
    type: String,
    enum: ['payment.success', 'payment.failed', 'refund.processed', 'settlement.completed'],
  }],
  secret: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const webhookLogSchema = new mongoose.Schema({
  webhookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Webhook',
    required: true,
  },
  event: String,
  payload: mongoose.Schema.Types.Mixed,
  response: mongoose.Schema.Types.Mixed,
  statusCode: Number,
  success: Boolean,
  attempts: {
    type: Number,
    default: 1,
  },
  nextRetryAt: Date,
}, {
  timestamps: true,
});

const Webhook = mongoose.model('Webhook', webhookSchema);
const WebhookLog = mongoose.model('WebhookLog', webhookLogSchema);

module.exports = { Webhook, WebhookLog };
