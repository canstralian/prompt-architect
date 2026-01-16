-- Create function to enforce secure defaults on template creation
CREATE OR REPLACE FUNCTION public.enforce_template_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set author to the authenticated user's display name
  NEW.author := COALESCE(
    (SELECT display_name FROM public.profiles WHERE id = auth.uid()),
    'Anonymous'
  );
  
  -- Force secure defaults - users cannot manipulate these
  NEW.is_curated := false;
  NEW.likes_count := 0;
  NEW.saves_count := 0;
  NEW.created_at := now();
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$;

-- Create trigger to run before insert
CREATE TRIGGER enforce_template_defaults_trigger
BEFORE INSERT ON public.prompt_templates
FOR EACH ROW EXECUTE FUNCTION public.enforce_template_defaults();