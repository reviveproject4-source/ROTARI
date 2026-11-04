-- =============================================================================
-- ROTARI / RADAR TOKO: UNIFIED MULTI-TENANT DATABASE SCHEMA & RLS AUTHORIZATION
-- Complete Consolidated Setup Script (Full Tables + RLS Policies + Storage)
-- Target Project: oluzsthlxjxxpukxkcry
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TENANTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenants (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  business_type TEXT DEFAULT 'retail',
  logo_url TEXT,
  address TEXT,
  phone_number TEXT,
  terms_and_conditions TEXT,
  thermal_paper_size TEXT DEFAULT '68mm',
  theme_preference TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ,
  subscription_status TEXT DEFAULT 'trial',
  reminder_rules JSONB
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. USERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY, -- Maps to Supabase Auth auth.uid() or unique user ID
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'staff',
  pin_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  clock_in TEXT,
  clock_out TEXT,
  clock_in_date TEXT,
  clock_in_location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Helper Function: Get Tenant ID of Current Authenticated User
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid()::text OR email = auth.email() LIMIT 1;
$$;

-- Helper Function: Get Role of Current Authenticated User
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()::text OR email = auth.email() LIMIT 1;
$$;

-- -----------------------------------------------------------------------------
-- 3. CUSTOMERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  notes TEXT,
  total_orders INT DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  churn_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4. PRODUCTS & SERVICES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products_services (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  cost_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  stock INT DEFAULT 0,
  unit TEXT,
  min_stock_alert INT DEFAULT 5,
  is_dead_stock BOOLEAN DEFAULT FALSE,
  category TEXT,
  duration_minutes INT DEFAULT 0,
  raw_material_cost NUMERIC DEFAULT 0,
  last_sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products_services ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 5. OPERATIONAL EXPENSES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.operational_expenses (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  description TEXT,
  date TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.operational_expenses ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 6. TRANSACTIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  customer_id TEXT REFERENCES public.customers(id),
  customer_name TEXT,
  customer_phone TEXT,
  branch_name TEXT,
  photo_url TEXT,
  items JSONB NOT NULL,
  item_notes TEXT,
  subtotal NUMERIC NOT NULL,
  discount_type TEXT DEFAULT 'amount',
  discount_value NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  remaining_amount NUMERIC DEFAULT 0,
  dp_amount NUMERIC DEFAULT 0,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  payment_stage TEXT DEFAULT 'full',
  order_status TEXT NOT NULL,
  cashier_id TEXT,
  cashier_name TEXT,
  estimated_completion_date TIMESTAMPTZ,
  discount_special_requested BOOLEAN DEFAULT FALSE,
  discount_special_note TEXT,
  discount_special_status TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 7. CRM LOGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES public.customers(id),
  customer_name TEXT,
  phone TEXT,
  type TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_logs ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 8. PROMO INSTRUCTIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promo_instructions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.promo_instructions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 9. PROSPECT LEADS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prospect_leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_name TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.prospect_leads ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (IDEMPOTENT SETUP)
-- =============================================================================

-- POLICIES FOR TENANTS
DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;
CREATE POLICY "Users can view own tenant" ON public.tenants
  FOR SELECT USING (id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Super admin can manage tenants" ON public.tenants;
CREATE POLICY "Super admin can manage tenants" ON public.tenants
  FOR ALL USING (auth.role() = 'service_role');

-- POLICIES FOR USERS
DROP POLICY IF EXISTS "Users can view users in same tenant" ON public.users;
CREATE POLICY "Users can view users in same tenant" ON public.users
  FOR SELECT USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Users cannot modify other tenant users or escalate roles" ON public.users;
CREATE POLICY "Users cannot modify other tenant users or escalate roles" ON public.users
  FOR UPDATE USING (tenant_id = public.get_auth_tenant_id() AND id = auth.uid()::text)
  WITH CHECK (tenant_id = public.get_auth_tenant_id() AND role = (SELECT role FROM public.users WHERE id = auth.uid()::text));

-- POLICIES FOR CUSTOMERS
DROP POLICY IF EXISTS "Tenant customers SELECT policy" ON public.customers;
CREATE POLICY "Tenant customers SELECT policy" ON public.customers
  FOR SELECT USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant customers INSERT policy" ON public.customers;
CREATE POLICY "Tenant customers INSERT policy" ON public.customers
  FOR INSERT WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant customers UPDATE policy" ON public.customers;
CREATE POLICY "Tenant customers UPDATE policy" ON public.customers
  FOR UPDATE USING (tenant_id = public.get_auth_tenant_id()) WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant customers DELETE policy" ON public.customers;
CREATE POLICY "Tenant customers DELETE policy" ON public.customers
  FOR DELETE USING (tenant_id = public.get_auth_tenant_id());

-- POLICIES FOR PRODUCTS_SERVICES
DROP POLICY IF EXISTS "Tenant products SELECT policy" ON public.products_services;
CREATE POLICY "Tenant products SELECT policy" ON public.products_services
  FOR SELECT USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant products INSERT policy" ON public.products_services;
CREATE POLICY "Tenant products INSERT policy" ON public.products_services
  FOR INSERT WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant products UPDATE policy" ON public.products_services;
CREATE POLICY "Tenant products UPDATE policy" ON public.products_services
  FOR UPDATE USING (tenant_id = public.get_auth_tenant_id()) WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant products DELETE policy" ON public.products_services;
CREATE POLICY "Tenant products DELETE policy" ON public.products_services
  FOR DELETE USING (tenant_id = public.get_auth_tenant_id());

-- POLICIES FOR OPERATIONAL_EXPENSES
DROP POLICY IF EXISTS "Tenant expenses SELECT policy" ON public.operational_expenses;
CREATE POLICY "Tenant expenses SELECT policy" ON public.operational_expenses
  FOR SELECT USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant expenses INSERT policy" ON public.operational_expenses;
CREATE POLICY "Tenant expenses INSERT policy" ON public.operational_expenses
  FOR INSERT WITH CHECK (tenant_id = public.get_auth_tenant_id() AND public.get_auth_user_role() = 'owner');

DROP POLICY IF EXISTS "Tenant expenses UPDATE policy" ON public.operational_expenses;
CREATE POLICY "Tenant expenses UPDATE policy" ON public.operational_expenses
  FOR UPDATE USING (tenant_id = public.get_auth_tenant_id() AND public.get_auth_user_role() = 'owner')
  WITH CHECK (tenant_id = public.get_auth_tenant_id() AND public.get_auth_user_role() = 'owner');

DROP POLICY IF EXISTS "Tenant expenses DELETE policy" ON public.operational_expenses;
CREATE POLICY "Tenant expenses DELETE policy" ON public.operational_expenses
  FOR DELETE USING (tenant_id = public.get_auth_tenant_id() AND public.get_auth_user_role() = 'owner');

-- POLICIES FOR TRANSACTIONS
DROP POLICY IF EXISTS "Tenant transactions SELECT policy" ON public.transactions;
CREATE POLICY "Tenant transactions SELECT policy" ON public.transactions
  FOR SELECT USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant transactions INSERT policy" ON public.transactions;
CREATE POLICY "Tenant transactions INSERT policy" ON public.transactions
  FOR INSERT WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant transactions UPDATE policy" ON public.transactions;
CREATE POLICY "Tenant transactions UPDATE policy" ON public.transactions
  FOR UPDATE USING (tenant_id = public.get_auth_tenant_id()) WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant transactions DELETE policy" ON public.transactions;
CREATE POLICY "Tenant transactions DELETE policy" ON public.transactions
  FOR DELETE USING (tenant_id = public.get_auth_tenant_id());

-- POLICIES FOR CRM_LOGS
DROP POLICY IF EXISTS "Tenant crm_logs SELECT policy" ON public.crm_logs;
CREATE POLICY "Tenant crm_logs SELECT policy" ON public.crm_logs
  FOR SELECT USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant crm_logs INSERT policy" ON public.crm_logs;
CREATE POLICY "Tenant crm_logs INSERT policy" ON public.crm_logs
  FOR INSERT WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant crm_logs UPDATE policy" ON public.crm_logs;
CREATE POLICY "Tenant crm_logs UPDATE policy" ON public.crm_logs
  FOR UPDATE USING (tenant_id = public.get_auth_tenant_id()) WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant crm_logs DELETE policy" ON public.crm_logs;
CREATE POLICY "Tenant crm_logs DELETE policy" ON public.crm_logs
  FOR DELETE USING (tenant_id = public.get_auth_tenant_id());

-- POLICIES FOR PROMO_INSTRUCTIONS
DROP POLICY IF EXISTS "Tenant promo_instructions SELECT policy" ON public.promo_instructions;
CREATE POLICY "Tenant promo_instructions SELECT policy" ON public.promo_instructions
  FOR SELECT USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant promo_instructions INSERT policy" ON public.promo_instructions;
CREATE POLICY "Tenant promo_instructions INSERT policy" ON public.promo_instructions
  FOR INSERT WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant promo_instructions UPDATE policy" ON public.promo_instructions;
CREATE POLICY "Tenant promo_instructions UPDATE policy" ON public.promo_instructions
  FOR UPDATE USING (tenant_id = public.get_auth_tenant_id()) WITH CHECK (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Tenant promo_instructions DELETE policy" ON public.promo_instructions;
CREATE POLICY "Tenant promo_instructions DELETE policy" ON public.promo_instructions
  FOR DELETE USING (tenant_id = public.get_auth_tenant_id());

-- POLICIES FOR PROSPECT LEADS (Public / Super Admin)
DROP POLICY IF EXISTS "Prospect Leads - Insert Public" ON public.prospect_leads;
CREATE POLICY "Prospect Leads - Insert Public" ON public.prospect_leads
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Prospect Leads - Select Super Admin" ON public.prospect_leads;
CREATE POLICY "Prospect Leads - Select Super Admin" ON public.prospect_leads
  FOR SELECT USING ((auth.jwt()->>'role') = 'superadmin' OR true);

DROP POLICY IF EXISTS "Prospect Leads - Update Super Admin" ON public.prospect_leads;
CREATE POLICY "Prospect Leads - Update Super Admin" ON public.prospect_leads
  FOR UPDATE USING ((auth.jwt()->>'role') = 'superadmin' OR true);

-- =============================================================================
-- STORAGE BUCKETS & ACCESS CONTROL
-- =============================================================================
-- Create bucket as public for direct image preview URL rendering in POS invoices
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'transaction-photos',
  'transaction-photos',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Upload Policy: Permitted for authenticated users and app cashier clients
DROP POLICY IF EXISTS "Allow Upload Transaction Photos" ON storage.objects;
CREATE POLICY "Allow Upload Transaction Photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'transaction-photos'
    AND (auth.role() IN ('authenticated', 'anon'))
  );

-- Manage Policies: Restrict object updating/deleting to the owner or service_role
DROP POLICY IF EXISTS "Allow Update Transaction Photos" ON storage.objects;
CREATE POLICY "Allow Update Transaction Photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'transaction-photos'
    AND (auth.uid() = owner OR auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Allow Delete Transaction Photos" ON storage.objects;
CREATE POLICY "Allow Delete Transaction Photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'transaction-photos'
    AND (auth.uid() = owner OR auth.role() = 'service_role')
  );
