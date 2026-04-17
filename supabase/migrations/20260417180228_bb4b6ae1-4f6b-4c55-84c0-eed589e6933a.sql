-- 1) list_invites: remove overly permissive policies
DROP POLICY IF EXISTS "Authenticated can view invites" ON public.list_invites;
DROP POLICY IF EXISTS "Authenticated can update invites" ON public.list_invites;
DROP POLICY IF EXISTS "Authenticated can create invites" ON public.list_invites;

-- Recreate INSERT scoped to list owner only
CREATE POLICY "Owners can create invites"
ON public.list_invites
FOR INSERT
TO authenticated
WITH CHECK (
  public.get_list_role(auth.uid(), list_id) = 'owner'::public.list_role
  AND created_by = auth.uid()
);

-- Recreate UPDATE scoped: invited email user (to accept) OR list owner
CREATE POLICY "Invited or owner can update invites"
ON public.list_invites
FOR UPDATE
TO authenticated
USING (
  (email IS NOT NULL AND email = (auth.jwt() ->> 'email'))
  OR public.get_list_role(auth.uid(), list_id) = 'owner'::public.list_role
)
WITH CHECK (
  (email IS NOT NULL AND email = (auth.jwt() ->> 'email'))
  OR public.get_list_role(auth.uid(), list_id) = 'owner'::public.list_role
);

-- SELECT policies "Owners can view invites for their lists" and
-- "Users can read invites by email" already exist and are correctly scoped.

-- 2) list_members: prevent privilege escalation
DROP POLICY IF EXISTS "Authenticated can add members" ON public.list_members;

-- Only list owners can add members directly via RLS.
-- The accept-invite flow uses the service-role admin client (bypasses RLS),
-- so invited users joining via /invite/:code continues to work.
CREATE POLICY "Owners can add members"
ON public.list_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.get_list_role(auth.uid(), list_id) = 'owner'::public.list_role
);
