import { useState, useEffect } from 'react'
import { 
  Search, Filter, Download, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  CheckCircle, XCircle, Clock, AlertCircle
} from 'lucide-react'
import transactionService from '../services/transactionService'

const StatusBadge = ({ status }) => {
  const styles = {
    success: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
  }
  
  const icons = {
    success: CheckCircle,
    failed: XCircle,
    pending: Clock,
  }

  const Icon = icons[status] || AlertCircle

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </span>
  )
}

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  })

  useEffect(() => {
    fetchTransactions()

    // Subscribe to real-time updates
    const unsubscribe = transactionService.subscribe((data) => {
      // Apply client-side filtering if needed, or just update
      if (data && Array.isArray(data)) {
        setTransactions(data)
      }
    })

    return () => unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const data = await transactionService.getTransactions(filters)
      setTransactions(data.docs || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchTransactions()
  }

  const [showStatusModal, setShowStatusModal] = useState(false)
  const [checkId, setCheckId] = useState('')
  const [checkResult, setCheckResult] = useState(null)
  const [checkLoading, setCheckLoading] = useState(false)
  const [checkError, setCheckError] = useState('')

  const handleCheckStatus = async (e) => {
    e.preventDefault()
    if (!checkId.trim()) return
    
    setCheckLoading(true)
    setCheckError('')
    setCheckResult(null)

    try {
      const result = await transactionService.getTransaction(checkId.trim())
      setCheckResult(result.data || result) // Handle if service returns wrapper or direct data
    } catch (err) {
      setCheckError(err.response?.data?.message || 'Transaction not found')
    } finally {
      setCheckLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">View and manage all your payment transactions.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowStatusModal(true)}
            className="inline-flex items-center px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg shadow-sm text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            <Search className="w-4 h-4 mr-2" />
            Check Status
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by ID, phone, or customer..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-48">
            <select
              name="status"
              value={filters.status}
              onChange={(e) => {
                handleFilterChange(e)
                // Trigger fetch immediately on select change
                fetchTransactions()
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tx.transactionId || tx._id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.customerPhone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      XAF {tx.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => {
                          setCheckId(tx.transactionId || tx._id)
                          setShowStatusModal(true)
                          // Optionally auto-trigger the check
                          // handleCheckStatus({ preventDefault: () => {} }) 
                        }}
                        className="text-primary-600 hover:text-primary-900 bg-primary-50 p-2 rounded-full hover:bg-primary-100 transition-colors"
                        title="Check Status"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Check Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Check Transaction Status</h3>
              <button 
                onClick={() => {
                  setShowStatusModal(false)
                  setCheckResult(null)
                  setCheckId('')
                  setCheckError('')
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCheckStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={checkId}
                    onChange={(e) => setCheckId(e.target.value)}
                    placeholder="TXN_..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={checkLoading}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {checkLoading ? '...' : 'Check'}
                  </button>
                </div>
              </div>

              {checkError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {checkError}
                </div>
              )}

              {checkResult && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Status</span>
                    <StatusBadge status={checkResult.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="font-medium text-gray-900">XAF {checkResult.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Customer</span>
                    <span className="font-medium text-gray-900">{checkResult.customerPhone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Date</span>
                    <span className="font-medium text-gray-900 text-sm">{new Date(checkResult.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions
