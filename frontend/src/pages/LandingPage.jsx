import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Zap, Shield, Globe, Code, ArrowRight, CheckCircle, 
  TrendingUp, Lock, Webhook, CreditCard, Users, BarChart3,
  Sparkles, Terminal, Coins
} from 'lucide-react'

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gradient">DigiPay</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-primary-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-primary-600 transition-colors">Pricing</a>
              <a href="#docs" className="text-gray-700 hover:text-primary-600 transition-colors">Docs</a>
              {localStorage.getItem('token') ? (
                <Link to="/dashboard" className="bg-primary-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all font-medium">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">Login</Link>
                  <Link to="/register" className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-block">
                <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
                  🚀 Built on FreemoPay
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="text-gray-900">Payment API</span>
                <br />
                <span className="text-gradient animate-glow">Built for Scale</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Accept payments seamlessly with our powerful API. KYC verification, 
                real-time webhooks, and automatic settlements. Start in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center group">
                  Start Building
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#docs" className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-primary-600 hover:text-primary-600 transition-all flex items-center justify-center">
                  <Terminal className="mr-2 w-5 h-5" />
                  View Docs
                </a>
              </div>
              <div className="flex items-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Live in 5 minutes</span>
                </div>
              </div>
            </div>

            {/* Hero Animation */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 card-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-500">API Request</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Live</span>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`POST /api/payments/initiate
{
  "amount": 5000,
  "customerPhone": "237612345678",
  "metadata": {
    "orderId": "ORD-12345"
  }
}`}
                </pre>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Response</span>
                    <span className="text-green-600 font-semibold">200 OK</span>
                  </div>
                  <pre className="mt-2 bg-gray-50 text-gray-800 p-3 rounded-lg text-xs font-mono">
{`{
  "success": true,
  "transactionId": "TXN_A1B2C3D4",
  "amount": 5000,
  "status": "pending"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Uptime', value: '99.9%', icon: TrendingUp },
              { label: 'Transactions', value: '1M+', icon: CreditCard },
              { label: 'Merchants', value: '500+', icon: Users },
              { label: 'Countries', value: '10+', icon: Globe },
            ].map((stat, idx) => (
              <div key={idx} className="text-center space-y-2">
                <stat.icon className="w-8 h-8 mx-auto text-primary-600" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to accept payments
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features to scale your business with confidence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Process payments in milliseconds with our optimized infrastructure',
                color: 'from-yellow-400 to-orange-500'
              },
              {
                icon: Shield,
                title: 'KYC Verified',
                description: 'Built-in merchant verification and compliance management',
                color: 'from-green-400 to-emerald-500'
              },
              {
                icon: Webhook,
                title: 'Real-time Webhooks',
                description: 'Get instant notifications for all payment events',
                color: 'from-blue-400 to-cyan-500'
              },
              {
                icon: Code,
                title: 'Developer Friendly',
                description: 'RESTful API with comprehensive documentation and SDKs',
                color: 'from-purple-400 to-pink-500'
              },
              {
                icon: Lock,
                title: 'Secure & Reliable',
                description: 'Bank-grade encryption with 99.9% uptime guarantee',
                color: 'from-red-400 to-rose-500'
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                description: 'Track transactions, revenue, and performance in real-time',
                color: 'from-indigo-400 to-blue-500'
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all group cursor-pointer card-shadow">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Pay only for what you use. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Standard',
                rate: '2.0%',
                features: ['All payment methods', 'Webhook notifications', 'Email support', 'API access'],
                popular: false
              },
              {
                name: 'Premium',
                rate: '1.5%',
                features: ['Everything in Standard', 'Priority support', 'Custom integration', 'Volume discounts'],
                popular: true
              },
              {
                name: 'Enterprise',
                rate: '1.0%',
                features: ['Everything in Premium', 'Dedicated account manager', 'SLA guarantee', 'White-label option'],
                popular: false
              },
            ].map((tier, idx) => (
              <div key={idx} className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 ${
                tier.popular ? 'ring-2 ring-accent-500 scale-105' : ''
              }`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold">{tier.rate}</span>
                  <span className="text-gray-300"> per transaction</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`block w-full py-3 rounded-lg font-semibold text-center transition-all ${
                  tier.popular 
                    ? 'bg-gradient-to-r from-accent-500 to-accent-600 hover:shadow-xl' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl p-12 shadow-2xl">
            <Sparkles className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join hundreds of merchants already using DigiPay
            </p>
            <Link to="/register" className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Coins className="w-6 h-6" />
                <span className="text-xl font-bold">DigiPay</span>
              </div>
              <p className="text-gray-400">
                Modern payment API platform built on FreemoPay
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DigiPay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
