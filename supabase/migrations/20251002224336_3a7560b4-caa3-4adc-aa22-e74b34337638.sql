-- Phase 1 Fix: Secure Registration Documents (CRITICAL PII Protection)

-- First, let's see what tables actually exist for hotel registrations
-- Based on the schema, hotel_registrations is the main table

-- Drop overly permissive public access policies on hotel_registrations if they exist
DROP POLICY IF EXISTS "Public can view documents (demo)" ON hotel_registrations;
DROP POLICY IF EXISTS "Anyone can insert registration documents" ON hotel_registrations;

-- Add admin-only access to all hotel registrations
CREATE POLICY "Admins can manage all hotel registrations"
ON hotel_registrations
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow guests to view only their own registration by email
CREATE POLICY "Guests can view their own hotel registrations"
ON hotel_registrations
FOR SELECT
TO authenticated
USING (
  guest_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Add security documentation
COMMENT ON TABLE hotel_registrations IS 'Hotel registration records - CONTAINS PII (names, emails, addresses, phone, credit card last 4, signatures) - access restricted to admins and record owners only';

-- Phase 1 Fix: Secure Image Analysis Batches Access Control

-- Update company_id for any orphaned batches (assign to demo company or first available company)
UPDATE image_analysis_batches
SET company_id = (SELECT id FROM companies WHERE is_trial = true LIMIT 1)
WHERE company_id IS NULL;

-- Drop old policies with NULL checks
DROP POLICY IF EXISTS "Authenticated users can create image analysis batches" ON image_analysis_batches;
DROP POLICY IF EXISTS "Authenticated users can view their batches" ON image_analysis_batches;
DROP POLICY IF EXISTS "Authenticated users can update their batches" ON image_analysis_batches;
DROP POLICY IF EXISTS "Service role can manage all batches" ON image_analysis_batches;

-- Create new policies WITHOUT NULL checks - require company membership
CREATE POLICY "Company members can create batches"
ON image_analysis_batches
FOR INSERT
TO authenticated
WITH CHECK (
  is_member_of(company_id) OR can_access_all_data()
);

CREATE POLICY "Company members can view batches"
ON image_analysis_batches
FOR SELECT
TO authenticated
USING (
  is_member_of(company_id) OR can_access_all_data()
);

CREATE POLICY "Company members can update batches"
ON image_analysis_batches
FOR UPDATE
TO authenticated
USING (
  is_member_of(company_id) OR can_access_all_data()
)
WITH CHECK (
  is_member_of(company_id) OR can_access_all_data()
);

CREATE POLICY "Company members can delete batches"
ON image_analysis_batches
FOR DELETE
TO authenticated
USING (
  is_member_of(company_id) OR can_access_all_data()
);

-- Add NOT NULL constraint to company_id (after data migration above)
ALTER TABLE image_analysis_batches
ALTER COLUMN company_id SET NOT NULL;

-- Add security documentation
COMMENT ON TABLE image_analysis_batches IS 'Image analysis batches - access restricted to company members only via RLS';