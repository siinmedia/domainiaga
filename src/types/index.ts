export interface Domain {
  id: string
  name: string
  extension: string
  full_domain: string
  price: number
  category_id: string | undefined
  registrar: string
  registered_date: string
  expiry_date: string
  is_sold: boolean
  is_featured: boolean
  is_popular: boolean
  view_count: number
  search_count: number
  admin_id?: string
  sold_date?: string
  sold_price?: number
  description?: string
  tags?: string[]
  created_at: string
  updated_at: string
  domain_categories?: {
    name: string
  }
  domain_metrics?: {
    da: number
    pa: number
    ss: number
    dr: number
    bl: string
  }
}

export interface DomainCategory {
  id: string
  name: string
  extension: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Admin {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  domain_id: string
  transaction_id: string
  amount: number
  status: string
  payment_method: string
  buyer_info: any
  qris_data?: string
  payment_proof?: string
  verified_by?: string
  verified_at?: string
  created_at: string
  updated_at: string
}

export interface DomainMetrics {
  id: string
  domain_id: string
  da: number
  pa: number
  ss: number
  dr: number
  bl: string
  last_updated: string
}

export interface PopularSearch {
  id: string
  search_term: string
  search_count: number
  last_searched: string
  created_at: string
}

export interface DomainSuggestion {
  id: string
  domain_id: string
  suggested_domain_id: string
  similarity_score: number
  created_at: string
}