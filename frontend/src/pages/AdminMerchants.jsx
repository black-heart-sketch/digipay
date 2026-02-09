import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { 
  Users, Search, Filter, MoreVertical, 
  CheckCircle, XCircle, AlertCircle, Shield, 
  Download, RefreshCw, Trash2
} from 'lucide-react'
// import { useAuth } from '../context/AuthContext'

const AdminMerchants = () => {
  // const { user } = useAuth()
  const [merchants, setMerchants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchMerchants()
  }, [])

  const fetchMerchants = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/merchants', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMerchants(response.data.data)
    } catch (error) {
      console.error('Error fetching merchants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (merchantId, updates) => {
    try {
      setActionLoading(merchantId)
      const token = localStorage.getItem('token')
      await axios.patch(`/api/admin/merchants/${merchantId}/status`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Update local state
      setMerchants(merchants.map(m => 
        m._id === merchantId ? { ...m, ...updates } : m
      ))
    } catch (error) {
      console.error('Error updating merchant status:', error)
      alert('Failed to update merchant status')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = 
      merchant.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (statusFilter === 'all') return matchesSearch
    if (statusFilter === 'kyc_pending') return matchesSearch && merchant.kycStatus === 'pending'
    if (statusFilter === 'active') return matchesSearch && merchant.isActive
    if (statusFilter === 'inactive') return matchesSearch && !merchant.isActive
    
    return matchesSearch
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Merchant Administration</h1>
          <p className="text-sm text-gray-500">Manage merchant accounts and KYC approvals</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchMerchants}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{merchants.length}</h3>
          <p className="text-sm text-gray-500">Total Merchants</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {merchants.filter(m => m.kycStatus === 'pending').length}
          </h3>
          <p className="text-sm text-gray-500">Pending KYC</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {merchants.filter(m => m.isActive).length}
          </h3>
          <p className="text-sm text-gray-500">Active Accounts</p>
        </div>
         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {merchants.filter(m => !m.isActive).length}
          </h3>
          <p className="text-sm text-gray-500">Suspended</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search merchants by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {[
            { id: 'all', label: 'All Merchants' },
            { id: 'kyc_pending', label: 'Pending KYC' },
            { id: 'active', label: 'Active' },
            { id: 'inactive', label: 'Inactive' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === filter.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Merchants Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">KYC Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredMerchants.length > 0 ? (
                filteredMerchants.map((merchant) => (
                  <tr key={merchant._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold mr-3">
                          {merchant.businessName?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <Link to={`/admin/merchants/${merchant._id}`} className="font-medium text-gray-900 hover:text-primary-600 transition-colors">
                            {merchant.businessName}
                          </Link>
                          <div className="text-sm text-gray-500">{merchant.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        merchant.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {merchant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        merchant.kycStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        merchant.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {merchant.kycStatus.charAt(0).toUpperCase() + merchant.kycStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(merchant.totalRevenue || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(merchant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {merchant.kycStatus === 'pending' && (
                          <button 
                            onClick={() => handleStatusUpdate(merchant._id, { kycStatus: 'approved' })}
                            disabled={actionLoading === merchant._id}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            title="Approve KYC"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleStatusUpdate(merchant._id, { isActive: !merchant.isActive })}
                          disabled={actionLoading === merchant._id}
                          className={`p-1.5 rounded ${
                            merchant.isActive 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={merchant.isActive ? "Deactivate Account" : "Activate Account"}
                        >
                          {merchant.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-lg font-medium">No merchants found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminMerchants
