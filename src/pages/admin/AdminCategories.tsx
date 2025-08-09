import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  extension: string
  description: string | null
  is_active: boolean
  created_at: string
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    extension: '',
    description: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('domain_categories')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Gagal memuat kategori')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('domain_categories')
          .update(formData)
          .eq('id', editingCategory.id)

        if (error) throw error
        toast.success('Kategori berhasil diupdate')
      } else {
        const { error } = await supabase
          .from('domain_categories')
          .insert([formData])

        if (error) throw error
        toast.success('Kategori berhasil ditambahkan')
      }

      setShowModal(false)
      setEditingCategory(null)
      setFormData({ name: '', extension: '', description: '' })
      fetchCategories()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan kategori')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      extension: category.extension,
      description: category.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return

    try {
      const { error } = await supabase
        .from('domain_categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Kategori berhasil dihapus')
      fetchCategories()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus kategori')
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('domain_categories')
        .update({ is_active: !isActive })
        .eq('id', id)

      if (error) throw error
      toast.success('Status kategori berhasil diupdate')
      fetchCategories()
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengupdate status kategori')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kategori Domain</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Tambah Kategori
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ekstensi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.extension}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      category.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(category.id, category.is_active)}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      {category.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ekstensi
                </label>
                <input
                  type="text"
                  value={formData.extension}
                  onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                  placeholder="contoh: .COM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingCategory(null)
                    setFormData({ name: '', extension: '', description: '' })
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingCategory ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}