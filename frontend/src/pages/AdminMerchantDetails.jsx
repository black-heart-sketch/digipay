import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import kycService from '../services/kycService'
import { 
  User, CreditCard, RotateCw, ArrowLeft, 
  CheckCircle, XCircle, AlertCircle, Shield,
  DollarSign, Activity, FileText, ExternalLink
} from 'lucide-react'

const AdminMerchantDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [merchant, setMerchant] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [kycDocuments, setKycDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkingStatus, setCheckingStatus] = useState(null)
  const [reviewingDoc, setReviewingDoc] = useState(null)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [merchantRes, txnRes, kycRes] = await Promise.all([
        api.get(`/admin/merchants/${id}`),
        api.get(`/admin/merchants/${id}/transactions`),
        kycService.getMerchantDocuments(id)
      ])

      setMerchant(merchantRes.data.data)
      setTransactions(txnRes.data.data)
      setKycDocuments(kycRes || [])
    } catch (error) {
      console.error('Error fetching details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewDocument = async (documentId, status) => {
    try {
      setReviewingDoc(documentId)
      await kycService.reviewDocument(documentId, status)
      alert(`Document ${status}!`)
      // Refresh data
      await fetchData()
    } catch (error) {
      console.error('Error reviewing document:', error)
      alert('Failed to review document')
    } finally {
      setReviewingDoc(null)
    }
  }

  const handleCheckStatus = async (txnId) => {
    try {
      setCheckingStatus(txnId)
      await api.post(`/admin/transactions/${txnId}/check-status`, {})
      alert('Status checked & updated')
      // Refresh transactions
      const txnRes = await api.get(`/admin/merchants/${id}/transactions`)
      setTransactions(txnRes.data.data)
    } catch (error) {
      console.error('Error checking status:', error)
      alert('Failed to check status')
    } finally {
      setCheckingStatus(null)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (!merchant) return <div className="p-8 text-center">Merchant not found</div>

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/merchants')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{merchant.businessName}</h1>
          <p className="text-sm text-gray-500">{merchant.businessType} • {merchant.country}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(merchant.balance || 0)}
          </h3>
          <p className="text-sm text-gray-500">Current Balance</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
             {new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(merchant.totalRevenue || 0)}
          </h3>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <User className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="font-medium text-gray-900">{merchant.userId?.email}</p>
          <p className="text-sm text-gray-500">{merchant.phone}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Shield className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
           <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
            merchant.kycStatus === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
           }`}>
             {merchant.kycStatus.toUpperCase()}
           </span>
           <p className="text-sm text-gray-500 mt-2">Commission: {merchant.commissionTier} ({merchant.customCommissionRate || 'Default'}%)</p>
        </div>
      </div>

      {/* KYC Documents */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">KYC Documents</h3>
            <p className="text-sm text-gray-500 mt-1">Review and approve merchant documents</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            merchant.kycStatus === 'approved' ? 'bg-green-100 text-green-800' :
            merchant.kycStatus === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
            merchant.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {merchant.kycStatus.toUpperCase().replace('_', ' ')}
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {kycDocuments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No KYC documents uploaded yet</p>
            </div>
          ) : (
            kycDocuments.map((doc) => (
              <div key={doc._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${
                      doc.status === 'approved' ? 'bg-green-50 text-green-600' :
                      doc.status === 'rejected' ? 'bg-red-50 text-red-600' :
                      'bg-yellow-50 text-yellow-600'
                    }`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">
                        {doc.documentType.replace('_', ' ')}
                        {!doc.isRequired && <span className="text-gray-400 text-sm ml-2">(Optional)</span>}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">{doc.fileName}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                          doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        {doc.reviewedAt && (
                          <span className="text-xs text-gray-400">
                            Reviewed {new Date(doc.reviewedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {doc.reviewerNotes && (
                        <p className="text-sm text-gray-600 mt-2 italic">Note: {doc.reviewerNotes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`http://localhost:5001${doc.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Document"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    {doc.status !== 'approved' && (
                      <button
                        onClick={() => handleReviewDocument(doc._id, 'approved')}
                        disabled={reviewingDoc === doc._id}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    {doc.status !== 'rejected' && (
                      <button
                        onClick={() => handleReviewDocument(doc._id, 'rejected')}
                        disabled={reviewingDoc === doc._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                 <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No transactions found</td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs">{txn.transactionId}</td>
                    <td className="px-6 py-4 font-medium">
                      {new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(txn.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                       <span className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        {txn.paymentMethod || 'Mobile Money'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        txn.status === 'success' ? 'bg-green-100 text-green-800' :
                        txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(txn.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {txn.status === 'pending' && (
                        <button 
                          onClick={() => handleCheckStatus(txn._id)}
                          disabled={checkingStatus === txn._id}
                          className="text-primary-600 hover:bg-primary-50 p-2 rounded flex items-center gap-1 ml-auto"
                        >
                          <RotateCw className={`w-4 h-4 ${checkingStatus === txn._id ? 'animate-spin' : ''}`} />
                          <span className="text-xs">Check</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminMerchantDetails
