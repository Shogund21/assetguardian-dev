-- CRITICAL SECURITY FIX: Restrict access to hotel_registrations table
-- This table contains highly sensitive PII and must not be publicly readable

-- Drop the dangerous public SELECT policy
DROP POLICY IF EXISTS "Public can view registrations (demo)" ON public.hotel_registrations;

-- Drop the public INSERT policy (guests should register through authenticated flow or edge function)
DROP POLICY IF EXISTS "Public can insert registrations (demo)" ON public.hotel_registrations;

-- Create secure policies for authenticated hotel staff only

-- Policy 1: Hotel staff can view all registrations
CREATE POLICY "Authenticated users can view hotel registrations"
ON public.hotel_registrations
FOR SELECT
TO authenticated
USING (
  -- Only allow authenticated users who are hotel staff
  -- This assumes hotel staff are authenticated users with appropriate roles
  auth.uid() IS NOT NULL
);

-- Policy 2: Hotel staff can insert new registrations
CREATE POLICY "Authenticated users can create hotel registrations"
ON public.hotel_registrations
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only authenticated hotel staff can create registrations
  auth.uid() IS NOT NULL
);

-- Policy 3: Hotel staff can update registrations
CREATE POLICY "Authenticated users can update hotel registrations"
ON public.hotel_registrations
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy 4: Hotel staff can delete registrations (for corrections/GDPR compliance)
CREATE POLICY "Authenticated users can delete hotel registrations"
ON public.hotel_registrations
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- IMPORTANT NOTES:
-- 1. If you need a public registration form for guests, implement it via an Edge Function
--    that validates input and creates records with proper sanitization
-- 2. Consider adding company_id or hotel_id column to restrict staff to their own hotel's data
-- 3. Consider encrypting sensitive fields like card_last4, addresses
-- 4. Implement audit logging for all access to this sensitive data
-- 5. Review related tables: registration_documents, registration_signatures for similar issues