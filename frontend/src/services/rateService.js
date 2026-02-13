import BaseService from './BaseService';

/**
 * Rate service with real-time updates for commission tiers
 */
class RateService extends BaseService {
  constructor() {
    super('commissiontiers', 'admin/rates');
  }

  /**
   * Get all commission tiers
   * @param {Boolean} includeInactive - Include inactive tiers
   * @returns {Promise} List of commission tiers
   */
  async getAllTiers(includeInactive = false) {
    return this.getData({ params: { includeInactive } });
  }

  /**
   * Create new commission tier
   * @param {Object} tierData - Tier data { name, description, rate, minTransactionVolume, features }
   * @returns {Promise} Created tier
   */
  async createTier(tierData) {
    return this.create(tierData);
  }

  /**
   * Update commission tier
   * @param {String} tierId - ID of the tier to update
   * @param {Object} tierData - Updated tier data
   * @returns {Promise} Updated tier
   */
  async updateTier(tierId, tierData) {
    // BaseService uses PUT, but backend expects PATCH
    const response = await this.client.patch(`/${this.endpoint}/${tierId}`, tierData);
    return response.data;
  }

  /**
   * Delete commission tier (soft delete)
   * @param {String} tierId - ID of the tier to delete
   * @returns {Promise} Delete response
   */
  async deleteTier(tierId) {
    return this.delete(tierId);
  }

  /**
   * Set custom commission rate for merchant
   * @param {String} merchantId - ID of the merchant
   * @param {Number} customCommissionRate - Custom commission rate
   * @returns {Promise} Updated merchant data
   */
  async setMerchantRate(merchantId, customCommissionRate) {
    const response = await this.client.patch(`/${this.endpoint}/merchants/${merchantId}/rate`, {
      customCommissionRate,
    });
    return response.data;
  }
}

export default new RateService();
