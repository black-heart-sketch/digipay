import BaseService from './BaseService';

/**
 * KYC service with real-time updates for document management
 */
class KycService extends BaseService {
  constructor() {
    super('kycdocuments', 'kyc');
  }

  /**
   * Upload KYC documents
   * @param {Object} files - Object containing document files { idCard, localizationPlan, taxRegistration }
   * @returns {Promise} Upload response
   */
  async uploadDocuments(files) {
    const formData = new FormData();

    if (files.idCard) {
      formData.append('id_card', files.idCard);
    }

    if (files.localizationPlan) {
      formData.append('localization_plan', files.localizationPlan);
    }

    if (files.taxRegistration) {
      formData.append('tax_registration', files.taxRegistration);
    }

    const response = await this.client.post(`/${this.endpoint}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Get merchant's own KYC documents
   * @returns {Promise} List of documents
   */
  async getMyDocuments() {
    const response = await this.client.get(`/${this.endpoint}/my-documents`);
    return response.data.data;
  }

  /**
   * Get KYC documents for a specific merchant (Admin only)
   * @param {String} merchantId - ID of the merchant
   * @returns {Promise} List of documents
   */
  async getMerchantDocuments(merchantId) {
    const response = await this.client.get(`/admin/${this.endpoint}/${merchantId}`);
    return response.data.data;
  }

  /**
   * Review a KYC document (Admin only)
   * @param {String} documentId - ID of the document to review
   * @param {String} status - Review status (approved, rejected, pending_review)
   * @param {String} reviewerNotes - Optional reviewer notes
   * @returns {Promise} Review response
   */
  async reviewDocument(documentId, status, reviewerNotes = '') {
    const response = await this.client.patch(`/admin/${this.endpoint}/${documentId}/review`, {
      status,
      reviewerNotes,
    });
    return response.data;
  }
}

export default new KycService();
