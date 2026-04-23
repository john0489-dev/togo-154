-- 1. Helper function to check profile visibility without exposing the profiles table to anon
CREATE OR REPLACE FUNCTION public.is_profile_public_or_self(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _profile_id
      AND (is_public = true OR id = auth.uid())
  )
$$;

-- 2. Replace the activity_feed SELECT policy to use the helper (so we can lock down profiles)
DROP POLICY IF EXISTS "Activities visible based on profile visibility" ON public.activity_feed;
CREATE POLICY "Activities visible based on profile visibility"
ON public.activity_feed
FOR SELECT
TO anon, authenticated
USING (public.is_profile_public_or_self(user_id));

-- 3. Tighten profiles SELECT: only the owner can read the full row (which contains email)
DROP POLICY IF EXISTS "Public profiles viewable (no email for others)" ON public.profiles;

CREATE POLICY "Owners can read their full profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 4. Public view that exposes non-sensitive profile fields only (NO email)
--    Use security_invoker so the view respects the caller's permissions but reads
--    via a SECURITY DEFINER function below for public visibility.
CREATE OR REPLACE FUNCTION public.get_public_profile(_profile_id uuid)
RETURNS TABLE (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  bio text,
  city text,
  followers_count integer,
  following_count integer,
  is_public boolean,
  plan text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, username, display_name, avatar_url, bio, city,
         followers_count, following_count, is_public, plan, created_at
  FROM public.profiles
  WHERE id = _profile_id
    AND (is_public = true OR id = auth.uid())
$$;

-- Revoke any default broad grants and grant intended access
REVOKE ALL ON FUNCTION public.get_public_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.is_profile_public_or_self(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_profile_public_or_self(uuid) TO anon, authenticated;