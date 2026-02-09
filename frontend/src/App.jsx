import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import ApiKeys from './pages/ApiKeys'
import Settlements from './pages/Settlements'
import Documentation from './pages/Documentation'
import Profile from './pages/Profile'
import KYC from './pages/KYC'
import DashboardLayout from './components/DashboardLayout'
import AdminMerchants from './pages/AdminMerchants'
import AdminMerchantDetails from './pages/AdminMerchantDetails'
import PublicDocs from './pages/PublicDocs'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/documentation" element={<PublicDocs />} />
        
        {/* Protected Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/api-keys" element={<ApiKeys />} />
          <Route path="/settlements" element={<Settlements />} />
          <Route path="/kyc" element={<KYC />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/merchants" element={<AdminMerchants />} />
          <Route path="/admin/merchants/:id" element={<AdminMerchantDetails />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
