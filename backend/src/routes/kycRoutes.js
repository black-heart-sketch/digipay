const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// All routes require authentication
router.use(protect);

// Merchant routes
router.post(
  '/upload',
  upload.fields([
    { name: 'id_card', maxCount: 1 },
    { name: 'localization_plan', maxCount: 1 },
    { name: 'tax_registration', maxCount: 1 },
  ]),
  kycController.uploadDocuments
);
router.get('/my-documents', kycController.getMyDocuments);

module.exports = router;
