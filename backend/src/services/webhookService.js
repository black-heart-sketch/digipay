const axios = require('axios');
const crypto = require('crypto');
const { Webhook, WebhookLog } = require('../models/Webhook');

/**
 * Generate webhook signature
 * @param {String} payload - JSON payload
 * @param {String} secret - Webhook secret
 * @returns {String} HMAC signature
 */
const generateSignature = (payload, secret) => {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
};

/**
 * Send webhook to merchant
 * @param {String} merchantId - Merchant ID
 * @param {String} event - Event type
 * @param {Object} payload - Event payload
 * @param {String} [destinationUrl] - Optional specific URL for this event (overrides stored config)
 * @returns {Boolean} Success status
 */
const sendWebhook = async (merchantId, event, payload, destinationUrl = null) => {
  try {
    let webhook;
    let targetUrl;
    let secret;

    if (destinationUrl) {
      // Use the provided URL directly
      targetUrl = destinationUrl;
      // For direct URLs, we might not have a secret if it's per-transaction, 
      // but let's try to find a default secret or skip signature if needed.
      // Ideally, we still find the merchant's configured secret.
      const config = await Webhook.findOne({ merchantId });
      secret = config ? config.secret : 'default-secret'; 
      webhook = { _id: null, secret }; // Mock webhook object for logging
    } else {
      // Find active webhook configuration
      webhook = await Webhook.findOne({
        merchantId,
        isActive: true,
        events: event,
      });

      if (!webhook) {
        console.log('ℹ️ No webhook configured for event:', event);
        return false;
      }
      targetUrl = webhook.url;
      secret = webhook.secret;
    }

    // Prepare payload with event
    const webhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    };

    // Generate signature
    const signature = generateSignature(webhookPayload, secret);

    // Send webhook
    try {
      const response = await axios.post(targetUrl, webhookPayload, {
        headers: {
          'Content-Type': 'application/json',
          'X-DigiPay-Signature': signature,
          'X-DigiPay-Event': event,
        },
        timeout: 10000, // 10 seconds timeout
      });

      // Log successful delivery
      await WebhookLog.create({
        webhookId: webhook._id || undefined, // Use undefined if it's an ad-hoc webhook
        event,
        payload: webhookPayload,
        response: response.data,
        statusCode: response.status,
        success: true,
        attempts: 1,
      });

      console.log('✅ Webhook sent successfully:', event);
      return true;

    } catch (error) {
      // Log failed delivery
      await WebhookLog.create({
        webhookId: webhook._id || undefined,
        event,
        payload: webhookPayload,
        response: error.response?.data,
        statusCode: error.response?.status,
        success: false,
        attempts: 1,
        nextRetryAt: new Date(Date.now() + 5 * 60 * 1000), // Retry in 5 minutes
      });

      console.error('❌ Webhook delivery failed:', error.message);
      return false;
    }

  } catch (error) {
    console.error('❌ Error sending webhook:', error.message);
    return false;
  }
};

/**
 * Verify webhook signature
 * @param {Object} payload - Webhook payload
 * @param {String} signature - Received signature
 * @param {String} secret - Webhook secret
 * @returns {Boolean} Valid or not
 */
const verifySignature = (payload, signature, secret) => {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

module.exports = {
  sendWebhook,
  verifySignature,
  generateSignature,
};
