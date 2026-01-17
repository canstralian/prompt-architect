-- Add length constraint to display_name in profiles table
ALTER TABLE public.profiles 
ADD CONSTRAINT display_name_length 
CHECK (display_name IS NULL OR (LENGTH(display_name) > 0 AND LENGTH(display_name) <= 100));