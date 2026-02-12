import { useState, useEffect } from 'react'
import { 
  Plus, CheckCircle, AlertCircle, Clock, Wallet, ArrowDownLeft, ArrowUpRight,
  RefreshCw, Search, Filter, X, TrendingUp, TrendingDown
} from 'lucide-react'
import settlementService from '../services/settlementService'
import transactionService from '../services/transactionService'

const Settlements = () => {
  const [activeTab, setActiveTab] = useState('payouts')
  const [settlements, setSettlements] = useState([])
  const [payins, setPayins] = useState([])
  const [balance, setBalance] = useState({ available: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPayinModal, setShowPayinModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [payinAmount, setPayinAmount] = useState('')
  const [payoutPhone, setPayoutPhone] = useState('')
  const [payerPhone, setPayerPhone] = useState('')
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()

    // Subscribe to real-time updates
    const unsubscribeSettlements = settlementService.subscribe((data) => {
      // Direct update if data is array (list of settlements)
      if (data && Array.isArray(data)) {
        setSettlements(data)
      } else if (data) {
        // If it's a single update notification, we might need to verify logic,
        // but for now, let's assume the service maintains the list in this.data
        // and passes it here.
        // Actually BaseService passes this.data which is the full list.
         if (Array.isArray(data)) setSettlements(data);
      }
    })
    
    // Subscribe to transactions (payins)
    const unsubscribeTransactions = transactionService.subscribe((data) => {
      if (data && Array.isArray(data)) {
        // Filter for success status if that's what payins imply, or just update logic
        // The original fetchPayins used { status: 'success' }.
        // Start simple: just re-fetch ONLY if we really need to, but better to avoid it.
        // For payins, since it's a filtered list, we might ideally want the service to handle it.
        // BUT to stop the loop, let's just NOT react to every transaction update by fetching everything.
        // Let's only fetch if it's explicitly needed, or debounce it.
        // Ideally:
        // if (data) fetchPayins() // This caused the loop if fetchPayins -> getTransactions -> notify -> loop
        
        // Safer approach:
        // Only fetch payins on mount. Real-time updates for *filtered* lists are tricky with the current BaseService.
        // We will disable the auto-refetch on transaction update for now to stop the loop/429.
        // verification: user can manually refresh or we can implement smarter updates later.
      }
    })

    return () => {
      unsubscribeSettlements()
      unsubscribeTransactions()
    }
  }, [])

  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      
      const balanceData = await settlementService.getBalance()
      setBalance({
        available: balanceData.balance || 0,
        pending: 0
      })

      const settlementsData = await settlementService.getSettlements()
      setSettlements(settlementsData.settlements || settlementsData.docs || [])
      
      await fetchPayins()
      
      setLoading(false)
      setRefreshing(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchPayins = async () => {
    try {
      // Fetch successful transactions (payins)
      const transactions = await transactionService.getTransactions({ status: 'success', limit: 50 })
      setPayins(transactions.docs || transactions || [])
    } catch (error) {
      console.error('Error fetching payins:', error)
      setPayins([])
    }
  }

  const handleRequestSettlement = async (e) => {
    e.preventDefault()
    setError('')

    const value = parseFloat(amount)
    
    // Validate amount
    if (!amount || isNaN(value) || value <= 0) {
      setError('Please enter a valid amount greater than 0')
      return
    }
    
    if (value < 1000) {
      setError('Minimum settlement amount is XAF 1,000')
      return
    }
    
    // Check if amount exceeds available balance
    if (value > balance.available) {
      setError(`Insufficient balance. Available: XAF ${balance.available.toLocaleString()}, Requested: XAF ${value.toLocaleString()}`)
      return
    }

    try {
      await settlementService.requestSettlement(value, payoutPhone)
      setShowModal(false)
      setAmount('')
      setPayoutPhone('')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request settlement')
    }
  }

  const handlePayin = async (e) => {
    e.preventDefault()
    setError('')

    const value = parseFloat(payinAmount)
    if (value < 100) {
      setError('Minimum payin amount is XAF 100')
      return
    }

    try {
      await transactionService.initiatePayment({
        amount: value,
        customerPhone: payerPhone
      })
      setShowPayinModal(false)
      setPayinAmount('')
      setPayerPhone('')
      // Give it a moment to process then fetch
      setTimeout(() => {
        fetchPayins()
        fetchData() // Update balance too
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settlements & Payins</h1>
          <p className="text-gray-600">Manage your funds and transaction history.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowPayinModal(true)}
            className="bg-white text-primary-600 border border-primary-200 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center shadow-sm hover:shadow"
          >
            <ArrowDownLeft className="w-4 h-4 mr-2" />
            Add Funds
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Request Payout
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 font-medium mb-1">Available Balance</p>
            <h2 className="text-4xl font-bold">XAF {balance.available.toLocaleString()}</h2>
          </div>
          <div className="bg-white/10 p-3 rounded-xl">
            <Wallet className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="mt-8 flex items-center space-x-2 text-sm text-gray-400">
          <AlertCircle className="w-4 h-4" />
          <span>Payouts are processed within 24 hours</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('payouts')
              setSearchTerm('')
              setStatusFilter('all')
            }}
            className={`${
              activeTab === 'payouts'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Payouts (Withdrawals)
            {settlements.length > 0 && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {settlements.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('payins')
              setSearchTerm('')
              setStatusFilter('all')
            }}
            className={`${
              activeTab === 'payins'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Payins (Deposits)
            {payins.length > 0 && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {payins.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      {!loading && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={activeTab === 'payouts' ? 'Search by settlement ID, phone...' : 'Search by transaction ID, phone...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {activeTab === 'payouts' && (
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {['all', 'pending', 'processing', 'completed', 'failed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    statusFilter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : activeTab === 'payouts' ? (
          // Payouts List
          (() => {
            const filteredSettlements = settlements.filter(settlement => {
              const matchesSearch = !searchTerm || 
                settlement.settlementId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                settlement.recipientPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                settlement.freemopayWithdrawReference?.toLowerCase().includes(searchTerm.toLowerCase())
              
              const matchesStatus = statusFilter === 'all' || settlement.status === statusFilter
              
              return matchesSearch && matchesStatus
            })

            return filteredSettlements.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-900">
                  {settlements.length === 0 ? 'No Settlements Yet' : 'No matching settlements'}
                </p>
                <p className="mt-1">
                  {settlements.length === 0 
                    ? 'Your payout history will appear here.' 
                    : 'Try adjusting your search or filters.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredSettlements.map((settlement) => (
                  <div key={settlement._id || settlement.settlementId} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`p-3 rounded-full transition-transform group-hover:scale-110 ${
                        settlement.status === 'completed' ? 'bg-green-100 text-green-600' :
                        settlement.status === 'failed' ? 'bg-red-100 text-red-600' : 
                        settlement.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {settlement.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : settlement.status === 'failed' ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 capitalize flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Payout 
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            settlement.status === 'completed' ? 'bg-green-100 text-green-700' :
                            settlement.status === 'failed' ? 'bg-red-100 text-red-700' : 
                            settlement.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>{settlement.status}</span>
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(settlement.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} • To: {settlement.recipientPhone}
                        </p>
                        {settlement.settlementId && (
                          <p className="text-xs text-gray-400 mt-1 font-mono">
                            ID: {settlement.settlementId}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-red-600 text-lg">- XAF {(settlement.amount || 0).toLocaleString()}</p>
                      {settlement.freemopayWithdrawReference && (
                        <p className="text-xs text-gray-400 mt-1 font-mono break-all max-w-[150px]">
                          Ref: {settlement.freemopayWithdrawReference}
                        </p>
                      )}
                      {settlement.completedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Completed: {new Date(settlement.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()
        ) : (
          // Payins List
          (() => {
            const filteredPayins = payins.filter(payin => {
              if (!searchTerm) return true
              const search = searchTerm.toLowerCase()
              return (
                payin.transactionId?.toLowerCase().includes(search) ||
                payin.customerPhone?.toLowerCase().includes(search) ||
                payin.freemopayReference?.toLowerCase().includes(search) ||
                (payin.totalAmount && payin.totalAmount.toString().includes(search))
              )
            })

            return filteredPayins.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <ArrowDownLeft className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-900">
                  {payins.length === 0 ? 'No Payins Yet' : 'No matching transactions'}
                </p>
                <p className="mt-1">
                  {payins.length === 0 
                    ? 'Successful transactions will appear here.' 
                    : 'Try adjusting your search.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredPayins.map((payin) => (
                  <div key={payin._id || payin.transactionId} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="p-3 rounded-full bg-green-100 text-green-600 transition-transform group-hover:scale-110">
                        <ArrowDownLeft className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 capitalize flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-green-600" />
                          Payment Received
                          {payin.status && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              payin.status === 'success' ? 'bg-green-100 text-green-700' :
                              payin.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>{payin.status}</span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(payin.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} • From: {payin.customerPhone || 'Unknown'}
                        </p>
                        {payin.transactionId && (
                          <p className="text-xs text-gray-400 mt-1 font-mono">
                            TXN: {payin.transactionId}
                          </p>
                        )}
                        {payin.commissionAmount && payin.commissionAmount > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Commission: XAF {payin.commissionAmount.toLocaleString()} ({payin.commissionRate}%)
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-green-600 text-lg">
                        + XAF {(payin.totalAmount || payin.amount || 0).toLocaleString()}
                      </p>
                      {payin.baseAmount && payin.baseAmount !== payin.totalAmount && (
                        <p className="text-xs text-gray-500 mt-1">
                          Net: XAF {payin.baseAmount.toLocaleString()}
                        </p>
                      )}
                      {payin.freemopayReference && (
                        <p className="text-xs text-gray-400 mt-1 font-mono break-all max-w-[150px]">
                          Ref: {payin.freemopayReference}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()
        )}
      </div>

      {/* Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Request Payout</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleRequestSettlement}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (XAF)</label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      required
                      min="1000"
                      max={balance.available}
                      step="0.01"
                      value={amount}
                      onChange={(e) => {
                        const inputValue = e.target.value
                        const numValue = parseFloat(inputValue)
                        // Prevent entering amount greater than available balance
                        if (inputValue === '' || (!isNaN(numValue) && numValue <= balance.available)) {
                          setAmount(inputValue)
                        }
                      }}
                      placeholder="0.00"
                      className={`w-full pl-10 pr-20 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        amount && parseFloat(amount) > balance.available 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setAmount(balance.available.toString())}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-primary-600 hover:text-primary-700 font-medium px-2 py-1 rounded bg-primary-50 hover:bg-primary-100 transition-colors"
                    >
                      Max
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Available: XAF {balance.available.toLocaleString()}
                    {amount && parseFloat(amount) > balance.available && (
                      <span className="text-red-600 ml-2 font-medium">
                        (Amount exceeds available balance)
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payout Number</label>
                  <input
                    type="tel"
                    placeholder="e.g 612345678"
                    value={payoutPhone}
                    onChange={(e) => setPayoutPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to use default merchant number
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                >
                  Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Payin Modal */}
      {showPayinModal && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Add Funds (Pay In)</h3>
              <button onClick={() => setShowPayinModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handlePayin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (XAF)</label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      required
                      min="100"
                      value={payinAmount}
                      onChange={(e) => setPayinAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Money Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g 237612345678"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number to be charged
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPayinModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                >
                  Add Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settlements
