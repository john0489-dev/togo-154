
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can read invite by code" ON public.list_invites;
DROP POLICY IF EXISTS "Invited users can accept" ON public.list_invites;

-- More restrictive: users can read invites targeted at their email
CREATE POLICY "Users can read invites by email"
  ON public.list_invites FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
