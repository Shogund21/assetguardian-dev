
-- Create a storage bucket for company assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-assets', 'company-assets', true);

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload company assets" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'company-assets' AND auth.role() = 'authenticated');

-- Create policy to allow public read access to company assets
CREATE POLICY "Public can view company assets" ON storage.objects
FOR SELECT USING (bucket_id = 'company-assets');

-- Create policy to allow authenticated users to update their company assets
CREATE POLICY "Authenticated users can update company assets" ON storage.objects
FOR UPDATE USING (bucket_id = 'company-assets' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete company assets  
CREATE POLICY "Authenticated users can delete company assets" ON storage.objects
FOR DELETE USING (bucket_id = 'company-assets' AND auth.role() = 'authenticated');
