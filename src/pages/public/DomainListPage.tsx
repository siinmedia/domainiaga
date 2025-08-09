import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import DomainCard from '../../components/domain/DomainCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { Domain } from '../../types'

export default function DomainListPage() {
  const { extension } = useParams<{ extension: string }>()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDomains()
  }, [extension])

  const fetchDomains = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('domains')
        .select(`
          *,
          domain_categories(name),
          domain_metrics(da, pa, ss, dr, bl)
        `)
        .eq('is_sold', false)

      if (extension && extension !== 'all') {
        query = query.eq('extension', `.${extension.toUpperCase()}`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setDomains(data || [])
    } catch (error) {
      console.error('Error fetching domains:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {extension === 'all' ? 'Semua Domain' : `Domain ${extension?.toUpperCase()}`}
        </h1>
        
        {domains.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada domain tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}