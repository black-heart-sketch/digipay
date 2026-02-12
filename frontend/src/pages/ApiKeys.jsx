import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, Trash2, Copy, Check, Key, Shield, AlertTriangle, Eye, EyeOff 
} from 'lucide-react'
import apiKeyService from '../services/apiKeyService'
import api from '../services/api'

const ApiKeys = () => {
  const [keys, setKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newKeyData, setNewKeyData] = useState({ name: '', environment: 'test' })
  const [generatedKey, setGeneratedKey] = useState(null)
  const [copied, setCopied] = useState(false)
  const [kycStatus, setKycStatus] = useState(null)
  const [kycLoading, setKycLoading] = useState(true)

  useEffect(() => {
    // Fetch KYC status
    fetchKycStatus()
    // Initial fetch
    fetchKeys()

    // Subscribe to real-time updates
    const unsubscribe = apiKeyService.subscribe((updatedKeys) => {
      if (updatedKeys) {
        setKeys(updatedKeys)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const fetchKycStatus = async () => {
    try {
      const response = await api.get('/auth/profile')
      setKycStatus(response.data.data.merchant?.kycStatus || 'pending')
    } catch (error) {
      console.error('Error fetching KYC status:', error)
    } finally {
      setKycLoading(false)
    }
  }

  const fetchKeys = async () => {
    try {
      const data = await apiKeyService.getKeys()
      setKeys(data || [])
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    try {
      console.log('Generating key with data:', newKeyData)
      const result = await apiKeyService.generateKey(newKeyData)
      setGeneratedKey(result)
      setShowModal(false)
      // fetchKeys() - Removed, let socket handle update
      setNewKeyData({ name: '', environment: 'test' })
    } catch (error) {
      console.error('Error generating key:', error)
    }
  }

  const handleRevoke = async (id) => {
    if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      try {
        await apiKeyService.revokeKey(id)
        // fetchKeys() - Removed, let socket handle update
      } catch (error) {
        console.error('Error revoking key:', error)
      }
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-600">Manage your API keys for integration.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          disabled={kycStatus !== 'approved'}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          title={kycStatus !== 'approved' ? 'KYC verification required' : ''}
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate New Key
        </button>
      </div>

      {/* KYC Warning */}
      {!kycLoading && kycStatus !== 'approved' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-yellow-900">KYC Verification Required</h3>
            <p className="text-yellow-700 text-sm mt-1">
              {kycStatus === 'pending' && 'You must complete KYC verification before you can generate API keys.'}
              {kycStatus === 'under_review' && 'Your KYC documents are under review. You\'ll be able to generate API keys once approved.'}
              {kycStatus === 'rejected' && 'Your KYC verification was rejected. Please re-submit your documents.'}
            </p>
            <Link
              to="/kyc"
              className="inline-block mt-3 text-yellow-900 font-semibold hover:text-yellow-800 underline"
            >
              {kycStatus === 'pending' ? 'Complete KYC Verification →' : 'View KYC Status →'}
            </Link>
          </div>
        </div>
      )}

      {/* Generated Key Modal/Alert */}
      {generatedKey && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 relative">
          <button 
            onClick={() => setGeneratedKey(null)}
            className="absolute top-4 right-4 text-green-700 hover:text-green-900"
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Key className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900">New API Key Generated</h3>
              <p className="text-green-700 mt-1 mb-4">
                Please copy your API key now. For security reasons, it will not be shown again.
              </p>
              
              <div className="bg-white border border-green-200 rounded-lg p-3 flex items-center justify-between font-mono text-sm break-all">
                <span>{generatedKey.key}</span>
                <button 
                  onClick={() => copyToClipboard(generatedKey.key)}
                  className="ml-3 p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keys List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">No API Keys Found</p>
            <p className="mt-1">Generate your first API key to start integrating.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {keys.map((key) => (
              <div key={key._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${key.isActive ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                       <h3 className="font-bold text-gray-900">{key.name}</h3>
                       <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                         key.environment === 'live' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                       }`}>
                         {key.environment}
                       </span>
                       {!key.isActive && (
                         <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Revoked</span>
                       )}
                    </div>
                    <p className="text-sm font-mono text-gray-500 mt-1">
                      {key.key} • Created {new Date(key.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Last used: {key.lastUsed ? new Date(key.lastUsed).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
                
                {key.isActive && (
                  <button 
                    onClick={() => handleRevoke(key._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Revoke Key"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Generate New API Key</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleGenerate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
                  <input
                    type="text"
                    required
                    value={newKeyData.name}
                    onChange={(e) => setNewKeyData({...newKeyData, name: e.target.value})}
                    placeholder="e.g. Website Checkout"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                  <select
                    value={newKeyData.environment}
                    onChange={(e) => setNewKeyData({...newKeyData, environment: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="test">Test</option>
                    <option value="live">Live</option>
                  </select>
                </div>
              </div>

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
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApiKeys
