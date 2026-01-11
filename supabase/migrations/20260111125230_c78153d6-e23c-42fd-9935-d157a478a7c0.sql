-- Create table to track user likes on templates
CREATE TABLE public.user_template_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.prompt_templates(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, template_id)
);

-- Enable RLS
ALTER TABLE public.user_template_likes ENABLE ROW LEVEL SECURITY;

-- Users can see their own likes
CREATE POLICY "Users can view their own likes"
ON public.user_template_likes
FOR SELECT
USING (auth.uid() = user_id);

-- Users can like templates
CREATE POLICY "Users can like templates"
ON public.user_template_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can unlike templates
CREATE POLICY "Users can unlike templates"
ON public.user_template_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to increment likes count
CREATE OR REPLACE FUNCTION public.increment_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.prompt_templates
  SET likes_count = likes_count + 1
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$;

-- Create function to decrement likes count
CREATE OR REPLACE FUNCTION public.decrement_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.prompt_templates
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = OLD.template_id;
  RETURN OLD;
END;
$$;

-- Create triggers
CREATE TRIGGER on_template_liked
  AFTER INSERT ON public.user_template_likes
  FOR EACH ROW EXECUTE FUNCTION public.increment_likes_count();

CREATE TRIGGER on_template_unliked
  AFTER DELETE ON public.user_template_likes
  FOR EACH ROW EXECUTE FUNCTION public.decrement_likes_count();