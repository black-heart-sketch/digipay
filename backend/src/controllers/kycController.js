const KYC = require('../models/KYC');
const Merchant = require('../models/Merchant');

/**
 * Upload KYC documents
 * POST /api/kyc/upload
 */
const uploadDocuments = async (req, res) => {
  try {
    if (!req.merchant) {
      return res.status(403).json({
        success: false,
        message: 'Only merchants can upload KYC documents',
      });
    }

    const files = req.files;
    
    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    // Validate required documents
    if (!files.id_card) {
      return res.status(400).json({
        success: false,
        message: 'ID card is required',
      });
    }

    if (!files.localization_plan) {
      return res.status(400).json({
        success: false,
        message: 'Localization plan is required',
      });
    }

    const merchantId = req.merchant._id;
    const uploadedDocs = [];

    // Process each uploaded file
    const documentTypes = [
      { field: 'id_card', type: 'id_card', required: true },
      { field: 'localization_plan', type: 'localization_plan', required: true },
      { field: 'tax_registration', type: 'tax_registration', required: false },
    ];

    for (const docType of documentTypes) {
      const file = files[docType.field];
      
      if (file && file[0]) {
        // Delete existing document of this type
        await KYC.deleteMany({ merchantId, documentType: docType.type });

        // Create new KYC document
        const kycDoc = new KYC({
          merchantId,
          documentType: docType.type,
          isRequired: docType.required,
          fileUrl: `/uploads/kyc/${file[0].filename}`,
          fileName: file[0].originalname,
          fileSize: file[0].size,
          status: 'pending',
        });

        await kycDoc.save();
        uploadedDocs.push(kycDoc);
      }
    }

    // Update merchant KYC status to under_review
    const merchant = await Merchant.findById(merchantId);
    merchant.kycStatus = 'under_review';
    await merchant.save();

    res.status(200).json({
      success: true,
      message: 'KYC documents uploaded successfully',
      data: uploadedDocs,
    });
  } catch (error) {
    console.error('Error uploading KYC documents:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get merchant's own KYC documents
 * GET /api/kyc/my-documents
 */
const getMyDocuments = async (req, res) => {
  try {
    if (!req.merchant) {
      return res.status(403).json({
        success: false,
        message: 'Only merchants can access this endpoint',
      });
    }

    const documents = await KYC.find({ merchantId: req.merchant._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get KYC documents for a specific merchant (Admin only)
 * GET /api/admin/kyc/:merchantId
 */
const getDocumentsByMerchant = async (req, res) => {
  try {
    const { merchantId } = req.params;

    const documents = await KYC.find({ merchantId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Review KYC document (Admin only)
 * PATCH /api/admin/kyc/:documentId/review
 */
const reviewDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { status, reviewerNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected',
      });
    }

    const document = await KYC.findById(documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    document.status = status;
    document.reviewerNotes = reviewerNotes || '';
    document.reviewedBy = req.user._id;
    document.reviewedAt = new Date();
    await document.save();

    // Check if all required documents are approved
    const merchantId = document.merchantId;
    const allDocs = await KYC.find({ merchantId });
    
    const requiredDocs = allDocs.filter(doc => doc.isRequired);
    const allRequiredApproved = requiredDocs.every(doc => doc.status === 'approved');
    const anyRejected = allDocs.some(doc => doc.status === 'rejected');

    // Update merchant KYC status
    const merchant = await Merchant.findById(merchantId);
    if (anyRejected) {
      merchant.kycStatus = 'rejected';
    } else if (allRequiredApproved) {
      merchant.kycStatus = 'approved';
    } else {
      merchant.kycStatus = 'under_review';
    }
    await merchant.save();

    res.status(200).json({
      success: true,
      message: 'Document reviewed successfully',
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadDocuments,
  getMyDocuments,
  getDocumentsByMerchant,
  reviewDocument,
};
