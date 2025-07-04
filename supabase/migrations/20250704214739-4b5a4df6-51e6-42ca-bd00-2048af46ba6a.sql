-- Migration: Set up Supabase Auth integration with existing company_users system
-- This ensures proper integration between Supabase auth.users and our company_users table

-- Create profiles table to store additional user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  
  -- If user email exists in company_users, update user_id to use the UUID
  UPDATE public.company_users 
  SET user_id = new.id::text 
  WHERE user_id = new.email;
  
  -- If user email exists in technicians, link to company
  UPDATE public.technicians 
  SET user_id = new.id
  WHERE email = new.email AND user_id IS NULL;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add user_id column to technicians table if it doesn't exist
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create function to get current user's company info
CREATE OR REPLACE FUNCTION public.get_current_user_company()
RETURNS TABLE(
  company_id UUID,
  company_name TEXT,
  user_role TEXT,
  is_admin BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cu.company_id,
    c.name as company_name,
    cu.role as user_role,
    cu.is_admin
  FROM public.company_users cu
  JOIN public.companies c ON c.id = cu.company_id
  WHERE cu.user_id = auth.uid()::text
  LIMIT 1;
END;
$$;

-- Update RLS policies to work with auth.uid()
-- Update company_users policies to work with both email and UUID
DROP POLICY IF EXISTS "Company users can view their own record" ON public.company_users;
CREATE POLICY "Company users can view their own record" 
ON public.company_users FOR SELECT 
USING (user_id = auth.uid()::text OR user_id = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Comments for documentation
COMMENT ON TABLE public.profiles IS 'User profiles linked to Supabase Auth users';
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates profile and links existing company/technician records when user signs up';