DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;

-- Anonymous: must have valid email and NO user_id
CREATE POLICY "Anonymous can join waitlist"
ON public.waitlist
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 255
);

-- Authenticated: valid email, and if user_id is set it must match auth.uid()
CREATE POLICY "Authenticated can join waitlist"
ON public.waitlist
FOR INSERT
TO authenticated
WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 255
);
