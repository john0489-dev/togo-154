
-- Drop the broken policy that references auth.users
DROP POLICY IF EXISTS "Users can read invites by email" ON public.list_invites;

-- Recreate using auth.jwt() which doesn't require access to auth.users
CREATE POLICY "Users can read invites by email"
ON public.list_invites FOR SELECT TO authenticated
USING (email = (auth.jwt() ->> 'email'));
