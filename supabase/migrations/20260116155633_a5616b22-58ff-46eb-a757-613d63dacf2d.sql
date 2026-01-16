-- Add rate limiting for template creation (max 10 templates per hour per user)

-- Create function to check template creation rate limit
CREATE OR REPLACE FUNCTION public.check_template_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  template_count int;
  rate_limit int := 10;
  time_window interval := '1 hour';
BEGIN
  -- Count templates created by this user in the last hour
  SELECT COUNT(*) INTO template_count
  FROM public.prompt_templates
  WHERE author = (SELECT display_name FROM public.profiles WHERE id = auth.uid())
    AND created_at > now() - time_window;
  
  -- If rate limit exceeded, reject the insert
  IF template_count >= rate_limit THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum % templates per hour', rate_limit;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to check rate limit before insert (runs before enforce_template_defaults)
CREATE TRIGGER check_template_rate_limit_trigger
BEFORE INSERT ON public.prompt_templates
FOR EACH ROW EXECUTE FUNCTION public.check_template_rate_limit();