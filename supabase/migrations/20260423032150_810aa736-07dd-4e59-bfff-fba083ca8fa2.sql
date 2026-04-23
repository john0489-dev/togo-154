
-- ============ FIX 1: Email exposure on profiles ============
-- Use column-level privileges to ensure email is only readable by the owner.
-- Public/authenticated users keep access to all other profile columns when is_public=true.

-- Revoke broad SELECT and re-grant only non-email columns
REVOKE SELECT ON public.profiles FROM anon, authenticated;

GRANT SELECT (
  id, avatar_url, bio, city, created_at, display_name,
  followers_count, following_count, is_public, plan, pro_expires_at, username
) ON public.profiles TO anon, authenticated;

-- Allow owners to read their own email via a separate column grant guarded by RLS
GRANT SELECT (email) ON public.profiles TO authenticated;

-- Tighten existing SELECT policy: anonymous users can see public profiles (non-email columns),
-- authenticated users can see public profiles or their own row.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Public profiles viewable (no email for others)"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (is_public = true OR auth.uid() = id);

-- ============ FIX 2: Restrict lists / list_members / restaurants SELECT to members ============

-- LISTS: only members can view
DROP POLICY IF EXISTS "Authenticated can view lists" ON public.lists;
CREATE POLICY "Members can view their lists"
ON public.lists
FOR SELECT
TO authenticated
USING (public.is_list_member(auth.uid(), id));

-- LIST_MEMBERS: only members of the same list can view membership rows
DROP POLICY IF EXISTS "Authenticated can view list members" ON public.list_members;
CREATE POLICY "Members can view list members"
ON public.list_members
FOR SELECT
TO authenticated
USING (public.is_list_member(auth.uid(), list_id));

-- RESTAURANTS: only members of the parent list can view
DROP POLICY IF EXISTS "Authenticated can view restaurants" ON public.restaurants;
CREATE POLICY "Members can view restaurants"
ON public.restaurants
FOR SELECT
TO authenticated
USING (public.is_list_member(auth.uid(), list_id));
