import React, { useState, useEffect } from 'react'
import { 
  Globe, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Eye,
  ShoppingCart,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

interface DashboardStats {
  totalDomains: number
  soldDomains: number
  totalRevenue: number
  pendingTransactions: number
  expiringDomains: number
  popularDomains: number
  recentTransactions: any[]
  topDomains: any[]
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalDomains: 0,
    soldDomains: 0,
    totalRevenue: 0,
    pendingTransactions: 0,
    expiringDomains: 0,
    popularDomains: 0,
    recentTransactions: [],
    topDomains: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch domain statistics
      const { data: domains } = await supabase
        .from('domains')
        .select('*')

      const { data: soldDomains } = await supabase
        .from('domains')
        .select('*')
        .eq('is_sold', true)

      // Fetch transaction statistics
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'completed')

      const { data: pendingTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'pending')

      // Fetch expiring domains (within 30 days)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      
      const { data: expiringDomains } = await supabase
        .from('domains')
        .select('*')
        .eq('is_sold', false)
        .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])

      // Fetch recent transactions
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select(`
          *,
          domains(name, extension, price)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch top viewed domains
      const { data: topDomains } = await supabase
        .from('domains')
        .select('*')
        .eq('is_sold', false)
        .order('view_count', { ascending: false })
        .limit(5)

      // Calculate total revenue
      const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0

      setStats({
        totalDomains: domains?.length || 0,
        soldDomains: soldDomains?.length || 0,
        totalRevenue,
        pendingTransactions: pendingTransactions?.length || 0,
        expiringDomains: expiringDomains?.length || 0,
        popularDomains: domains?.filter(d => d.is_popular).length || 0,
        recentTransactions: recentTransactions || [],
        topDomains: topDomains || []
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Domain',
      value: stats.totalDomains,
      icon: Globe,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Domain Terjual',
      value: stats.soldDomains,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Pendapatan',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Transaksi Pending',
      value: stats.pendingTransactions,
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Domain Akan Expired',
      value: stats.expiringDomains,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      title: 'Domain Populer',
      value: stats.popularDomains,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Ringkasan aktivitas dan statistik domain</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-100`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>
                    {typeof stat.value === 'number' && stat.title !== 'Total Pendapatan' 
                      ? stat.value.toLocaleString() 
                      : stat.value
                    }
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Transaksi Terbaru
          </h3>
          <div className="space-y-4">
            {stats.recentTransactions.length > 0 ? (
              stats.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.domains?.name}{transaction.domains?.extension}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Belum ada transaksi</p>
            )}
          </div>
        </div>

        {/* Top Domains */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Domain Paling Dilihat
          </h3>
          <div className="space-y-4">
            {stats.topDomains.length > 0 ? (
              stats.topDomains.map((domain, index) => (
                <div key={domain.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {domain.name}{domain.extension}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(domain.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{domain.view_count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Belum ada data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard