import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Public Pages
import HomePage from './pages/public/HomePage'
import DomainListPage from './pages/public/DomainListPage'
import DomainDetailPage from './pages/public/DomainDetailPage'
import LoginPage from './pages/auth/LoginPage'

// Admin Pages
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDomains from './pages/admin/AdminDomains'
import AdminTransactions from './pages/admin/AdminTransactions'
import AdminCategories from './pages/admin/AdminCategories'
import AdminSettings from './pages/admin/AdminSettings'
import AdminLogin from './pages/admin/AdminLogin'

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/domains/:extension" element={<DomainListPage />} />
          <Route path="/domain/:id" element={<DomainDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="domains" element={<AdminDomains />} />
            <Route path="domains/:extension" element={<AdminDomains />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App