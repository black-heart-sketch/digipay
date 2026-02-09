import { useState, useEffect } from 'react'
import { User, Mail, Phone, Building, Globe, Save, AlertCircle } from 'lucide-react'
import api from '../services/api'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [merchant, setMerchant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile')
      setUser(response.data.data.user)
      setMerchant(response.data.data.merchant)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    setLoading(true)

    try {
      const response = await api.put('/auth/profile', {
        businessName: e.target.elements[0].value, // Business Name input
        businessType: e.target.elements[1].value, // Business Type select
        phone: e.target.elements[3].value, // Phone input
        country: e.target.elements[4].value, // Country input 
        feePayer: merchant.feePayer
      })
      
      setUser(response.data.data.user)
      setMerchant(response.data.data.merchant)
      setMsg({ type: 'success', text: 'Profile updated successfully' })
    } catch (error) {
      console.error('Error updating profile:', error)
      setMsg({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600">Manage your profile and business details.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-3xl font-bold mx-auto mb-4">
              {user?.email[0].toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{merchant?.businessName}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <div className={`mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              merchant?.kycStatus === 'approved' ? 'bg-green-100 text-green-700' :
              merchant?.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                merchant?.kycStatus === 'approved' ? 'bg-green-500' :
                merchant?.kycStatus === 'pending' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></span>
              {merchant?.kycStatus === 'approved' ? 'Verified Merchant' : 
               merchant?.kycStatus === 'pending' ? 'Verification Pending' : 
               'Unverified Merchant'}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Business Information</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {msg.text && (
                <div className={`p-4 rounded-lg flex items-center ${
                  msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {msg.text}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      defaultValue={merchant?.businessName}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                  <select
                    defaultValue={merchant?.businessType}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas">SaaS</option>
                    <option value="marketplace">Marketplace</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      defaultValue={user?.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      defaultValue={merchant?.phone}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      defaultValue={merchant?.country}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee Configuration</label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">Who pays the transaction fees?</p>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="feePayer"
                          value="merchant"
                          checked={merchant?.feePayer === 'merchant' || !merchant?.feePayer}
                          onChange={(e) => setMerchant({...merchant, feePayer: e.target.value})}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Me (Merchant)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="feePayer"
                          value="client"
                          checked={merchant?.feePayer === 'client'}
                          onChange={(e) => setMerchant({...merchant, feePayer: e.target.value})}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Client (Customer)</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {merchant?.feePayer === 'client' 
                        ? 'Customer pays 5% on top (e.g. 1000 request -> Customer pays 1050 -> You get 1000)' 
                        : 'Fees deducted from your revenue (e.g. 1000 request -> Customer pays 1000 -> You get 950)'}
                    </p>
                  </div>
                </div>

              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
