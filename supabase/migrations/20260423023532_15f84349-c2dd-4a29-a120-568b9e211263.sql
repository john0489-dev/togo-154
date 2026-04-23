-- Helper function: count how many restaurants a user has added (across all lists)
CREATE OR REPLACE FUNCTION public.count_user_restaurants(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM public.restaurants
  WHERE added_by = _user_id
$$;

-- Helper function: check whether the user can add another restaurant under their plan
CREATE OR REPLACE FUNCTION public.can_add_restaurant(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN public.get_user_plan(_user_id) = 'pro' THEN true
      ELSE public.count_user_restaurants(_user_id) < 20
    END
$$;

-- Replace the INSERT policy on restaurants to enforce the Free plan limit.
DROP POLICY IF EXISTS "Members can add restaurants" ON public.restaurants;

CREATE POLICY "Members can add restaurants"
ON public.restaurants
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_list_member(auth.uid(), list_id)
  AND added_by = auth.uid()
  AND public.can_add_restaurant(auth.uid())
);
