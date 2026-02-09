const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const { protect } = require('../middlewares/auth');

// All routes require JWT authentication
router.use(protect);

router.post('/generate', apiKeyController.generateKey);
router.get('/', apiKeyController.listKeys);
router.delete('/:keyId', apiKeyController.revokeKey);

module.exports = router;
