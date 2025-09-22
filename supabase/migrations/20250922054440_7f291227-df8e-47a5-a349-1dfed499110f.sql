-- Configure Supabase to use custom email function for auth emails
-- This will redirect auth emails to our custom Resend-powered function

-- Update auth configuration to use webhook for custom emails
UPDATE auth.config 
SET 
  external_email_enabled = true,
  external_email_url = concat(
    current_setting('app.settings.base_url', true), 
    '/functions/v1/send-custom-email'
  )
WHERE true;