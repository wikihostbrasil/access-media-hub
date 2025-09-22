-- Configure auth webhooks for custom emails
-- Note: This needs to be configured in the Supabase dashboard under Authentication > Settings > Webhooks
-- Webhook URL: https://pozbctftgurybmlweaxp.functions.supabase.co/auth-webhook
-- Events: user.created, user.password_reset, user.magic_link

-- Update RLS policies to ensure file permissions work correctly
-- Add RLS for file_permissions access
ALTER TABLE file_permissions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see file permissions they're involved in
CREATE POLICY "Users can view relevant file permissions" 
ON file_permissions 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  group_id IN (
    SELECT group_id FROM user_groups WHERE user_id = auth.uid()
  ) OR 
  category_id IN (
    SELECT category_id FROM user_categories WHERE user_id = auth.uid()
  )
);

-- Ensure proper email domain verification is set up
-- This is a comment for the admin to manually verify email domains in Resend.com dashboard