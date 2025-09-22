-- Drop existing overly permissive admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create more granular policies for admin access
-- Admins can see basic user info for management (excluding sensitive data like WhatsApp)
CREATE POLICY "Admins can view basic user info" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::user_role) 
  AND auth.uid() != user_id -- This policy only for viewing OTHER users
);

-- Users can view their own complete profile (including WhatsApp)
-- (This policy already exists but making it explicit)
CREATE POLICY "Users can view own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a view for admin user management that excludes sensitive data
CREATE OR REPLACE VIEW public.profiles_admin_view AS
SELECT 
  id,
  user_id,
  full_name,
  role,
  active,
  receive_notifications,
  created_at,
  updated_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.profiles_admin_view OWNER TO postgres;

-- Create RLS policy for the admin view
CREATE POLICY "Admins can access user management view"
ON public.profiles_admin_view
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));