const express = require('express');
const router = express.Router();
const rateController = require('../controllers/rateController');
const { protect } = require('../middlewares/auth');
const adminAuth = require('../middlewares/adminAuth');

// All routes require authentication and admin role
router.use(protect);
router.use(adminAuth);

// Commission tier routes
router.get('/', rateController.getAllTiers);
router.post('/', rateController.createTier);
router.patch('/:id', rateController.updateTier);
router.delete('/:id', rateController.deleteTier);

// Merchant-specific rate
router.patch('/merchants/:merchantId/rate', rateController.setMerchantRate);

module.exports = router;
