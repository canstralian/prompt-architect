-- Add rate limiting for like operations (max 60 per hour per user)
CREATE OR REPLACE FUNCTION public.check_like_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  action_count int;
  rate_limit int := 60;
  time_window interval := '1 hour';
BEGIN
  SELECT COUNT(*) INTO action_count
  FROM public.user_template_likes
  WHERE user_id = auth.uid()
    AND created_at > now() - time_window;
  
  IF action_count >= rate_limit THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum % likes per hour', rate_limit;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_like_rate_limit_trigger
BEFORE INSERT ON public.user_template_likes
FOR EACH ROW EXECUTE FUNCTION public.check_like_rate_limit();

-- Add rate limiting for save operations (max 60 per hour per user)
CREATE OR REPLACE FUNCTION public.check_save_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  action_count int;
  rate_limit int := 60;
  time_window interval := '1 hour';
BEGIN
  SELECT COUNT(*) INTO action_count
  FROM public.user_saved_templates
  WHERE user_id = auth.uid()
    AND saved_at > now() - time_window;
  
  IF action_count >= rate_limit THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum % saves per hour', rate_limit;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_save_rate_limit_trigger
BEFORE INSERT ON public.user_saved_templates
FOR EACH ROW EXECUTE FUNCTION public.check_save_rate_limit();