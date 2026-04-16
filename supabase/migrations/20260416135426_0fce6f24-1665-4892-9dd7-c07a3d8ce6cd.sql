
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Owners can add members" ON public.list_members;

-- Recreate: only owners can directly add members
CREATE POLICY "Owners can add members"
ON public.list_members
FOR INSERT
TO authenticated
WITH CHECK (
  get_list_role(auth.uid(), list_id) = 'owner'::list_role
);
