import BaseService from './BaseService';

/**
 * Settlement service with real-time updates
 */
class SettlementService extends BaseService {
  constructor() {
    super('settlements', 'settlements');
  }

  /**
   * Get settlements with filters
   * @param {Object} filters - Query filters (status, page, limit)
   * @returns {Promise} Settlements list
   */
  async getSettlements(filters = {}) {
    return this.getData({ params: filters });
  }

  /**
   * Request settlement/payout
   * @param {Number} amount - Amount to settle
   * @param {String} [recipientPhone] - Optional recipient phone
   * @returns {Promise} Settlement response
   */
  async requestSettlement(amount, recipientPhone) {
    return this.create({ amount, recipientPhone: recipientPhone || undefined });
  }

  /**
   * Get merchant balance
   * @returns {Promise} Balance details
   */
  async getBalance() {
    // Fetch directly using client to avoid overwriting this.data (which holds settlements list)
    // and triggering the general subscription leading to infinite loops
    const response = await this.client.get(`/${this.endpoint}/balance`); 
    return response.data.data || response.data;
  }
}

export default new SettlementService();
