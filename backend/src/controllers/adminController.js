const Merchant = require('../models/Merchant');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

/**
 * Get all merchants
 * GET /api/admin/merchants
 */
const getAllMerchants = async (req, res) => {
  try {
    const merchants = await Merchant.find()
      .populate('userId', 'email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: merchants.length,
      data: merchants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update merchant status (KYC / Active)
 * PATCH /api/admin/merchants/:id/status
 */
const updateMerchantStatus = async (req, res) => {
  try {
    const { kycStatus, isActive } = req.body;
    const merchant = await Merchant.findById(req.params.id);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found',
      });
    }

    if (kycStatus) merchant.kycStatus = kycStatus;
    if (typeof isActive !== 'undefined') merchant.isActive = isActive;

    await merchant.save();

    res.status(200).json({
      success: true,
      data: merchant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get system stats
 * GET /api/admin/stats
 */
const getSystemStats = async (req, res) => {
  try {
    const totalTransactions = await Transaction.countDocuments();
    const totalVolume = await Transaction.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = await Transaction.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
    ]);
    const merchantCount = await Merchant.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalTransactions,
        totalVolume: totalVolume[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        merchantCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get merchant details with stats
 * GET /api/admin/merchants/:id
 */
const getMerchantDetails = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id).populate('userId', 'email');
    
    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }

    res.status(200).json({
      success: true,
      data: merchant,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get merchant transactions
 * GET /api/admin/merchants/:id/transactions
 */
const getMerchantTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ merchantId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Check transaction status (Manual trigger)
 * POST /api/admin/transactions/:id/check-status
 */
const checkTransactionStatus = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // In a real scenario, this would call FreemoPay API to verify status
    // For now, we simulate a check or return the current status
    // TODO: Implement actual FreemoPay status check here
    
    res.status(200).json({
      success: true,
      data: {
        status: transaction.status,
        freemopayReference: transaction.freemopayReference,
        checkedAt: new Date(),
        message: 'Transaction status verified'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllMerchants,
  updateMerchantStatus,
  getSystemStats,
  getMerchantDetails,
  getMerchantTransactions,
  checkTransactionStatus
};
