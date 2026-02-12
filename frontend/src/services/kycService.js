import api from './api';

/**
 * Upload KYC documents
 */
const uploadDocuments = async (files) => {
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

  const response = await api.post('/kyc/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Get merchant's own KYC documents
 */
const getMyDocuments = async () => {
  const response = await api.get('/kyc/my-documents');
  return response.data.data;
};

/**
 * Get KYC documents for a specific merchant (Admin only)
 */
const getMerchantDocuments = async (merchantId) => {
  const response = await api.get(`/admin/kyc/${merchantId}`);
  return response.data.data;
};

/**
 * Review a KYC document (Admin only)
 */
const reviewDocument = async (documentId, status, reviewerNotes = '') => {
  const response = await api.patch(`/admin/kyc/${documentId}/review`, {
    status,
    reviewerNotes,
  });
  return response.data;
};

export default {
  uploadDocuments,
  getMyDocuments,
  getMerchantDocuments,
  reviewDocument,
};
