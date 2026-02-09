const paymentService = require('../services/paymentService');

/**
 * FreemoPay webhook endpoint
 * POST /api/webhooks/freemopay
 */
const freemopayWebhook = async (req, res) => {
  try {
    console.log('📥 FreemoPay webhook received:', req.body);

    const result = await paymentService.processFreemopayWebhook(req.body);

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('❌ Webhook processing error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  freemopayWebhook,
};
