-- Reset all tables by truncating them
-- Start with tables that don't have foreign key dependencies, then work up

TRUNCATE TABLE public.downloads CASCADE;
TRUNCATE TABLE public.plays CASCADE;
TRUNCATE TABLE public.file_permissions CASCADE;
TRUNCATE TABLE public.user_categories CASCADE;
TRUNCATE TABLE public.user_groups CASCADE;
TRUNCATE TABLE public.files CASCADE;
TRUNCATE TABLE public.categories CASCADE;
TRUNCATE TABLE public.groups CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.app_settings CASCADE;