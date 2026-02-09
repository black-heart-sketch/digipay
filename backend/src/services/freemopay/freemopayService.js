const axios = require('axios');

const FREEMOPAY_API_BASE_URL = process.env.FREEMOPAY_API_BASE_URL;
const FREEMOPAY_APP_KEY = process.env.FREEMOPAY_APP_KEY;
const FREEMOPAY_SECRET_KEY = process.env.FREEMOPAY_SECRET_KEY;
const TEST_MODE = process.env.PAYMENT_TEST_MODE === 'true';

/**
 * Create Basic Auth string for FreemoPay API
 */
const getAuthHeader = () => {
  const credentials = `${FREEMOPAY_APP_KEY}:${FREEMOPAY_SECRET_KEY}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
};

/**
 * Generate unique external ID for payment tracking
 */
const generateExternalId = (prefix = 'payment') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Initiate FreemoPay payment
 * @param {String} payer - Mobile money number (e.g., 237612345678)
 * @param {Number} amount - Amount in cents
 * @param {String} description - Payment description
 * @param {String} callbackUrl - Webhook callback URL
 * @returns {Object} Payment details with FreemoPay reference
 */
const initiatePayment = async (payer, amount, description, callbackUrl) => {
  try {
    const externalId = generateExternalId('payment');

    // TEST MODE: Bypass FreemoPay API
    if (TEST_MODE) {
      console.log('🧪 TEST MODE: Bypassing FreemoPay API');
      
      const mockReference = `test_ref_${Date.now()}`;
      
      return {
        reference: mockReference,
        externalId: externalId,
        message: 'Test payment initiated successfully',
        testMode: true,
      };
    }

    // PRODUCTION MODE: Call FreemoPay API
    const paymentData = {
      payer: payer,
      amount: String(amount),
      externalId: externalId,
      description: description,
      callback: callbackUrl,
    };

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${FREEMOPAY_API_BASE_URL}/api/v2/payment`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      data: paymentData,
    };

    console.log('📤 Initiating FreemoPay payment:', paymentData);

    const response = await axios(config);
    console.log('📥 FreemoPay response:', response.data);

    return {
      reference: response.data.reference,
      externalId: externalId,
      message: response.data.message || 'Payment initiated successfully',
    };

  } catch (error) {
    console.error('❌ Error initiating FreemoPay payment:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to initiate payment');
  }
};

/**
 * Check FreemoPay payment status
 * @param {String} reference - FreemoPay payment reference
 * @returns {Object} Payment status details
 */
const checkPaymentStatus = async (reference) => {
  try {
    // TEST MODE: Skip API call
    if (TEST_MODE) {
      console.log('🧪 TEST MODE: Skipping FreemoPay status check');
      return { status: 'SUCCESS', message: 'Test mode - payment successful' };
    }

    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${FREEMOPAY_API_BASE_URL}/api/v2/payment/${reference}`,
      headers: {
        'Authorization': getAuthHeader(),
      },
    };

    const response = await axios(config);
    return response.data;

  } catch (error) {
    console.error('❌ Error checking payment status:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to check payment status');
  }
};

/**
 * Initiate withdrawal to mobile money account
 * @param {String} receiver - Mobile money number
 * @param {Number} amount - Amount in cents
 * @param {String} externalId - External tracking ID
 * @param {String} callbackUrl - Webhook callback URL
 * @returns {Object} Withdrawal details
 */
const initiateWithdraw = async (receiver, amount, externalId, callbackUrl) => {
  try {
    // TEST MODE: Mock withdrawal
    if (TEST_MODE) {
      console.log('🧪 TEST MODE: Bypassing FreemoPay withdrawal');
      
      const mockReference = `test_withdraw_${Date.now()}`;
      
      return {
        reference: mockReference,
        externalId: externalId,
        message: 'Test withdrawal initiated successfully',
      };
    }

    const withdrawData = {
      receiver: receiver,
      amount: String(amount),
      externalId: externalId,
      callback: callbackUrl,
    };

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${FREEMOPAY_API_BASE_URL}/api/v2/payment/direct-withdraw`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      data: withdrawData,
    };

    const response = await axios(config);

    return {
      reference: response.data.reference,
      externalId: externalId,
      message: response.data.message || 'Withdrawal initiated successfully',
    };

  } catch (error) {
    console.error('❌ Error initiating withdrawal:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to initiate withdrawal');
  }
};

module.exports = {
  initiatePayment,
  checkPaymentStatus,
  initiateWithdraw,
  generateExternalId,
};
