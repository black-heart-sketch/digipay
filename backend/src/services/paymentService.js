const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Merchant = require('../models/Merchant');
const { v4: uuidv4 } = require('uuid');
const freemopayService = require('./freemopay/freemopayService');
const commissionCalculator = require('./commissionCalculator');
const webhookService = require('./webhookService');

/**
 * Initiate a payment transaction
 * @param {Object} paymentData - Payment details
 * @returns {Object} Transaction details
 */
const initiatePayment = async (paymentData) => {
  try {
    const { merchantId, amount, customerPhone, customerEmail, metadata, webhookUrl } = paymentData;

    // Validate merchant
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new Error('Merchant not found');
    }

    if (!merchant.isActive) {
      throw new Error('Merchant account is inactive');
    }

    if (merchant.kycStatus !== 'approved') {
      throw new Error('Merchant KYC not approved');
    }

    // Calculate commission
    const commission = await commissionCalculator.calculateCommission(amount, merchantId);

    // Generate unique transaction ID
    const transactionId = `TXN_${uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase()}`;

    // Initiate FreemoPay payment with base amount only
    // Always use system callback URL for FreemoPay to notify DigiPay
    const callbackUrl = `${process.env.WEBHOOK_CALLBACK_URL || 'http://localhost:5000/api/webhooks/freemopay'}`;
    const description = `DigiPay Payment - ${merchant.businessName}`;

    const freemopayResponse = await freemopayService.initiatePayment(
      customerPhone,
      commission.baseAmount,
      description,
      callbackUrl
    );

    // Create transaction record
    const transaction = new Transaction({
      merchantId,
      transactionId,
      freemopayReference: freemopayResponse.reference,
      freemopayExternalId: freemopayResponse.externalId,
      baseAmount: commission.baseAmount,
      commissionAmount: commission.commissionAmount,
      totalAmount: commission.totalAmount,
      commissionRate: commission.commissionRate,
      currency: commission.currency,
      status: 'pending',
      customerPhone,
      customerEmail,
      metadata,
      webhookUrl, // Store client's webhook URL for later notification
    });

    await transaction.save();

    return {
      transactionId: transaction.transactionId,
      amount: transaction.totalAmount,
      baseAmount: transaction.baseAmount,
      commissionAmount: transaction.commissionAmount,
      status: transaction.status,
      freemopayReference: freemopayResponse.reference,
      message: freemopayResponse.message,
    };

  } catch (error) {
    console.error('❌ Error initiating payment:', error.message);
    throw error;
  }
};

/**
 * Get transaction by ID
 * @param {String} transactionId - Transaction ID
 * @param {String} merchantId - Merchant ID (for authorization)
 * @returns {Object} Transaction details
 */
const getTransaction = async (transactionId, merchantId) => {
  try {
    const transaction = await Transaction.findOne({ transactionId, merchantId });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // If transaction is pending, verify status with FreemoPay
    if (transaction.status === 'pending' && transaction.freemopayReference) {
      try {
        console.log(`🔄 Verifying pending transaction ${transactionId} with FreemoPay...`);
        const statusResponse = await freemopayService.checkPaymentStatus(transaction.freemopayReference);
        
        // Map FreemoPay status to our status
        // Note: adjust status strings based on actual FreemoPay API documentation or observation
        const externalStatus = statusResponse.status; // e.g. 'SUCCESS', 'FAILED', 'PENDING'

        if (externalStatus === 'SUCCESS') {
          console.log(`✅ Transaction ${transactionId} confirmed SUCCESS by provider`);
          await transaction.markSuccess(transaction.freemopayReference);
        } else if (externalStatus === 'FAILED') {
          console.log(`❌ Transaction ${transactionId} confirmed FAILED by provider`);
          await transaction.markFailed(statusResponse.message || 'Payment failed at provider');
        }
      } catch (err) {
        console.error(`⚠️ Failed to verify transaction status: ${err.message}`);
        // Don't block return, just log error and return current state
      }
    }

    return transaction;

  } catch (error) {
    console.error('❌ Error getting transaction:', error.message);
    throw error;
  }
};

