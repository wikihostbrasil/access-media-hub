-- Reset supporting tables and fix profile auto-creation
-- 1) Create trigger to auto-create profiles on new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2) Add plays table for audio play logs
CREATE TABLE IF NOT EXISTS public.plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL,
  user_id uuid NOT NULL,
  played_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;

-- RLS policies for plays
DROP POLICY IF EXISTS "Admins can view all plays" ON public.plays;
CREATE POLICY "Admins can view all plays"
ON public.plays FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "Users can insert their own plays" ON public.plays;
CREATE POLICY "Users can insert their own plays"
ON public.plays FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own plays" ON public.plays;
CREATE POLICY "Users can view their own plays"
ON public.plays FOR SELECT
USING (auth.uid() = user_id);

-- 3) Soft delete support on files
DO $$ BEGIN
  ALTER TABLE public.files ADD COLUMN deleted_at timestamptz NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Allow admins to view all files (including deleted/expired/blocked)
DROP POLICY IF EXISTS "Admins can view all files" ON public.files;
CREATE POLICY "Admins can view all files"
ON public.files FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'));

-- 4) Optional: reset tables so you can recreate users cleanly
TRUNCATE TABLE public.user_groups RESTART IDENTITY;
TRUNCATE TABLE public.user_categories RESTART IDENTITY;
TRUNCATE TABLE public.file_permissions RESTART IDENTITY;
TRUNCATE TABLE public.profiles RESTART IDENTITY;
TRUNCATE TABLE public.plays RESTART IDENTITY;
TRUNCATE TABLE public.downloads RESTART IDENTITY;