-- Tighten restaurants RLS: require list membership for all writes
DROP POLICY IF EXISTS "Authenticated can add restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Authenticated can update restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Authenticated can delete restaurants" ON public.restaurants;

CREATE POLICY "Members can add restaurants"
ON public.restaurants
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_list_member(auth.uid(), list_id)
);

CREATE POLICY "Members can update restaurants"
ON public.restaurants
FOR UPDATE
TO authenticated
USING (
  public.is_list_member(auth.uid(), list_id)
)
WITH CHECK (
  public.is_list_member(auth.uid(), list_id)
);

CREATE POLICY "Members can delete restaurants"
ON public.restaurants
FOR DELETE
TO authenticated
USING (
  public.is_list_member(auth.uid(), list_id)
);
