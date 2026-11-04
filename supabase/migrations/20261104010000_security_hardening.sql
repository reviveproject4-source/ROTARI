-- =============================================================================
-- ROTARI / RADAR TOKO: SECURITY HARDENING MIGRATION
-- P0 Security Fixes: Prospect Leads RLS, Storage Private Bucket, Hashed PINs
-- Target Project: oluzsthlxjxxpukxkcry
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE: ALLOW FULL-LENGTH CRYPTOGRAPHIC PIN HASHES
-- -----------------------------------------------------------------------------
ALTER TABLE public.users 
  ALTER COLUMN pin_code TYPE TEXT,
  ADD COLUMN IF NOT EXISTS pin_hash TEXT;

-- -----------------------------------------------------------------------------
-- 2. PROSPECT LEADS: ELIMINATE 'OR true' BYPASS (STRICT SUPERADMIN ACCESS)
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
-- 3. STORAGE: MAKE TRANSACTION PHOTOS BUCKET PRIVATE & RESTRICT ACCESS
-- -----------------------------------------------------------------------------
-- Make bucket private (photos require authenticated access or signed URLs)
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
