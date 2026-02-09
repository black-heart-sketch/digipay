import { useState, useEffect } from 'react'
import axios from 'axios'
import { Upload, CheckCircle, AlertCircle, FileText, Shield } from 'lucide-react'

const KYC = () => {
  const [documents, setDocuments] = useState({
    businessRegistration: null,
    taxId: null,
    idProof: null,
  })
  const [status, setStatus] = useState('pending') // pending, submitted, verified, rejected
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await axios.get('/api/auth/profile')
      const kycStatus = response.data.data.merchant.kycStatus
      // Map backend status to frontend status if needed, or use directly
      // Backend: pending, approved, rejected, limited
      // Frontend assumption: submitted means pending
      if (kycStatus === 'approved') setStatus('verified')
      else if (kycStatus === 'pending') setStatus('submitted')
      else setStatus('pending') // default to input form if rejected or not started
    } catch (error) {
      console.error('Error fetching KYC status:', error)
    }
  }

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments(prev => ({
        ...prev,
        [type]: e.target.files[0]
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API upload
    setTimeout(() => {
      setStatus('submitted')
      setLoading(false)
    }, 1500)
  }

  if (status === 'submitted') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents Submitted</h2>
        <p className="text-gray-600 mb-8">
          Your KYC documents have been received and are currently under review. 
          This process usually takes 24-48 hours. We'll notify you via email once verified.
        </p>
        <button 
          onClick={() => setStatus('pending')} // For demo purposes
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Submit detailed documents again (Demo)
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
        <p className="text-gray-600">Submit your business documents to activate your account.</p>
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

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
        
        {/* Business Registration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Business Registration</h3>
              <p className="text-sm text-gray-500">Upload your certificate of incorporation</p>
            </div>
            {documents.businessRegistration && (
              <span className="flex items-center text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1" /> Attached
              </span>
            )}
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer relative group">
            <input 
              type="file" 
              accept=".pdf,.jpg,.png"
              onChange={(e) => handleFileChange(e, 'businessRegistration')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors mb-2" />
              <p className="text-sm text-gray-600 font-medium">
                {documents.businessRegistration ? documents.businessRegistration.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG up to 5MB</p>
            </div>
          </div>
        </div>

        {/* Tax ID */}
        <div className="space-y-4 border-t border-gray-100 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Tax Identification</h3>
              <p className="text-sm text-gray-500">Upload your tax registration document</p>
            </div>
            {documents.taxId && (
              <span className="flex items-center text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1" /> Attached
              </span>
            )}
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer relative group">
            <input 
              type="file" 
              accept=".pdf,.jpg,.png"
              onChange={(e) => handleFileChange(e, 'taxId')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors mb-2" />
              <p className="text-sm text-gray-600 font-medium">
                {documents.taxId ? documents.taxId.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG up to 5MB</p>
            </div>
          </div>
        </div>

        {/* ID Proof */}
        <div className="space-y-4 border-t border-gray-100 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Director ID Proof</h3>
              <p className="text-sm text-gray-500">Upload ID card or Passport of the director</p>
            </div>
            {documents.idProof && (
              <span className="flex items-center text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1" /> Attached
              </span>
            )}
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer relative group">
            <input 
              type="file" 
              accept=".pdf,.jpg,.png"
              onChange={(e) => handleFileChange(e, 'idProof')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors mb-2" />
              <p className="text-sm text-gray-600 font-medium">
                {documents.idProof ? documents.idProof.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG up to 5MB</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading || !documents.businessRegistration || !documents.taxId || !documents.idProof}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              'Submit for Verification'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default KYC
