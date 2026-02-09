const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const apiKeyAuth = require('../middlewares/apiKeyAuth');

// All routes require API key authentication
// router.use(apiKeyAuth); - Removed global use to support mixed auth

const { protect } = require('../middlewares/auth');

const mixedAuth = require('../middlewares/mixedAuth');

// Public route (with API Key)
router.post('/initiate', apiKeyAuth, paymentController.initiatePayment);

// Dashboard routes (with JWT)
router.get('/analytics', mixedAuth, paymentController.getAnalytics);
router.post('/initiate-dashboard', protect, paymentController.initiateDashboardPayment);
router.get('/transactions', mixedAuth, paymentController.listTransactions); 
router.get('/transactions/:transactionId', mixedAuth, paymentController.getTransaction);

module.exports = router;
