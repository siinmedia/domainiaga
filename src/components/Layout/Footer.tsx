import React from 'react'
import { Link } from 'react-router-dom'
import { Globe, Mail, Phone, MapPin } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">DomainLuxe</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Platform terpercaya untuk jual beli domain premium dengan metrik SEO terbaik. 
              Investasi cerdas untuk masa depan digital Anda.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary-400" />
                <span className="text-gray-300">info@domainluxe.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary-400" />
                <span className="text-gray-300">+62 812-3456-7890</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span className="text-gray-300">Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/domains/popular" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Domain Populer
                </Link>
              </li>
              <li>
                <Link to="/domains/featured" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Domain Unggulan
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Domain Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kategori Domain</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/domains/id" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Domain .ID
                </Link>
              </li>
              <li>
                <Link to="/domains/com" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Domain .COM
                </Link>
              </li>
              <li>
                <Link to="/domains/org" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Domain .ORG
                </Link>
              </li>
              <li>
                <Link to="/domains/ac-id" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Domain .AC.ID
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 DomainLuxe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer