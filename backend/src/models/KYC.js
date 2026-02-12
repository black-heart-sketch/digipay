const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
    index: true,
  },
  documentType: {
    type: String,
    enum: ['id_card', 'localization_plan', 'tax_registration'],
    required: true,
  },
  isRequired: {
    type: Boolean,
    default: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: String,
  fileSize: Number,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewerNotes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('KYC', kycSchema);