/**
 * List transactions for a merchant
 * @param {String} merchantId - Merchant ID
 * @param {Object} filters - Query filters
 * @returns {Array} List of transactions
 */
const listTransactions = async (merchantId, filters = {}) => {
  try {
    const { status, page = 1, limit = 20, search } = filters;

    const query = { merchantId };
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { freemopayReference: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const docs = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    return {
      docs,
      totalDocs: total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };

  } catch (error) {
    console.error('❌ Error listing transactions:', error.message);
    throw error;
  }
};

/**
 * Process FreemoPay webhook
 * @param {Object} webhookData - Webhook payload from FreemoPay
 * @returns {Object} Updated transaction
 */
const processFreemopayWebhook = async (webhookData) => {
  try {
    const { status, reference, externalId, message } = webhookData;

    // Find transaction by reference or external ID
    const transaction = await Transaction.findOne({
      $or: [
        { freemopayReference: reference },
        { freemopayExternalId: externalId },
      ],
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status === 'success') {
      console.log('⚠️ Transaction already processed:', reference);
      return transaction;
    }

    // Update transaction based on status
    if (status === 'SUCCESS') {
      await transaction.markSuccess(reference);
      
      // Send webhook to merchant
      await webhookService.sendWebhook(transaction.merchantId, 'payment.success', {
        transactionId: transaction.transactionId,
        amount: transaction.totalAmount,
        baseAmount: transaction.baseAmount,
        commissionAmount: transaction.commissionAmount,
        status: 'success',
        customerPhone: transaction.customerPhone,
        metadata: transaction.metadata,
      }, transaction.webhookUrl);

      console.log('✅ Payment completed successfully:', transaction.transactionId);
    } else if (status === 'FAILED') {
      await transaction.markFailed(message);
      
      // Send webhook to merchant
      await webhookService.sendWebhook(transaction.merchantId, 'payment.failed', {
        transactionId: transaction.transactionId,
        amount: transaction.totalAmount,
        status: 'failed',
        reason: message,
      }, transaction.webhookUrl);

      console.log('❌ Payment failed:', transaction.transactionId, message);
    }

    return transaction;

  } catch (error) {
    console.error('❌ Error processing webhook:', error.message);
    throw error;
  }
};

/**
 * Get analytics for dashboard
 * @param {String} merchantId - Merchant ID
 * @returns {Object} Analytics data
 */
const getAnalytics = async (merchantId) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // 1. Daily Volume (Last 7 days)
    const dailyVolume = await Transaction.aggregate([
      {
        $match: {
          merchantId: new mongoose.Types.ObjectId(merchantId), // Ensure ObjectId
          createdAt: { $gte: sevenDaysAgo },
          status: 'success' // Only count successful transactions for revenue/volume
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          volume: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing days
    const chartData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - 6 + i); // Start from 6 days ago up to today
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const found = dailyVolume.find(item => item._id === dateStr);
      chartData.push({
        name: dayName,
        date: dateStr,
        volume: found ? found.volume : 0,
        count: found ? found.count : 0
      });
    }

    // 2. Transaction Status Distribution
    const statusDistribution = await Transaction.aggregate([
      {
        $match: {
          merchantId: new mongoose.Types.ObjectId(merchantId)
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Format for Recharts PieChart
    const pieData = statusDistribution.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
      status: item._id
    }));

    return {
      dailyVolume: chartData,
      statusDistribution: pieData
    };

  } catch (error) {
    console.error('❌ Error getting analytics:', error.message);
    throw error;
  }
};

module.exports = {
  initiatePayment,
  getTransaction,
  listTransactions,
  processFreemopayWebhook,
  getAnalytics,
};
