import { useState, useEffect } from 'react'
import rateService from '../services/rateService'
import socketService from '../services/socket'
import { 
  Percent, Plus, Edit2, Trash2, X, Save, 
  RefreshCw, AlertCircle, CheckCircle, Info
} from 'lucide-react'

const AdminRates = () => {
  const [tiers, setTiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTier, setEditingTier] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rate: '',
    minTransactionVolume: '',
    features: '',
    isActive: true
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [includeInactive, setIncludeInactive] = useState(false)

  useEffect(() => {
    fetchTiers()
  }, [includeInactive])

  useEffect(() => {
    setupSocketListeners()
    return () => {
      cleanupSocketListeners()
    }
  }, [])

  const fetchTiers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await rateService.getAllTiers(includeInactive)
      setTiers(data || [])
    } catch (err) {
      console.error('Error fetching tiers:', err)
      setError(err.response?.data?.message || 'Failed to fetch commission tiers')
    } finally {
      setLoading(false)
    }
  }

  const setupSocketListeners = () => {
    // Subscribe to commission tiers collection changes
    socketService.subscribe('commissiontiers')
    
    // Listen for changes
    const handleChange = (change) => {
      if (change && change.operationType) {
        console.log('📡 Commission tier change detected:', change.operationType)
        // Refetch tiers when changes occur
        fetchTiers()
      }
    }

    socketService.on('commissiontiers', handleChange)

    // Store handler for cleanup
    window._commissionTierHandler = handleChange
  }

  const cleanupSocketListeners = () => {
    if (window._commissionTierHandler) {
      socketService.off('commissiontiers', window._commissionTierHandler)
      delete window._commissionTierHandler
    }
    socketService.unsubscribe('commissiontiers')
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      rate: '',
      minTransactionVolume: '',
      features: '',
      isActive: true
    })
    setEditingTier(null)
    setShowForm(false)
    setError(null)
    setSuccess(null)
  }

  const handleEdit = (tier) => {
    setEditingTier(tier)
    setFormData({
      name: tier.name,
      description: tier.description || '',
      rate: tier.rate.toString(),
      minTransactionVolume: tier.minTransactionVolume?.toString() || '',
      features: Array.isArray(tier.features) ? tier.features.join(', ') : '',
      isActive: tier.isActive !== undefined ? tier.isActive : true
    })
    setShowForm(true)
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      // Validate form
      if (!formData.name.trim()) {
        setError('Tier name is required')
        return
      }
      if (!formData.rate || isNaN(formData.rate) || parseFloat(formData.rate) < 0 || parseFloat(formData.rate) > 100) {
        setError('Rate must be a number between 0 and 100')
        return
      }

      const tierData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        rate: parseFloat(formData.rate),
        minTransactionVolume: formData.minTransactionVolume ? parseFloat(formData.minTransactionVolume) : 0,
        features: formData.features 
          ? formData.features.split(',').map(f => f.trim()).filter(f => f.length > 0)
          : [],
        isActive: formData.isActive
      }

      setActionLoading(editingTier ? 'update' : 'create')

      if (editingTier) {
        await rateService.updateTier(editingTier._id, tierData)
        setSuccess('Commission tier updated successfully')
      } else {
        await rateService.createTier(tierData)
        setSuccess('Commission tier created successfully')
      }

      // Reset form and refetch
      resetForm()
      // Socket.IO will trigger refetch, but we can also do it manually
      setTimeout(() => fetchTiers(), 500)
    } catch (err) {
      console.error('Error saving tier:', err)
      setError(err.response?.data?.message || 'Failed to save commission tier')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (tierId) => {
    if (!window.confirm('Are you sure you want to delete this commission tier? This will deactivate it.')) {
      return
    }

    try {
      setActionLoading(tierId)
      setError(null)
      await rateService.deleteTier(tierId)
      setSuccess('Commission tier deleted successfully')
      // Socket.IO will trigger refetch
      setTimeout(() => fetchTiers(), 500)
    } catch (err) {
      console.error('Error deleting tier:', err)
      setError(err.response?.data?.message || 'Failed to delete commission tier')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleActive = async (tier) => {
    try {
      setActionLoading(tier._id)
      setError(null)
      await rateService.updateTier(tier._id, { isActive: !tier.isActive })
      setSuccess(`Commission tier ${!tier.isActive ? 'activated' : 'deactivated'} successfully`)
      // Socket.IO will trigger refetch
      setTimeout(() => fetchTiers(), 500)
    } catch (err) {
      console.error('Error toggling tier status:', err)
      setError(err.response?.data?.message || 'Failed to update tier status')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission Rate Management</h1>
          <p className="text-sm text-gray-500">Manage commission tiers and rates for merchants</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchTiers}
            disabled={loading}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Tier
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
          <button 
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {editingTier ? 'Edit Commission Tier' : 'Create New Commission Tier'}
            </h2>
            <button 
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tier Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="e.g., Enterprise, Standard, Basic"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commission Rate (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="e.g., 5.0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Transaction Volume (XAF)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minTransactionVolume}
                  onChange={(e) => setFormData({ ...formData, minTransactionVolume: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="e.g., 1000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                rows="2"
                placeholder="Brief description of this tier..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features (comma-separated)
              </label>
              <input
                type="text"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., Priority Support, API Access, Custom Reports"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple features with commas</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={actionLoading === 'create' || actionLoading === 'update'}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {actionLoading === 'create' || actionLoading === 'update' ? 'Saving...' : editingTier ? 'Update Tier' : 'Create Tier'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="includeInactive"
          checked={includeInactive}
          onChange={(e) => setIncludeInactive(e.target.checked)}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="includeInactive" className="text-sm text-gray-700">
          Show inactive tiers
        </label>
      </div>

      {/* Tiers List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading commission tiers...</p>
          </div>
        ) : tiers.length === 0 ? (
          <div className="p-12 text-center">
            <Percent className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-lg font-medium text-gray-900">No commission tiers found</p>
            <p className="text-sm text-gray-500 mt-1">
              {includeInactive 
                ? 'Create your first commission tier to get started' 
                : 'No active tiers found. Toggle "Show inactive tiers" to see all tiers.'}
            </p>
            {!includeInactive && (
              <button
                onClick={() => {
                  resetForm()
                  setShowForm(true)
                }}
                className="mt-4 flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Tier
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Volume</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Features</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tiers.map((tier) => (
                  <tr key={tier._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{tier.name}</div>
                        {tier.description && (
                          <div className="text-sm text-gray-500 mt-1">{tier.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                        <Percent className="w-3 h-3 mr-1" />
                        {tier.rate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tier.minTransactionVolume > 0 
                        ? new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(tier.minTransactionVolume)
                        : 'No minimum'
                      }
                    </td>
                    <td className="px-6 py-4">
                      {Array.isArray(tier.features) && tier.features.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {tier.features.slice(0, 2).map((feature, idx) => (
                            <span 
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {feature}
                            </span>
                          ))}
                          {tier.features.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              +{tier.features.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No features</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tier.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tier.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(tier.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(tier)}
                          disabled={actionLoading === tier._id}
                          className={`p-1.5 rounded transition-colors ${
                            tier.isActive
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-green-600 hover:bg-green-50'
                          } disabled:opacity-50`}
                          title={tier.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {tier.isActive ? (
                            <Info className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(tier)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tier._id)}
                          disabled={actionLoading === tier._id}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminRates
