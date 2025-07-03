-- Create access_requests table for managing access requests
CREATE TABLE public.access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Create policy that only allows edward@shogunai.com to view and manage access requests
CREATE POLICY "Only admin can view access requests" 
ON public.access_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM company_users
    WHERE company_users.user_id = 'edward@shogunai.com'
    AND company_users.user_id = auth.uid()::TEXT
  ) OR auth.uid()::TEXT = 'edward@shogunai.com'
);

CREATE POLICY "Only admin can manage access requests" 
ON public.access_requests 
FOR ALL 
USING (
  EXISTS (
    SELECT 1
    FROM company_users
    WHERE company_users.user_id = 'edward@shogunai.com'
    AND company_users.user_id = auth.uid()::TEXT
  ) OR auth.uid()::TEXT = 'edward@shogunai.com'
);

-- Allow anyone to insert access requests (for the landing page form)
CREATE POLICY "Anyone can create access requests" 
ON public.access_requests 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_access_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_access_requests_updated_at
BEFORE UPDATE ON public.access_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_access_requests_updated_at();