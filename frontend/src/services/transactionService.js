import BaseService from './BaseService';

/**
 * Transaction service with real-time updates
 */
class TransactionService extends BaseService {
  constructor() {
    super('transactions', 'payments/transactions');
  }

  /**
   * Get transactions with filters
   * @param {Object} filters - Query filters (status, page, limit)
   * @returns {Promise} Transactions list
   */
  async getTransactions(filters = {}) {
    return this.getData({ params: filters });
  }

  /**
   * Get transaction by ID
   * @param {String} transactionId - Transaction ID
   * @returns {Promise} Transaction details
   */
  async getTransaction(transactionId) {
    return this.getById(transactionId);
  }
  /**
   * Initiate a payment (Pay In)
   * @param {Object} data - Payment data { amount, customerPhone }
   * @returns {Promise} Payment details
   */
  async initiatePayment(data) {
    const response = await this.client.post('/payments/initiate-dashboard', data);
    return response.data.data || response.data;
  }

  /**
   * Get dashboard analytics
   * @returns {Promise} Analytics data
   */
  async getAnalytics() {
    const response = await this.client.get('/payments/analytics');
    return response.data.data || response.data;
  }
}

export default new TransactionService();
