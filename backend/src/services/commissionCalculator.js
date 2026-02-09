const Merchant = require('../models/Merchant');
const CommissionTier = require('../models/CommissionTier');

/**
 * Calculate commission for a transaction
 * @param {Number} baseAmount - Base transaction amount
 * @param {String} merchantId - Merchant ID
 * @returns {Object} Commission breakdown
 */
const calculateCommission = async (baseAmount, merchantId) => {
  try {
    const merchant = await Merchant.findById(merchantId);
    
    if (!merchant) {
      throw new Error('Merchant not found');
    }

    // Get commission rate
    const commissionRate = await merchant.getCommissionRate();

    // Determine who pays the fee
    const feePayer = merchant.feePayer || 'merchant';

    // Calculate commission amount
    const commissionAmount = Math.round((baseAmount * commissionRate) / 100);

    let totalAmount;
    
    if (feePayer === 'client') {
      // Client pays fee: Total = Base + Commission
      totalAmount = baseAmount + commissionAmount;
    } else {
      // Merchant pays fee: Total = Base (Commission deducted from settlement)
      totalAmount = baseAmount;
    }

    return {
      baseAmount,
      commissionAmount,
      totalAmount,
      commissionRate,
      feePayer,
      currency: 'XAF',
    };

  } catch (error) {
    console.error('❌ Error calculating commission:', error.message);
    throw error;
  }
};

/**
 * Get commission rate for a merchant
 * @param {String} merchantId - Merchant ID
 * @returns {Number} Commission rate percentage
 */
const getCommissionRate = async (merchantId) => {
  try {
    const merchant = await Merchant.findById(merchantId);
    
    if (!merchant) {
      throw new Error('Merchant not found');
    }

    return await merchant.getCommissionRate();

  } catch (error) {
    console.error('❌ Error getting commission rate:', error.message);
    throw error;
  }
};

/**
 * Calculate refund commission
 * For refunds, the commission is also refunded
 * @param {Number} commissionAmount - Original commission amount
 * @returns {Number} Commission refund amount
 */
const calculateRefundCommission = (commissionAmount) => {
  return commissionAmount; // Full commission refunded
};

module.exports = {
  calculateCommission,
  getCommissionRate,
  calculateRefundCommission,
};
