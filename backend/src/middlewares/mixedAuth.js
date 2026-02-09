const apiKeyAuth = require('./apiKeyAuth');
const { protect } = require('./auth');

/**
 * Middleware that allows authentication via either API Key or JWT
 * Checks headers to determine which auth method to use
 */
const mixedAuth = async (req, res, next) => {
  // console.log('MixedAuth Headers:', req.headers); 

  // Check for API Key header (case insensitive)
  const apiKey = req.get('x-api-key');
  if (apiKey) {
    return apiKeyAuth(req, res, next);
  }

  // Check for JWT Authorization header
  const authHeader = req.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer')) {
    return protect(req, res, next);
  }

  // If neither is present, return 401
  return res.status(401).json({
    success: false,
    message: 'Authentication required (API Key or Bearer Token)',
  });
};

module.exports = mixedAuth;
