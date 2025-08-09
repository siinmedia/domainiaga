import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import DomainCard from '../../components/domain/DomainCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { Domain } from '../../types'

export default function DomainDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [domain, setDomain] = useState<Domain | null>(null)
  const [suggestions, setSuggestions] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchDomain()
      fetchSuggestions()
    }
  }, [id])

  const fetchDomain = async () => {
    try {
      const { data, error } = await supabase
        .from('domains')
        .select(`
          *,
          domain_categories(name),
          domain_metrics(da, pa, ss, dr, bl)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setDomain(data)

      // Update view count
      await supabase
        .from('domains')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', id)
    } catch (error) {
      console.error('Error fetching domain:', error)
    }
  }

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('domains')
        .select(`
          *,
          domain_categories(name),
          domain_metrics(da, pa, ss, dr, bl)
        `)
        .eq('is_sold', false)
        .neq('id', id)
        .limit(3)

      if (error) throw error
      setSuggestions(data || [])
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!domain) return <div>Domain tidak ditemukan</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{domain.full_domain}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Detail Domain</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Harga:</span> Rp {domain.price?.toLocaleString('id-ID')}</p>
                <p><span className="font-medium">Registrar:</span> {domain.registrar}</p>
                <p><span className="font-medium">Tanggal Expired:</span> {new Date(domain.expiry_date).toLocaleDateString('id-ID')}</p>
                <p><span className="font-medium">Dilihat:</span> {domain.view_count || 0} kali</p>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Metrik SEO</h2>
              <div className="space-y-2">
                <p><span className="font-medium">DA:</span> {domain.domain_metrics?.da || 0}</p>
                <p><span className="font-medium">PA:</span> {domain.domain_metrics?.pa || 0}</p>
                <p><span className="font-medium">SS:</span> {domain.domain_metrics?.ss || 0}</p>
                <p><span className="font-medium">DR:</span> {domain.domain_metrics?.dr || 0}</p>
                <p><span className="font-medium">BL:</span> {domain.domain_metrics?.bl || '0'}</p>
              </div>
            </div>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Domain Serupa</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {suggestions.map((suggestion) => (
                <DomainCard key={suggestion.id} domain={suggestion} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}