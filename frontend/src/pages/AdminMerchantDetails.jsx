import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { 
  User, CreditCard, RotateCw, ArrowLeft, 
  CheckCircle, XCircle, AlertCircle, Shield,
  DollarSign, Activity
} from 'lucide-react'

const AdminMerchantDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [merchant, setMerchant] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkingStatus, setCheckingStatus] = useState(null)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const [merchantRes, txnRes] = await Promise.all([
        axios.get(`/api/admin/merchants/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`/api/admin/merchants/${id}/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      setMerchant(merchantRes.data.data)
      setTransactions(txnRes.data.data)
    } catch (error) {
      console.error('Error fetching details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckStatus = async (txnId) => {
    try {
      setCheckingStatus(txnId)
      const token = localStorage.getItem('token')
      await axios.post(`/api/admin/transactions/${txnId}/check-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Status checked & updated')
      // Refresh transactions
      const txnRes = await axios.get(`/api/admin/merchants/${id}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
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
