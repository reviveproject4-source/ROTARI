-- =============================================================================
-- ROTARI / RADAR TOKO: P0-P1 SCHEMA ENHANCEMENTS & STORAGE SYNC
-- Safe, Non-Destructive, Idempotent Incremental Migration
-- Target Project: oluzsthlxjxxpukxkcry
-- =============================================================================

-- 1. TENANTS TABLE ENHANCEMENTS
-- Add business type classification ('retail', 'service', 'restaurant')
ALTER TABLE public.tenants 
  ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'retail';

-- 2. PRODUCTS & SERVICES TABLE ENHANCEMENTS
-- Add service duration, technician raw material cost, and last transaction timestamp
ALTER TABLE public.products_services 
  ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS raw_material_cost NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_sold_at TIMESTAMPTZ;

-- 3. OPERATIONAL EXPENSES TABLE ENHANCEMENTS
-- Add payment method to separate cash vs bank transfer expenses in financial statements
ALTER TABLE public.operational_expenses 
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash';

-- 4. TRANSACTIONS TABLE ENHANCEMENTS
-- Add DP, remaining balance, photo attachments, special discounts, and completion estimation
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dp_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_stage TEXT DEFAULT 'full',
  ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'amount',
  ADD COLUMN IF NOT EXISTS discount_value NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estimated_completion_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS discount_special_requested BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS discount_special_note TEXT,
  ADD COLUMN IF NOT EXISTS discount_special_status TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS branch_name TEXT,
  ADD COLUMN IF NOT EXISTS item_notes TEXT;

-- 5. STORAGE BUCKET FOR TRANSACTION PHOTOS
-- Ensure 'transaction-photos' bucket exists and is publicly accessible
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

-- 6. STORAGE OBJECT POLICIES (Idempotent)
DO $$
BEGIN
  -- Read Policy: Allow public read of transaction photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Read Transaction Photos'
  ) THEN
    CREATE POLICY "Public Read Transaction Photos" ON storage.objects
      FOR SELECT USING (bucket_id = 'transaction-photos');
  END IF;

  -- Insert Policy: Allow upload of transaction photos (anon & authenticated)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Upload Transaction Photos'
  ) THEN
    CREATE POLICY "Allow Upload Transaction Photos" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'transaction-photos');
  END IF;

  -- Manage Policy: Allow update/delete of transaction photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Manage Transaction Photos'
  ) THEN
    CREATE POLICY "Allow Manage Transaction Photos" ON storage.objects
      FOR ALL USING (bucket_id = 'transaction-photos');
  END IF;
END $$;
