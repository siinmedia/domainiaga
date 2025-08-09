import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const { user } = useAuth()
  const [adminData, setAdminData] = useState({
    full_name: '',
    email: '',
    role: ''
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchAdminData()
  }, [user])

  const fetchAdminData = async () => {
    if (!user?.email) return

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .single()

      if (error) throw error
      
      setAdminData({
        full_name: data.full_name || '',
        email: data.email || '',
        role: data.role || ''
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Gagal memuat data admin')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const { error } = await supabase
        .from('admins')
        .update({
          full_name: adminData.full_name,
          updated_at: new Date().toISOString()
        })
        .eq('email', user?.email)

      if (error) throw error
      toast.success('Profile berhasil diupdate')
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengupdate profile')
    } finally {
      setUpdating(false)
    }
  }

  const handleChangePassword = async () => {
    const newPassword = prompt('Masukkan password baru:')
    if (!newPassword) return

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      toast.success('Password berhasil diubah')
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengubah password')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Admin</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={adminData.full_name}
                onChange={(e) => setAdminData({ ...adminData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={adminData.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                value={adminData.role}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                disabled
              />
            </div>
            
            <button
              type="submit"
              disabled={updating}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {updating ? 'Menyimpan...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Keamanan</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Password</h3>
              <p className="text-sm text-gray-500 mb-3">
                Ubah password untuk meningkatkan keamanan akun
              </p>
              <button
                onClick={handleChangePassword}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
              >
                Ubah Password
              </button>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Informasi Login</h3>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Login terakhir: {new Date().toLocaleDateString('id-ID')}</p>
                <p>Status: Aktif</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Informasi Sistem</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700">Versi Aplikasi</h3>
            <p className="text-lg font-semibold text-gray-900">v1.0.0</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700">Database</h3>
            <p className="text-lg font-semibold text-gray-900">Supabase</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700">Status</h3>
            <p className="text-lg font-semibold text-green-600">Online</p>
          </div>
        </div>
      </div>
    </div>
  )
}