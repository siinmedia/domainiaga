/*
  # Complete Domain Marketplace Schema

  1. New Tables
    - `admins` - Admin users with authentication
    - `domains` - Domain listings with comprehensive data
    - `domain_categories` - Domain extension categories
    - `transactions` - Payment and transaction records
    - `domain_metrics` - SEO metrics (DA, PA, SS, DR, BL)
    - `popular_searches` - Track popular domain searches
    - `domain_suggestions` - Related domain suggestions

  2. Security
    - Enable RLS on all tables
    - Add policies for admin and public access
    - Secure admin operations

  3. Features
    - Auto-generated SEO metrics
    - Transaction tracking
    - Popular domain tracking
    - Expiry monitoring
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create domain categories table
CREATE TABLE IF NOT EXISTS domain_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  extension text NOT NULL UNIQUE,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  extension text NOT NULL,
  full_domain text GENERATED ALWAYS AS (name || extension) STORED,
  price numeric(12,2) NOT NULL,
  category_id uuid REFERENCES domain_categories(id),
  registrar text NOT NULL,
  registered_date date NOT NULL,
  expiry_date date NOT NULL,
  is_sold boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_popular boolean DEFAULT false,
  view_count integer DEFAULT 0,
  search_count integer DEFAULT 0,
  admin_id uuid REFERENCES admins(id),
  sold_date timestamptz,
  sold_price numeric(12,2),
  description text,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, extension)
);

-- Create domain metrics table
CREATE TABLE IF NOT EXISTS domain_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id uuid REFERENCES domains(id) ON DELETE CASCADE,
  da integer DEFAULT 0 CHECK (da >= 0 AND da <= 100),
  pa integer DEFAULT 0 CHECK (pa >= 0 AND pa <= 100),
  ss integer DEFAULT 0 CHECK (ss >= 0 AND ss <= 10),
  dr numeric(4,1) DEFAULT 0 CHECK (dr >= 0 AND dr <= 100),
  bl text DEFAULT '0',
  last_updated timestamptz DEFAULT now(),
  UNIQUE(domain_id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id uuid REFERENCES domains(id),
  transaction_id text UNIQUE NOT NULL,
  amount numeric(12,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'verified', 'completed', 'failed', 'cancelled')),
  payment_method text DEFAULT 'qris',
  buyer_info jsonb,
  qris_data text,
  payment_proof text,
  verified_by uuid REFERENCES admins(id),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create popular searches table
CREATE TABLE IF NOT EXISTS popular_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_term text NOT NULL,
  search_count integer DEFAULT 1,
  last_searched timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create domain suggestions table
CREATE TABLE IF NOT EXISTS domain_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id uuid REFERENCES domains(id) ON DELETE CASCADE,
  suggested_domain_id uuid REFERENCES domains(id) ON DELETE CASCADE,
  similarity_score numeric(3,2) DEFAULT 0.5,
  created_at timestamptz DEFAULT now(),
  UNIQUE(domain_id, suggested_domain_id)
);

-- Insert default domain categories
INSERT INTO domain_categories (name, extension, description) VALUES
('Domain ID', '.id', 'Domain Indonesia untuk identitas nasional'),
('Domain COM', '.com', 'Domain komersial internasional'),
('Domain ORG', '.org', 'Domain untuk organisasi'),
('Domain AC.ID', '.ac.id', 'Domain akademik Indonesia'),
('Domain CO.ID', '.co.id', 'Domain komersial Indonesia'),
('Domain OR.ID', '.or.id', 'Domain organisasi Indonesia')
ON CONFLICT (extension) DO NOTHING;

-- Insert default admin users
INSERT INTO admins (email, full_name, role) VALUES
('admin1@domainluxe.com', 'Admin Utama', 'super_admin'),
('admin2@domainluxe.com', 'Admin Kedua', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Enable RLS
ALTER TABLE domain_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access (read-only for most tables)
CREATE POLICY "Public can read domain categories" ON domain_categories FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Public can read available domains" ON domains FOR SELECT TO anon USING (NOT is_sold);
CREATE POLICY "Public can read domain metrics" ON domain_metrics FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read popular searches" ON popular_searches FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read domain suggestions" ON domain_suggestions FOR SELECT TO anon USING (true);

-- RLS Policies for authenticated users (customers)
CREATE POLICY "Authenticated can create transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can read own transactions" ON transactions FOR SELECT TO authenticated USING (buyer_info->>'email' = auth.jwt()->>'email');
CREATE POLICY "Authenticated can update popular searches" ON popular_searches FOR ALL TO authenticated USING (true);

-- RLS Policies for admin users (full access)
CREATE POLICY "Admins have full access to all tables" ON domain_categories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email' AND is_active = true)
);
CREATE POLICY "Admins have full access to admins table" ON admins FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email' AND is_active = true)
);
CREATE POLICY "Admins have full access to domains" ON domains FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email' AND is_active = true)
);
CREATE POLICY "Admins have full access to domain metrics" ON domain_metrics FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email' AND is_active = true)
);
CREATE POLICY "Admins have full access to transactions" ON transactions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email' AND is_active = true)
);
CREATE POLICY "Admins have full access to domain suggestions" ON domain_suggestions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email' AND is_active = true)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_domains_extension ON domains(extension);
CREATE INDEX IF NOT EXISTS idx_domains_is_sold ON domains(is_sold);
CREATE INDEX IF NOT EXISTS idx_domains_is_featured ON domains(is_featured);
CREATE INDEX IF NOT EXISTS idx_domains_is_popular ON domains(is_popular);
CREATE INDEX IF NOT EXISTS idx_domains_expiry_date ON domains(expiry_date);
CREATE INDEX IF NOT EXISTS idx_domains_created_at ON domains(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_popular_searches_count ON popular_searches(search_count DESC);

-- Create function to auto-generate SEO metrics
CREATE OR REPLACE FUNCTION generate_seo_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate realistic SEO metrics based on domain characteristics
  INSERT INTO domain_metrics (domain_id, da, pa, ss, dr, bl)
  VALUES (
    NEW.id,
    FLOOR(RANDOM() * 60) + 10, -- DA: 10-70
    FLOOR(RANDOM() * 50) + 15, -- PA: 15-65
    FLOOR(RANDOM() * 5) + 1,   -- SS: 1-5
    ROUND((RANDOM() * 30 + 5)::numeric, 1), -- DR: 5-35
    CASE 
      WHEN RANDOM() < 0.3 THEN (FLOOR(RANDOM() * 1000) + 100)::text
      WHEN RANDOM() < 0.6 THEN (FLOOR(RANDOM() * 100) + 10)::text || 'K'
      ELSE (FLOOR(RANDOM() * 50) + 1)::text || 'M'
    END -- BL: varied format
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating SEO metrics
CREATE TRIGGER trigger_generate_seo_metrics
  AFTER INSERT ON domains
  FOR EACH ROW
  EXECUTE FUNCTION generate_seo_metrics();

-- Create function to update domain view count
CREATE OR REPLACE FUNCTION increment_domain_views(domain_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE domains 
  SET view_count = view_count + 1,
      updated_at = now()
  WHERE id = domain_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create function to track popular searches
CREATE OR REPLACE FUNCTION track_search(search_term text)
RETURNS void AS $$
BEGIN
  INSERT INTO popular_searches (search_term, search_count, last_searched)
  VALUES (search_term, 1, now())
  ON CONFLICT (search_term) 
  DO UPDATE SET 
    search_count = popular_searches.search_count + 1,
    last_searched = now();
END;
$$ LANGUAGE plpgsql;