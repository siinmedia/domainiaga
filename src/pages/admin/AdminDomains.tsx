import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react'
import { supabase, Domain } from '../../lib/supabase'
import { formatCurrency, formatDateShort } from '../../lib/utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import DomainFormModal from '../../components/admin/DomainFormModal'
import toast from 'react-hot-toast'

const AdminDomains: React.FC = () => {
  const { extension } = useParams()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])

  useEffect(() => {
    fetchDomains()
  }, [extension])

  const fetchDomains = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('domains')
        .select(`
          *,
          domain_categories(*),
          domain_metrics(*)
        `)
        .order('created_at', { ascending: false })

      // Filter by extension if specified
      if (extension && extension !== 'all') {
        const ext = extension === 'ac-id' ? '.ac.id' : 
                   extension === 'co-id' ? '.co.id' : 
                   extension === 'or-id' ? '.or.id' : 
                   `.${extension}`
        query = query.eq('extension', ext)
      }

      const { data, error } = await query

      if (error) throw error
      setDomains(data || [])
    } catch (error) {
      console.error('Error fetching domains:', error)
      toast.error('Gagal memuat data domain')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (domainId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus domain ini?')) return

    try {
      const { error } = await supabase
        .from('domains')
        .delete()
        .eq('id', domainId)

      if (error) throw error

      toast.success('Domain berhasil dihapus')
      fetchDomains()
    } catch (error) {
      console.error('Error deleting domain:', error)
      toast.error('Gagal menghapus domain')
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedDomains.length === 0) {
      toast.error('Pilih domain terlebih dahulu')
      return
    }

    try {
      let updateData: any = {}
      
      switch (action) {
        case 'feature':
          updateData = { is_featured: true }
          break
        case 'unfeature':
          updateData = { is_featured: false }
          break
        case 'popular':
          updateData = { is_popular: true }
          break
        case 'unpopular':
          updateData = { is_popular: false }
          break
        case 'delete':
          if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedDomains.length} domain?`)) return
          
          const { error } = await supabase
            .from('domains')
            .delete()
            .in('id', selectedDomains)

          if (error) throw error
          toast.success(`${selectedDomains.length} domain berhasil dihapus`)
          setSelectedDomains([])
          fetchDomains()
          return
      }

      const { error } = await supabase
        .from('domains')
        .update(updateData)
        .in('id', selectedDomains)

      if (error) throw error

      toast.success(`${selectedDomains.length} domain berhasil diperbarui`)
      setSelectedDomains([])
      fetchDomains()
    } catch (error) {
      console.error('Error updating domains:', error)
      toast.error('Gagal memperbarui domain')
    }
  }

  const filteredDomains = domains.filter(domain => {
    const matchesSearch = domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         domain.extension.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'sold' && domain.is_sold) ||
                         (filterStatus === 'available' && !domain.is_sold) ||
                         (filterStatus === 'featured' && domain.is_featured) ||
                         (filterStatus === 'popular' && domain.is_popular)

    return matchesSearch && matchesFilter
  })

  const getExtensionTitle = () => {
    if (!extension || extension === 'all') return 'Semua Domain'
    
    const titles: { [key: string]: string } = {
      'id': 'Domain .ID',
      'com': 'Domain .COM',
      'org': 'Domain .ORG',
      'ac-id': 'Domain .AC.ID',
      'co-id': 'Domain .CO.ID',
      'or-id': 'Domain .OR.ID'
    }
    
    return titles[extension] || `Domain .${extension.toUpperCase()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getExtensionTitle()}</h1>
          <p className="text-gray-600">Kelola domain dalam kategori ini</p>
        </div>
        <button
          onClick={() => {
            setEditingDomain(null)
            setShowModal(true)
          }}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Domain</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="available">Tersedia</option>
              <option value="sold">Terjual</option>
              <option value="featured">Unggulan</option>
              <option value="popular">Populer</option>
            </select>
          </div>

          {selectedDomains.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedDomains.length} dipilih
              </span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkAction(e.target.value)
                    e.target.value = ''
                  }
                }}
                className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Aksi Massal</option>
                <option value="feature">Jadikan Unggulan</option>
                <option value="unfeature">Hapus dari Unggulan</option>
                <option value="popular">Jadikan Populer</option>
                <option value="unpopular">Hapus dari Populer</option>
                <option value="delete">Hapus</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Domain List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDomains.length === filteredDomains.length && filteredDomains.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDomains(filteredDomains.map(d => d.id))
                        } else {
                          setSelectedDomains([])
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metrik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDomains.map((domain) => (
                  <tr key={domain.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDomains.includes(domain.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDomains([...selectedDomains, domain.id])
                          } else {
                            setSelectedDomains(selectedDomains.filter(id => id !== domain.id))
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {domain.name}<span className="text-primary-600">{domain.extension}</span>
                        </div>
                        <div className="text-sm text-gray-500">{domain.registrar}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          {domain.is_featured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 mr-1" />
                              Unggulan
                            </span>
                          )}
                          {domain.is_popular && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Populer
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(domain.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        domain.is_sold 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {domain.is_sold ? 'Terjual' : 'Tersedia'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {domain.domain_metrics && (
                        <div className="flex space-x-2 text-xs">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            DA: {domain.domain_metrics.da}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            DR: {domain.domain_metrics.dr}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>Dibuat: {formatDateShort(domain.created_at)}</div>
                      <div>Expired: {formatDateShort(domain.expiry_date)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/domain/${domain.id}`}
                          className="text-primary-600 hover:text-primary-900"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setEditingDomain(domain)
                            setShowModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(domain.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Hapus"
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
          
          {filteredDomains.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada domain yang ditemukan</p>
            </div>
          )}
        </div>
      )}

      {/* Domain Form Modal */}
      {showModal && (
        <DomainFormModal
          domain={editingDomain}
          onClose={() => {
            setShowModal(false)
            setEditingDomain(null)
          }}
          onSuccess={() => {
            setShowModal(false)
            setEditingDomain(null)
            fetchDomains()
          }}
        />
      )}
    </div>
  )
}

export default AdminDomains