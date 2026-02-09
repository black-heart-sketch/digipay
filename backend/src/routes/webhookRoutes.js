const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// FreemoPay webhook (no auth required - validated by FreemoPay)
router.post('/freemopay', webhookController.freemopayWebhook);

module.exports = router;
