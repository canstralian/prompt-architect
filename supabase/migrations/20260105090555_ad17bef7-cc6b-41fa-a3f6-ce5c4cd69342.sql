-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are publicly readable
CREATE POLICY "Profiles are publicly readable"
ON public.profiles
FOR SELECT
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow authenticated users to create templates
CREATE POLICY "Authenticated users can create templates"
ON public.prompt_templates
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to update their own templates
CREATE POLICY "Users can update their own templates"
ON public.prompt_templates
FOR UPDATE
TO authenticated
USING (author = (SELECT display_name FROM public.profiles WHERE id = auth.uid()));

-- Allow users to delete their own templates
CREATE POLICY "Users can delete their own templates"
ON public.prompt_templates
FOR DELETE
TO authenticated
USING (author = (SELECT display_name FROM public.profiles WHERE id = auth.uid()));