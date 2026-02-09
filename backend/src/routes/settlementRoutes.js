const express = require('express');
const router = express.Router();
const settlementController = require('../controllers/settlementController');
const mixedAuth = require('../middlewares/mixedAuth');

// All routes require authentication (JWT or API Key)
router.use(mixedAuth);

router.post('/request', settlementController.requestSettlement);
router.get('/', settlementController.getSettlements);
router.get('/balance', settlementController.getBalance);

module.exports = router;
