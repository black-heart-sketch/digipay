import { useState, useEffect } from 'react'
import { Upload, CheckCircle, AlertCircle, FileText, Shield, Loader, ExternalLink, RefreshCw, XCircle } from 'lucide-react'
import kycService from '../services/kycService'
import api from '../services/api'

const KYC = () => {
  const [documents, setDocuments] = useState({
    idCard: null,
    localizationPlan: null,
    taxRegistration: null,
  })
  const [currentDocuments, setCurrentDocuments] = useState([])
  const [status, setStatus] = useState('pending') // pending, submitted, approved, rejected, under_review
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [merchantKycStatus, setMerchantKycStatus] = useState(null)
  const [showUploadForm, setShowUploadForm] = useState(false)

  useEffect(() => {
    fetchStatus()
    fetchCurrentDocuments()
  }, [])

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const response = await api.get('/auth/profile')
      const kycStatus = response.data.data.merchant.kycStatus
      setMerchantKycStatus(kycStatus)
      
      // Map backend status to frontend display
      if (kycStatus === 'approved') {
        setStatus('approved')
      } else if (kycStatus === 'under_review') {
        setStatus('submitted')
      } else if (kycStatus === 'rejected') {
        setStatus('rejected')
      } else {
        setStatus('pending')
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentDocuments = async () => {
    try {
      const docs = await kycService.getMyDocuments()
      setCurrentDocuments(docs || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments(prev => ({
        ...prev,
        [type]: e.target.files[0]
      }))
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    
    // Validate required documents
    if (!documents.idCard) {
      setError('ID card is required')
      return
    }

    if (!documents.localizationPlan) {
      setError('Localization plan is required')
      return
    }

    setUploading(true)
    
    try {
      await kycService.uploadDocuments(documents)
      setSuccessMessage('Documents uploaded successfully! Your KYC is now under review.')
      setDocuments({
        idCard: null,
        localizationPlan: null,
        taxRegistration: null,
      })
      setShowUploadForm(false)
      await fetchStatus()
      await fetchCurrentDocuments()
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const getStatusBadge = (docStatus) => {
    if (docStatus === 'approved') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</span>
    } else if (docStatus === 'rejected') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</span>
    } else {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</span>
    }
  }

  const getDocumentByType = (type) => {
    return currentDocuments.find(doc => doc.documentType === type)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
        <p className="text-gray-600">Manage your business verification documents</p>
      </div>

      {/* Overall KYC Status Banner */}
      <div className={`rounded-xl p-6 flex items-start space-x-4 ${
        merchantKycStatus === 'approved' ? 'bg-green-50 border border-green-200' :
        merchantKycStatus === 'under_review' ? 'bg-blue-50 border border-blue-200' :
        merchantKycStatus === 'rejected' ? 'bg-red-50 border border-red-200' :
        'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className={`p-2 rounded-lg ${
          merchantKycStatus === 'approved' ? 'bg-green-100' :
          merchantKycStatus === 'under_review' ? 'bg-blue-100' :
          merchantKycStatus === 'rejected' ? 'bg-red-100' :
          'bg-yellow-100'
        }`}>
          {merchantKycStatus === 'approved' ? <CheckCircle className="w-6 h-6 text-green-600" /> :
           merchantKycStatus === 'under_review' ? <Shield className="w-6 h-6 text-blue-600" /> :
           merchantKycStatus === 'rejected' ? <AlertCircle className="w-6 h-6 text-red-600" /> :
           <AlertCircle className="w-6 h-6 text-yellow-600" />}
        </div>
        <div className="flex-1">
          <h3 className={`font-bold ${
            merchantKycStatus === 'approved' ? 'text-green-900' :
            merchantKycStatus === 'under_review' ? 'text-blue-900' :
            merchantKycStatus === 'rejected' ? 'text-red-900' :
            'text-yellow-900'
          }`}>
            {merchantKycStatus === 'approved' && 'KYC Verified!'}
            {merchantKycStatus === 'under_review' && 'Documents Under Review'}
            {merchantKycStatus === 'rejected' && 'KYC Rejected'}
            {merchantKycStatus === 'pending' && 'KYC Verification Required'}
          </h3>
          <p className={`text-sm mt-1 ${
            merchantKycStatus === 'approved' ? 'text-green-700' :
            merchantKycStatus === 'under_review' ? 'text-blue-700' :
            merchantKycStatus === 'rejected' ? 'text-red-700' :
            'text-yellow-700'
          }`}>
            {merchantKycStatus === 'approved' && 'Your account is verified. You can generate API keys and accept payments.'}
            {merchantKycStatus === 'under_review' && 'Your documents are being reviewed. This usually takes 24-48 hours.'}
            {merchantKycStatus === 'rejected' && 'Your documents were rejected. Please update and resubmit.'}
            {merchantKycStatus === 'pending' && 'Please upload your verification documents to activate your account.'}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start space-x-4">
        <Shield className="w-6 h-6 text-blue-600 mt-1" />
        <div>
          <h3 className="font-bold text-blue-900">Why is this required?</h3>
          <p className="text-blue-700 text-sm mt-1">
            To comply with financial regulations and prevent fraud, we must verify the identity 
            of all merchants before processing payouts. Your data is encrypted and secure.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <p className="text-green-700 text-sm">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Current Documents Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Document Status</h3>
          <p className="text-sm text-gray-500 mt-1">View your uploaded documents and their verification status</p>
        </div>
        <div className="divide-y divide-gray-100">
          {/* ID Card */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">ID Card <span className="text-red-500">*</span></h4>
                  {getDocumentByType('id_card') && getStatusBadge(getDocumentByType('id_card').status)}
                </div>
                <p className="text-sm text-gray-500 mt-1">National ID or Passport</p>
                {getDocumentByType('id_card') && (
                  <div className="mt-3 flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{getDocumentByType('id_card').fileName}</span>
                    <a
                      href={`http://localhost:5001${getDocumentByType('id_card').fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm inline-flex items-center"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Localization Plan */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">Localization Plan <span className="text-red-500">*</span></h4>
                  {getDocumentByType('localization_plan') && getStatusBadge(getDocumentByType('localization_plan').status)}
                </div>
                <p className="text-sm text-gray-500 mt-1">Business location proof or lease agreement</p>
                {getDocumentByType('localization_plan') && (
                  <div className="mt-3 flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{getDocumentByType('localization_plan').fileName}</span>
                    <a
                      href={`http://localhost:5001${getDocumentByType('localization_plan').fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm inline-flex items-center"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tax Registration */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">Tax Registration Certificate <span className="text-gray-400 text-sm">(Optional)</span></h4>
                  {getDocumentByType('tax_registration') && getStatusBadge(getDocumentByType('tax_registration').status)}
                </div>
                <p className="text-sm text-gray-500 mt-1">Tax registration document</p>
                {getDocumentByType('tax_registration') && (
                  <div className="mt-3 flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{getDocumentByType('tax_registration').fileName}</span>
                    <a
                      href={`http://localhost:5001${getDocumentByType('tax_registration').fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm inline-flex items-center"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {showUploadForm ? 'Cancel Update' : 'Update Documents'}
          </button>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">ID Card <span className="text-red-500">*</span></h3>
                <p className="text-sm text-gray-500">Upload your National ID or Passport</p>
              </div>
              {documents.idCard && (
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4 mr-1" /> Attached
                </span>
              )}
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer relative group">
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'idCard')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  {documents.idCard ? documents.idCard.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG up to 5MB</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Localization Plan <span className="text-red-500">*</span></h3>
                <p className="text-sm text-gray-500">Upload business location proof or lease agreement</p>
              </div>
              {documents.localizationPlan && (
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4 mr-1" /> Attached
                </span>
              )}
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer relative group">
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'localizationPlan')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  {documents.localizationPlan ? documents.localizationPlan.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG up to 5MB</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Tax Registration Certificate <span className="text-gray-400 text-sm">(Optional)</span></h3>
                <p className="text-sm text-gray-500">Upload your tax registration document if available</p>
              </div>
              {documents.taxRegistration && (
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4 mr-1" /> Attached
                </span>
              )}
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer relative group">
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'taxRegistration')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  {documents.taxRegistration ? documents.taxRegistration.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG up to 5MB</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={() => {
                setShowUploadForm(false)
                setDocuments({ idCard: null, localizationPlan: null, taxRegistration: null })
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !documents.idCard || !documents.localizationPlan}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {uploading ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Uploading...
                </>
              ) : (
                'Submit for Verification'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default KYC
