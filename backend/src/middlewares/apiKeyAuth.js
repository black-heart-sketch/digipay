const ApiKey = require('../models/ApiKey');

/**
 * API Key authentication middleware
 */
const apiKeyAuth = async (req, res, next) => {
  try {
    // Get API key from header
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required',
      });
    }

    // Hash the provided key
    const keyHash = ApiKey.hashKey(apiKey);

    // Find API key
    const apiKeyDoc = await ApiKey.findOne({ keyHash, isActive: true }).populate('merchantId');

    if (!apiKeyDoc) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key',
      });
    }

    // Update last used timestamp
    apiKeyDoc.lastUsed = new Date();
    await apiKeyDoc.save();

    // Attach merchant to request
    req.merchant = apiKeyDoc.merchantId;
    req.apiKey = apiKeyDoc;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = apiKeyAuth;
