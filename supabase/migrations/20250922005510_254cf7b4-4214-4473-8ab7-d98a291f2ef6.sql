-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'operator', 'user');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role user_role NOT NULL DEFAULT 'user',
  full_name TEXT NOT NULL,
  receive_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create files table
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_groups junction table
CREATE TABLE public.user_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- Create user_categories junction table
CREATE TABLE public.user_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id)
);

-- Create file_permissions table
CREATE TABLE public.file_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_permission_type CHECK (
    (user_id IS NOT NULL AND group_id IS NULL AND category_id IS NULL) OR
    (user_id IS NULL AND group_id IS NOT NULL AND category_id IS NULL) OR
    (user_id IS NULL AND group_id IS NULL AND category_id IS NOT NULL)
  )
);

-- Create downloads table
CREATE TABLE public.downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for groups (operators can manage their own groups)
CREATE POLICY "Users can view groups they created or are part of" ON public.groups FOR SELECT USING (
  created_by = auth.uid() OR 
  id IN (SELECT group_id FROM public.user_groups WHERE user_id = auth.uid())
);
CREATE POLICY "Operators can create groups" ON public.groups FOR INSERT WITH CHECK (
  auth.uid() = created_by AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'operator'))
);
CREATE POLICY "Operators can update their own groups" ON public.groups FOR UPDATE USING (
  created_by = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'operator'))
);
CREATE POLICY "Operators can delete their own groups" ON public.groups FOR DELETE USING (
  created_by = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'operator'))
);

-- Create policies for categories (operators can manage their own categories)
CREATE POLICY "Users can view categories they created or are part of" ON public.categories FOR SELECT USING (
  created_by = auth.uid() OR 
  id IN (SELECT category_id FROM public.user_categories WHERE user_id = auth.uid())
);
CREATE POLICY "Operators can create categories" ON public.categories FOR INSERT WITH CHECK (
  auth.uid() = created_by AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'operator'))
);
CREATE POLICY "Operators can update their own categories" ON public.categories FOR UPDATE USING (
  created_by = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'operator'))
);
CREATE POLICY "Operators can delete their own categories" ON public.categories FOR DELETE USING (
  created_by = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'operator'))
);

-- Create policies for files
CREATE POLICY "Users can view files they have permission to access" ON public.files FOR SELECT USING (
  uploaded_by = auth.uid() OR
  id IN (
    SELECT fp.file_id FROM public.file_permissions fp
    WHERE fp.user_id = auth.uid()
    OR fp.group_id IN (SELECT group_id FROM public.user_groups WHERE user_id = auth.uid())
    OR fp.category_id IN (SELECT category_id FROM public.user_categories WHERE user_id = auth.uid())
  )
);
CREATE POLICY "Operators can create files" ON public.files FOR INSERT WITH CHECK (
  auth.uid() = uploaded_by AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'operator'))
);
CREATE POLICY "Operators can update their own files" ON public.files FOR UPDATE USING (
  uploaded_by = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'operator'))
);
CREATE POLICY "Operators can delete their own files" ON public.files FOR DELETE USING (
  uploaded_by = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'operator'))
);

-- Create policies for user_groups
CREATE POLICY "Users can view group memberships" ON public.user_groups FOR SELECT USING (
  user_id = auth.uid() OR 
  added_by = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Operators can add users to groups" ON public.user_groups FOR INSERT WITH CHECK (
  added_by = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'operator'))
);
CREATE POLICY "Operators can remove users from groups" ON public.user_groups FOR DELETE USING (
  added_by = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'operator'))
);

-- Create policies for user_categories
CREATE POLICY "Users can view category memberships" ON public.user_categories FOR SELECT USING (
  user_id = auth.uid() OR 
  added_by = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Operators can add users to categories" ON public.user_categories FOR INSERT WITH CHECK (
  added_by = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'operator'))
);
CREATE POLICY "Operators can remove users from categories" ON public.user_categories FOR DELETE USING (
  added_by = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'operator'))
);

-- Create policies for file_permissions
CREATE POLICY "Users can view file permissions" ON public.file_permissions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.files f 
    WHERE f.id = file_id AND (
      f.uploaded_by = auth.uid() OR
      EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
    )
  )
);
CREATE POLICY "Operators can manage file permissions" ON public.file_permissions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.files f 
    WHERE f.id = file_id AND f.uploaded_by = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'operator'))
  )
);

-- Create policies for downloads
CREATE POLICY "Users can view their own downloads" ON public.downloads FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all downloads" ON public.downloads FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can record their own downloads" ON public.downloads FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON public.files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets for files
INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', false);

-- Create storage policies
CREATE POLICY "Operators can upload files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'files' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'operator'))
);

CREATE POLICY "Users can download files they have access to" ON storage.objects FOR SELECT USING (
  bucket_id = 'files' AND 
  name IN (
    SELECT f.file_url FROM public.files f
    JOIN public.file_permissions fp ON f.id = fp.file_id
    WHERE fp.user_id = auth.uid()
    OR fp.group_id IN (SELECT group_id FROM public.user_groups WHERE user_id = auth.uid())
    OR fp.category_id IN (SELECT category_id FROM public.user_categories WHERE user_id = auth.uid())
    OR f.uploaded_by = auth.uid()
  )
);