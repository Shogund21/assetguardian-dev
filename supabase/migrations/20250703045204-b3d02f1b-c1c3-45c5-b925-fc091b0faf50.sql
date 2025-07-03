-- Add unique constraint on email to prevent duplicate access requests
ALTER TABLE public.access_requests ADD CONSTRAINT access_requests_email_unique UNIQUE (email);