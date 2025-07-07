-- Fix Super Admin Detection and Database Functions
-- This migration fixes the is_super_admin function to properly work with auth.uid()

-- Step 1: Fix the is_super_admin function to work with both UUID and email
DROP FUNCTION IF EXISTS public.is_super_admin();

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- Check if the current user is the super admin by UUID or email
  RETURN (
    -- Check by UUID - if the user is authenticated and their email is super admin
    (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'edward@shogunaillc.com'
    )) OR
    -- Check by email in company_users table for backwards compatibility
    EXISTS (
      SELECT 1 FROM public.company_users cu 
      WHERE cu.user_id = 'edward@shogunaillc.com'
      AND cu.role = 'super_admin'
    )
  );
END;
$$;

-- Step 2: Create a function to check if super admin account exists
CREATE OR REPLACE FUNCTION public.super_admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'edward@shogunaillc.com'
  );
$$;

-- Step 3: Ensure the can_access_all_data function works properly  
DROP FUNCTION IF EXISTS public.can_access_all_data();

CREATE OR REPLACE FUNCTION public.can_access_all_data()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT public.is_super_admin();
$$;

-- Step 4: Create function to get all companies for super admin
CREATE OR REPLACE FUNCTION public.get_all_companies_for_super_admin()
RETURNS TABLE(
  id uuid,
  name text,
  logo_url text,
  address text,
  contact_email text,
  contact_phone text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    c.id,
    c.name,
    c.logo_url,
    c.address,
    c.contact_email,
    c.contact_phone,
    c.created_at,
    c.updated_at
  FROM public.companies c
  WHERE public.is_super_admin()
  ORDER BY c.name;
$$;