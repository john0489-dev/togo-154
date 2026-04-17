DROP POLICY IF EXISTS "Authenticated users can create lists" ON public.lists;

CREATE POLICY "Users can create their own lists"
ON public.lists
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());
