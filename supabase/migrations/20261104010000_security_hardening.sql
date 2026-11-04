-- =============================================================================
-- ROTARI / RADAR TOKO: SECURITY HARDENING MIGRATION
-- P0-P1 Security Fixes: Prospect Leads RLS, Storage Private Bucket, Hashed PINs,
-- Hardened SECURITY DEFINER Functions with search_path protection.
-- Target Project: oluzsthlxjxxpukxkcry
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. USERS & PROSPECT LEADS SCHEMA RECONCILIATION
-- -----------------------------------------------------------------------------
ALTER TABLE public.users 
  ALTER COLUMN pin_code TYPE TEXT,
  ADD COLUMN IF NOT EXISTS pin_hash TEXT;

ALTER TABLE public.prospect_leads
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

-- -----------------------------------------------------------------------------
-- 2. HARDENING SECURITY DEFINER FUNCTIONS (FIX search_path HIJACKING)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid()::text OR email = auth.email() LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_auth_tenant_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_tenant_id() TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()::text OR email = auth.email() LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_auth_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_user_role() TO authenticated, anon;

-- -----------------------------------------------------------------------------
-- 3. PROSPECT LEADS: ELIMINATE 'OR true' BYPASS (STRICT SUPERADMIN ACCESS)
-- -----------------------------------------------------------------------------
-- Public can only INSERT with data validation to prevent empty spam
DROP POLICY IF EXISTS "Prospect Leads - Insert Public" ON public.prospect_leads;
CREATE POLICY "Prospect Leads - Insert Public" ON public.prospect_leads
  FOR INSERT WITH CHECK (
    length(name) >= 2 
    AND length(email) >= 5 
    AND length(phone) >= 8
    AND length(business_name) >= 2
  );

-- ONLY genuine Super Admin can SELECT / read lead contact information
DROP POLICY IF EXISTS "Prospect Leads - Select Super Admin" ON public.prospect_leads;
CREATE POLICY "Prospect Leads - Select Super Admin" ON public.prospect_leads
  FOR SELECT USING (
    public.get_auth_user_role() = 'superadmin' 
    OR (auth.jwt()->>'role') = 'superadmin'
    OR (auth.jwt()->'app_metadata'->>'role') = 'superadmin'
  );

-- ONLY genuine Super Admin can UPDATE lead status
DROP POLICY IF EXISTS "Prospect Leads - Update Super Admin" ON public.prospect_leads;
CREATE POLICY "Prospect Leads - Update Super Admin" ON public.prospect_leads
  FOR UPDATE USING (
    public.get_auth_user_role() = 'superadmin' 
    OR (auth.jwt()->>'role') = 'superadmin'
    OR (auth.jwt()->'app_metadata'->>'role') = 'superadmin'
  );

-- ONLY genuine Super Admin can DELETE leads
DROP POLICY IF EXISTS "Prospect Leads - Delete Super Admin" ON public.prospect_leads;
CREATE POLICY "Prospect Leads - Delete Super Admin" ON public.prospect_leads
  FOR DELETE USING (
    public.get_auth_user_role() = 'superadmin' 
    OR (auth.jwt()->>'role') = 'superadmin'
    OR (auth.jwt()->'app_metadata'->>'role') = 'superadmin'
  );

-- -----------------------------------------------------------------------------
-- 4. STORAGE: MAKE TRANSACTION PHOTOS BUCKET PRIVATE & RESTRICT ACCESS
-- -----------------------------------------------------------------------------
-- Ensure bucket exists and is set to private
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'transaction-photos',
  'transaction-photos',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

UPDATE storage.buckets 
SET public = false 
WHERE id = 'transaction-photos';

-- Only authenticated users can upload (NO anonymous uploads)
DROP POLICY IF EXISTS "Allow Upload Transaction Photos" ON storage.objects;
CREATE POLICY "Allow Upload Transaction Photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'transaction-photos'
    AND auth.role() = 'authenticated'
  );

-- Only authenticated users who belong to the tenant or own the file can view
DROP POLICY IF EXISTS "Allow View Transaction Photos" ON storage.objects;
CREATE POLICY "Allow View Transaction Photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'transaction-photos'
    AND (
      auth.role() = 'authenticated'
      AND (
        auth.uid() = owner
        OR public.get_auth_user_role() = 'superadmin'
        OR (storage.foldername(name))[1] = public.get_auth_tenant_id()
      )
    )
  );

-- Only file owner or service_role can update or delete
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
