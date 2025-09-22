-- Fix infinite recursion: adjust file_permissions RLS to avoid referencing files

-- 1) Drop recursive policies
drop policy if exists "Operators can manage file permissions" on public.file_permissions;
drop policy if exists "Users can view file permissions" on public.file_permissions;

-- 2) Allow admins/operators to manage file_permissions without referencing files
create policy "Admins/operators can manage file_permissions"
  on public.file_permissions
  for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operator'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operator'));

-- 3) Allow authenticated users to select file_permissions (for policy evaluation in files)
create policy "Authenticated can read file_permissions"
  on public.file_permissions
  for select
  to authenticated
  using (true);

-- 4) Ensure files policies stay as-is (no change), recursion is removed because file_permissions no longer references files