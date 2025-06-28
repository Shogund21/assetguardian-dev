
-- Enable RLS on companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all companies (for now - we can restrict this later if needed)
CREATE POLICY "Authenticated users can view companies" 
  ON public.companies 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert companies
CREATE POLICY "Authenticated users can create companies" 
  ON public.companies 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update companies
CREATE POLICY "Authenticated users can update companies" 
  ON public.companies 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete companies (for admin purposes)
CREATE POLICY "Authenticated users can delete companies" 
  ON public.companies 
  FOR DELETE 
  USING (auth.role() = 'authenticated');
