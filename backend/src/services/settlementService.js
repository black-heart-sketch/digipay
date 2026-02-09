const Settlement = require('../models/Settlement');
const Transaction = require('../models/Transaction');
const Merchant = require('../models/Merchant');
const freemopayService = require('./freemopay/freemopayService');
const { v4: uuidv4 } = require('uuid');

/**
 * Request settlement/payout
 * @param {String} merchantId - Merchant ID
 * @param {Number} amount - Amount to settle
 * @param {String} [recipientPhone] - Optional recipient phone number
 * @returns {Object} Settlement details
 */
const requestSettlement = async (merchantId, amount, recipientPhone) => {
  try {
    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      throw new Error('Merchant not found');
    }

    // Check if merchant has enough balance
    if (merchant.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Check minimum settlement amount
    const minAmount = merchant.settlementDetails?.minimumSettlementAmount || 10000;
    if (amount < minAmount) {
      throw new Error(`Minimum settlement amount is ${minAmount} XAF`);
    }

    // Determine recipient phone
    const phoneToUse = recipientPhone || merchant.settlementDetails?.mobileMoneyNumber;

    // Validate settlement details
    if (!phoneToUse) {
      throw new Error('Recipient phone number is required');
    }

    // Generate settlement ID
    const settlementId = `STL_${uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase()}`;

    // Get unsettled transactions
    const transactions = await Transaction.find({
      merchantId,
      status: 'success',
      settledToMerchant: false,
    }).limit(100); // Limit for performance

    // Create settlement record
    const settlement = new Settlement({
      merchantId,
      settlementId,
      amount,
      status: 'pending',
      transactions: transactions.slice(0, Math.ceil(amount / (transactions[0]?.baseAmount || 1))).map(t => t._id),
      recipientPhone: phoneToUse,
    });

    await settlement.save();

    // Process settlement (async)
    processSettlement(settlement._id).catch(error => {
      console.error('❌ Error processing settlement:', error.message);
    });

    return {
      settlementId: settlement.settlementId,
      amount: settlement.amount,
      status: settlement.status,
      recipientPhone: settlement.recipientPhone,
    };

  } catch (error) {
    console.error('❌ Error requesting settlement:', error.message);
    throw error;
  }
};

/**
 * Process settlement using FreemoPay withdrawal
 * @param {String} settlementId - Settlement MongoDB ID
 */
const processSettlement = async (settlementId) => {
  try {
    const settlement = await Settlement.findById(settlementId);

    if (!settlement) {
      throw new Error('Settlement not found');
    }

    settlement.status = 'processing';
    await settlement.save();

    // Initiate FreemoPay withdrawal
    const externalId = freemopayService.generateExternalId('settlement');
    const callbackUrl = `${process.env.WEBHOOK_CALLBACK_URL || 'http://localhost:5000/api/webhooks/freemopay'}/settlement`;

    const withdrawalResponse = await freemopayService.initiateWithdraw(
      settlement.recipientPhone,
      settlement.amount,
      externalId,
      callbackUrl
    );

    settlement.freemopayWithdrawReference = withdrawalResponse.reference;
    await settlement.save();

    // In test mode, complete immediately
    if (process.env.PAYMENT_TEST_MODE === 'true') {
      await completeSettlement(settlement._id);
    }

    console.log('✅ Settlement initiated:', settlement.settlementId);

  } catch (error) {
    console.error('❌ Error processing settlement:', error.message);
    
    const settlement = await Settlement.findById(settlementId);
    if (settlement) {
      settlement.status = 'failed';
      settlement.failureReason = error.message;
      await settlement.save();
    }
  }
};

/**
 * Complete settlement
 * @param {String} settlementId - Settlement MongoDB ID
 */
const completeSettlement = async (settlementId) => {
  try {
    const settlement = await Settlement.findById(settlementId);

    if (!settlement) {
      throw new Error('Settlement not found');
    }

    settlement.status = 'completed';
    settlement.completedAt = new Date();
    await settlement.save();

    // Update merchant balance
    await Merchant.findByIdAndUpdate(settlement.merchantId, {
      $inc: { balance: -settlement.amount },
    });

    // Mark transactions as settled
    await Transaction.updateMany(
      { _id: { $in: settlement.transactions } },
      { 
        $set: { 
          settledToMerchant: true,
          settlementDate: new Date(),
        },
      }
    );

    console.log('✅ Settlement completed:', settlement.settlementId);

  } catch (error) {
    console.error('❌ Error completing settlement:', error.message);
    throw error;
  }
};

/**
 * Get settlement history
 * @param {String} merchantId - Merchant ID
 * @param {Object} filters - Query filters
 * @returns {Array} Settlements
 */
const getSettlements = async (merchantId, filters = {}) => {
  try {
    const { status, page = 1, limit = 20 } = filters;

    const query = { merchantId };
    if (status) {
      query.status = status;
    }

    const settlements = await Settlement.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Settlement.countDocuments(query);

    return {
      settlements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };

  } catch (error) {
    console.error('❌ Error getting settlements:', error.message);
    throw error;
  }
};

module.exports = {
  requestSettlement,
  processSettlement,
  completeSettlement,
  getSettlements,
};
