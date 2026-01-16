-- Add input validation constraints to prompt_templates table
ALTER TABLE public.prompt_templates 
ADD CONSTRAINT name_length CHECK (LENGTH(name) > 0 AND LENGTH(name) <= 200),
ADD CONSTRAINT description_length CHECK (LENGTH(description) > 0 AND LENGTH(description) <= 2000),
ADD CONSTRAINT tags_count CHECK (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 20);