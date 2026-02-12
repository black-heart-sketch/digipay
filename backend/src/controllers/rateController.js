const CommissionTier = require('../models/CommissionTier');
const Merchant = require('../models/Merchant');

/**
 * Get all commission tiers
 * GET /api/admin/rates
 */
const getAllTiers = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    
    const query = includeInactive === 'true' ? {} : { isActive: true };
    
    const tiers = await CommissionTier.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tiers.length,
      data: tiers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create new commission tier
 * POST /api/admin/rates
 */
const createTier = async (req, res) => {
  try {
    const { name, description, rate, minTransactionVolume, features } = req.body;

    // Validate required fields
    if (!name || rate == null) {
      return res.status(400).json({
        success: false,
        message: 'Name and rate are required',
      });
    }

    // Check if tier with same name exists
    const existingTier = await CommissionTier.findOne({ name });
    if (existingTier) {
      return res.status(400).json({
        success: false,
        message: 'A tier with this name already exists',
      });
    }

    const tier = new CommissionTier({
      name,
      description: description || '',
      rate,
      minTransactionVolume: minTransactionVolume || 0,
      features: features || [],
      isActive: true,
    });

    await tier.save();

    res.status(201).json({
      success: true,
      message: 'Commission tier created successfully',
      data: tier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update commission tier
 * PATCH /api/admin/rates/:id
 */
const updateTier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, rate, minTransactionVolume, features, isActive } = req.body;

    const tier = await CommissionTier.findById(id);

    if (!tier) {
      return res.status(404).json({
        success: false,
        message: 'Commission tier not found',
      });
    }

    // Check if new name conflicts with existing tier
    if (name && name !== tier.name) {
      const existingTier = await CommissionTier.findOne({ name, _id: { $ne: id } });
      if (existingTier) {
        return res.status(400).json({
          success: false,
          message: 'A tier with this name already exists',
        });
      }
      tier.name = name;
    }

    if (description !== undefined) tier.description = description;
    if (rate !== undefined) tier.rate = rate;
    if (minTransactionVolume !== undefined) tier.minTransactionVolume = minTransactionVolume;
    if (features !== undefined) tier.features = features;
    if (isActive !== undefined) tier.isActive = isActive;

    await tier.save();

    res.status(200).json({
      success: true,
      message: 'Commission tier updated successfully',
      data: tier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete commission tier (soft delete)
 * DELETE /api/admin/rates/:id
 */
const deleteTier = async (req, res) => {
  try {
    const { id } = req.params;

    const tier = await CommissionTier.findById(id);

    if (!tier) {
      return res.status(404).json({
        success: false,
        message: 'Commission tier not found',
      });
    }

    // Soft delete
    tier.isActive = false;
    await tier.save();

    res.status(200).json({
      success: true,
      message: 'Commission tier deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Set custom commission rate for merchant
 * PATCH /api/admin/merchants/:merchantId/rate
 */
const setMerchantRate = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { customCommissionRate } = req.body;

    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found',
      });
    }

    // If customCommissionRate is null, clear the custom rate
    merchant.customCommissionRate = customCommissionRate;
    await merchant.save();

    res.status(200).json({
      success: true,
      message: customCommissionRate == null 
        ? 'Custom rate cleared, merchant will use tier rate' 
        : 'Custom commission rate set successfully',
      data: merchant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllTiers,
  createTier,
  updateTier,
  deleteTier,
  setMerchantRate,
};
