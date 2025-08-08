import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Globe, TrendingUp, Shield, Clock, Star } from 'lucide-react'
import Header from '../../components/Layout/Header'
import Footer from '../../components/Layout/Footer'
import DomainCard from '../../components/domain/DomainCard'
import SearchBar from '../../components/search/SearchBar'
import { supabase, Domain } from '../../lib/supabase'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const HomePage: React.FC = () => {
  const [featuredDomains, setFeaturedDomains] = useState<Domain[]>([])
  const [popularDomains, setPopularDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDomains()
  }, [])

  const fetchDomains = async () => {
    try {
      // Fetch featured domains
      const { data: featured } = await supabase
        .from('domains')
        .select(`
          *,
          domain_categories(*),
          domain_metrics(*)
        `)
        .eq('is_featured', true)
        .eq('is_sold', false)
        .order('created_at', { ascending: false })
        .limit(6)

      // Fetch popular domains
      const { data: popular } = await supabase
        .from('domains')
        .select(`
          *,
          domain_categories(*),
          domain_metrics(*)
        `)
        .eq('is_popular', true)
        .eq('is_sold', false)
        .order('view_count', { ascending: false })
        .limit(6)

      setFeaturedDomains(featured || [])
      setPopularDomains(popular || [])
    } catch (error) {
      console.error('Error fetching domains:', error)
    } finally {
      setLoading(false)
    }
  }

  const domainCategories = [
    { name: 'Domain .ID', extension: 'id', count: 150, color: 'bg-blue-500' },
    { name: 'Domain .COM', extension: 'com', count: 89, color: 'bg-green-500' },
    { name: 'Domain .ORG', extension: 'org', count: 45, color: 'bg-purple-500' },
    { name: 'Domain .AC.ID', extension: 'ac-id', count: 67, color: 'bg-red-500' },
    { name: 'Domain .CO.ID', extension: 'co-id', count: 123, color: 'bg-yellow-500' },
    { name: 'Domain .OR.ID', extension: 'or-id', count: 34, color: 'bg-indigo-500' },
  ]

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Temukan Domain
              <span className="text-primary-600"> Premium</span>
              <br />
              Untuk Bisnis Anda
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Koleksi domain berkualitas tinggi dengan metrik SEO terbaik. 
              Investasi cerdas untuk masa depan digital Anda.
            </p>
            
            <SearchBar />
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center justify-center space-x-3">
                <Shield className="w-8 h-8 text-primary-500" />
                <span className="text-gray-700 font-medium">Domain Terverifikasi</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <TrendingUp className="w-8 h-8 text-primary-500" />
                <span className="text-gray-700 font-medium">Metrik SEO Tinggi</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Clock className="w-8 h-8 text-primary-500" />
                <span className="text-gray-700 font-medium">Transfer Cepat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Domain Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Kategori Domain
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pilih kategori domain sesuai kebutuhan bisnis Anda
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domainCategories.map((category) => (
              <Link
                key={category.extension}
                to={`/domains/${category.extension}`}
                className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-500">{category.count} domain tersedia</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Domains */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Domain Unggulan
              </h2>
              <p className="text-gray-600">
                Domain pilihan dengan kualitas terbaik
              </p>
            </div>
            <Link
              to="/domains/featured"
              className="btn-primary"
            >
              Lihat Semua
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDomains.map((domain) => (
                <DomainCard key={domain.id} domain={domain} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Domains */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                <Star className="w-8 h-8 text-yellow-500 inline-block mr-2" />
                Banyak Dicari
              </h2>
              <p className="text-gray-600">
                Domain dengan tingkat pencarian tertinggi
              </p>
            </div>
            <Link
              to="/domains/popular"
              className="btn-primary"
            >
              Lihat Semua
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularDomains.map((domain) => (
                <DomainCard key={domain.id} domain={domain} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HomePage