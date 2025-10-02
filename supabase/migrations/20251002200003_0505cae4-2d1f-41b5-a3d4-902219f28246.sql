-- Add RLS policy to technicians table for user access
CREATE POLICY "Users can view their own technician record"
ON technicians FOR SELECT
USING (
  user_id = auth.uid() 
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR can_access_all_data()
);