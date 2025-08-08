/*
  # Add Admin Users

  1. New Data
    - Insert two admin users into the admins table
    - One super admin and one regular admin
    - Both are active by default

  2. Security
    - Admins can manage the system
    - Proper role assignments
*/

-- Insert admin users
INSERT INTO admins (email, full_name, role, is_active) VALUES
  ('admin@domainluxe.com', 'Super Admin', 'super_admin', true),
  ('manager@domainluxe.com', 'Domain Manager', 'admin', true)
ON CONFLICT (email) DO NOTHING;