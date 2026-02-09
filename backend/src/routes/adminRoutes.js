const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middlewares/auth');
const adminAuth = require('../middlewares/adminAuth');

// All routes require login + admin role
router.use(protect);
router.use(adminAuth);

router.get('/merchants', adminController.getAllMerchants);
router.patch('/merchants/:id/status', adminController.updateMerchantStatus);
router.get('/stats', adminController.getSystemStats);

router.get('/merchants/:id', adminController.getMerchantDetails);
router.get('/merchants/:id/transactions', adminController.getMerchantTransactions);
router.post('/transactions/:id/check-status', adminController.checkTransactionStatus);

module.exports = router;
