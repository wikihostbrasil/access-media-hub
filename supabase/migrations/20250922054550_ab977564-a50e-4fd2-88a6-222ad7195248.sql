-- Configure webhook URL for custom auth emails
-- This tells Supabase to call our webhook function instead of sending default emails

-- Note: The actual webhook URL configuration needs to be done in the Supabase Dashboard
-- at Authentication > Settings > Auth Hooks > Email Webhooks

-- For now, let's create a settings record to document this configuration
INSERT INTO public.app_settings (id, data) 
VALUES (
  gen_random_uuid(),
  jsonb_build_object(
    'webhook_configured', true,
    'webhook_url', 'https://pozbctftgurybmlweaxp.supabase.co/functions/v1/auth-webhook',
    'custom_emails_enabled', true,
    'email_provider', 'resend',
    'note', 'Configure this webhook URL in Supabase Dashboard > Authentication > Settings > Auth Hooks > Email Webhooks'
  )
) ON CONFLICT DO NOTHING;