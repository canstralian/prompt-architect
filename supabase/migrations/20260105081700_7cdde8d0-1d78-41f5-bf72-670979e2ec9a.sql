-- Create template categories enum
CREATE TYPE public.template_category AS ENUM (
  'coding',
  'research',
  'writing',
  'automation',
  'analysis',
  'planning',
  'creative',
  'other'
);

-- Create prompt templates table
CREATE TABLE public.prompt_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category template_category NOT NULL DEFAULT 'other',
  author TEXT NOT NULL DEFAULT 'Lovable Team',
  is_curated BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  saves_count INTEGER NOT NULL DEFAULT 0,
  sections JSONB NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read templates (public library)
CREATE POLICY "Templates are publicly readable"
ON public.prompt_templates
FOR SELECT
USING (true);

-- Create user saved templates table (for future user saves)
CREATE TABLE public.user_saved_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_id UUID NOT NULL REFERENCES public.prompt_templates(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, template_id)
);

-- Enable RLS on saved templates
ALTER TABLE public.user_saved_templates ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own saves
CREATE POLICY "Users can view their saved templates"
ON public.user_saved_templates
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save templates"
ON public.user_saved_templates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave templates"
ON public.user_saved_templates
FOR DELETE
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_prompt_templates_updated_at
BEFORE UPDATE ON public.prompt_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();