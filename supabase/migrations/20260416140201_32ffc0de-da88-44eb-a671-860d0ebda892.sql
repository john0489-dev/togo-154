
-- Replace the broad "members can view" policy with an owners-only policy
DROP POLICY IF EXISTS "Members can view invites for their lists" ON public.list_invites;

CREATE POLICY "Owners can view invites for their lists"
ON public.list_invites
FOR SELECT
TO authenticated
USING (get_list_role(auth.uid(), list_id) = 'owner'::list_role);
