-- Drop the existing public read policy
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;

-- Create new policy for authenticated-only access
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);