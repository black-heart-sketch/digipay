const settlementService = require('../services/settlementService');

/**
 * Request settlement
 * POST /api/settlements/request
 */
const requestSettlement = async (req, res) => {
  try {
    const { amount, recipientPhone } = req.body;

    const result = await settlementService.requestSettlement(req.merchant._id, amount, recipientPhone);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get settlement history
 * GET /api/settlements
 */
const getSettlements = async (req, res) => {
  try {
    const { status, page, limit } = req.query;

    const result = await settlementService.getSettlements(req.merchant._id, {
      status,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get merchant balance
 * GET /api/settlements/balance
 */
const getBalance = async (req, res) => {
  try {
    const Merchant = require('../models/Merchant');
    const merchant = await Merchant.findById(req.merchant._id);

    res.status(200).json({
      success: true,
      data: {
        balance: merchant.balance,
        totalRevenue: merchant.totalRevenue,
        totalCommissionPaid: merchant.totalCommissionPaid,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  requestSettlement,
  getSettlements,
  getBalance,
};
