const express = require('express');
const router = express.Router();
const settlementController = require('../controllers/settlementController');
const { protect } = require('../middlewares/auth');

// All routes require JWT authentication
router.use(protect);

router.post('/request', settlementController.requestSettlement);
router.get('/', settlementController.getSettlements);
router.get('/balance', settlementController.getBalance);

module.exports = router;
