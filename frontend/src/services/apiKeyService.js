import BaseService from './BaseService';

class ApiKeyService extends BaseService {
  constructor() {
    super('apikeys', 'keys');
  }

  /**
   * Get all API keys for the current merchant
   * @returns {Promise} List of API keys
   */
  async getKeys() {
    return this.getData();
  }

  /**
   * Generate a new API key
   * @param {Object} data - Key data { name, environment }
   * @returns {Promise} Generated key details
   */
  async generateKey(data) {
    const response = await this.client.post(`${this.endpoint}/generate`, data);
    return response.data.data || response.data;
  }

  /**
   * Revoke an API key
   * @param {String} keyId - ID of the key to revoke
   * @returns {Promise} Success message
   */
  async revokeKey(keyId) {
    return this.delete(keyId);
  }
}

export default new ApiKeyService();
