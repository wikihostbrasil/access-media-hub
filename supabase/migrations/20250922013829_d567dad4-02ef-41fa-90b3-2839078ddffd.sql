-- 1) Helper function to check roles (avoids RLS recursion)
create or replace function public.has_role(_user_id uuid, _role user_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = _user_id and role = _role
  );
$$;

-- 2) Create profiles automatically on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Recreate trigger safely
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3) Backfill profiles for existing users (idempotent)
insert into public.profiles (user_id, full_name)
select u.id, coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1))
from auth.users u
where not exists (
  select 1 from public.profiles p where p.user_id = u.id
);

-- 4) Profiles policies to allow admins to manage all profiles
-- View policy (drop then create to avoid duplicates)
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin') or (auth.uid() = user_id));

-- Update policy (drop then create)
drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles
  for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin') or (auth.uid() = user_id))
  with check (public.has_role(auth.uid(), 'admin') or (auth.uid() = user_id));

-- 5) Storage policies for 'files' bucket (private bucket)
-- Insert policy
drop policy if exists "Admins and operators can upload to files bucket" on storage.objects;
create policy "Admins and operators can upload to files bucket"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'files'
    and (auth.uid()::text = (storage.foldername(name))[1])
    and (
      public.has_role(auth.uid(), 'admin')
      or public.has_role(auth.uid(), 'operator')
    )
  );

-- Select policy
drop policy if exists "View own or admin files" on storage.objects;
create policy "View own or admin files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'files'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.has_role(auth.uid(), 'admin')
    )
  );