const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
    index: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
  },
  keyHash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  environment: {
    type: String,
    enum: ['test', 'live'],
    default: 'test',
  },
  permissions: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastUsed: Date,
}, {
  timestamps: true,
});

// Generate API key
apiKeySchema.statics.generateKey = function() {
  const prefix = 'dpk_'; // DigiPay Key
  const randomPart = crypto.randomBytes(24).toString('hex');
  return `${prefix}${randomPart}`;
};

// Hash API key
apiKeySchema.statics.hashKey = function(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
