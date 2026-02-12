import api from './api';

/**
 * Get all commission tiers
 */
const getAllTiers = async (includeInactive = false) => {
  const response = await api.get('/admin/rates', {
    params: { includeInactive },
  });
  return response.data.data;
};

/**
 * Create new commission tier
 */
const createTier = async (tierData) => {
  const response = await api.post('/admin/rates', tierData);
  return response.data;
};

/**
 * Update commission tier
 */
const updateTier = async (tierId, tierData) => {
  const response = await api.patch(`/admin/rates/${tierId}`, tierData);
  return response.data;
};

/**
 * Delete commission tier (soft delete)
 */
const deleteTier = async (tierId) => {
  const response = await api.delete(`/admin/rates/${tierId}`);
  return response.data;
};

/**
 * Set custom commission rate for merchant
 */
const setMerchantRate = async (merchantId, customCommissionRate) => {
  const response = await api.patch(`/admin/rates/merchants/${merchantId}/rate`, {
    customCommissionRate,
  });
  return response.data;
};

export default {
  getAllTiers,
  createTier,
  updateTier,
  deleteTier,
  setMerchantRate,
};
