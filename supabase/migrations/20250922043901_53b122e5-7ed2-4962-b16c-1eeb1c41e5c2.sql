-- Add validity date fields and status to files table
ALTER TABLE public.files 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
ADD COLUMN is_permanent BOOLEAN DEFAULT false;

-- Update existing files to be permanent by default
UPDATE public.files SET is_permanent = true WHERE is_permanent IS NULL;