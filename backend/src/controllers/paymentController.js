const paymentService = require('../services/paymentService');

/**
 * Initiate payment
 * POST /api/payments/initiate
 */
const initiatePayment = async (req, res) => {
  try {
    const { amount, customerPhone, customerEmail, metadata } = req.body;

    const result = await paymentService.initiatePayment({
      merchantId: req.merchant._id,
      amount,
      customerPhone,
      customerEmail,
      metadata,
    });

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
 * Initiate payment from dashboard (JWT auth)
 * POST /api/payments/initiate-dashboard
 */
const initiateDashboardPayment = async (req, res) => {
  try {
    const { amount, customerPhone } = req.body;

    const result = await paymentService.initiatePayment({
      merchantId: req.merchant._id,
      amount,
      customerPhone,
      customerEmail: req.user.email, // Use merchant's email
      metadata: { source: 'dashboard_payin' },
    });

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
 * Get transaction
 * GET /api/payments/transactions/:transactionId
 */
const getTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await paymentService.getTransaction(transactionId, req.merchant._id);

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * List transactions
 * GET /api/payments/transactions
 */
const listTransactions = async (req, res) => {
  try {
    const { status, page, limit, search } = req.query;

    const result = await paymentService.listTransactions(req.merchant._id, {
      status,
      page,
      limit,
      search,
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
 * Get analytics
 * GET /api/payments/analytics
 */
const getAnalytics = async (req, res) => {
  try {
    const result = await paymentService.getAnalytics(req.merchant._id);

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

module.exports = {
  initiatePayment,
  initiateDashboardPayment,
  getTransaction,
  listTransactions,
  getAnalytics,
};
