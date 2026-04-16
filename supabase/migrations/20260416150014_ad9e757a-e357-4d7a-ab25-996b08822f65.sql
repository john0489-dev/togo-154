-- Drop the old restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create lists" ON public.lists;

-- Create a new INSERT policy that allows any authenticated user to insert
CREATE POLICY "Authenticated users can create lists"
ON public.lists
FOR INSERT
TO authenticated
WITH CHECK (true);
