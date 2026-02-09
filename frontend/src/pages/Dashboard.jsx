import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  DollarSign, TrendingUp, CreditCard, Users, 
  ArrowUpRight, ArrowDownRight, Clock 
} from 'lucide-react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import transactionService from '../services/transactionService'
import settlementService from '../services/settlementService'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StatCard = ({ title, value, change, icon: Icon, trend }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-primary-50 rounded-lg">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      {trend && (
        <span className={`flex items-center text-sm font-medium ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
          {change}
        </span>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
)

const Dashboard = () => {
  const [stats, setStats] = useState({
    balance: 0,
    totalRevenue: 0,
    totalVolume: 0,
    transactionCount: 0
  })
  const [recentTransactions, setRecentTransactions] = useState([])
  const [chartData, setChartData] = useState([])
  const [pieData, setPieData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch balance
        const balanceData = await settlementService.getBalance()
        setStats(prev => ({
          ...prev,
          balance: balanceData?.balance || 0,
          totalRevenue: balanceData?.totalRevenue || 0
        }))

        // Fetch analytics
        const analytics = await transactionService.getAnalytics()
        setChartData(analytics.dailyVolume || [])
        setPieData(analytics.statusDistribution || [])

        // Fetch recent transactions
        const transactions = await transactionService.getTransactions({ limit: 5 })
        setRecentTransactions(transactions?.docs || [])
        setStats(prev => ({
          ...prev,
          transactionCount: transactions?.totalDocs || 0,
          totalVolume: transactions?.docs?.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0) || 0
        }))

        setLoading(false)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setLoading(false)
      }
    }

    fetchData()

    // Real-time listeners
    const unsubscribeTransactions = transactionService.subscribe((data) => {
      if (data && Array.isArray(data)) {
        setRecentTransactions(data.slice(0, 5))
        // Ideally re-fetch analytics here too, but for now we skip to avoid heavy load
      }
    })

    return () => {
      unsubscribeTransactions()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-600">Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Available Balance" 
          value={`XAF ${stats.balance.toLocaleString()}`}
          change="+12.5%"
          trend="up"
          icon={DollarSign}
        />
        <StatCard 
          title="Total Revenue" 
          value={`XAF ${stats.totalRevenue.toLocaleString()}`}
          change="+8.2%"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard 
          title="Transaction Volume" 
          value={`XAF ${stats.totalVolume.toLocaleString()}`}
          change="-2.4%"
          trend="down"
          icon={CreditCard}
        />
        <StatCard 
          title="Total Transactions" 
          value={stats.transactionCount}
          change="+5.1%"
          trend="up"
          icon={Clock}
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorVolume)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-gray-900 mb-6">Transaction Status</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={pieData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   fill="#8884d8"
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {pieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
                 <Legend />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
            <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    tx.status === 'success' ? 'bg-green-100 text-green-600' : 
                    tx.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {tx.status === 'success' ? <ArrowDownRight className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {tx.customerPhone || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    XAF {tx.totalAmount.toLocaleString()}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                     tx.status === 'success' ? 'bg-green-100 text-green-700' : 
                     tx.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No recent transactions
              </div>
            )}
          </div>
        </div>
    </div>
  )
}

export default Dashboard
