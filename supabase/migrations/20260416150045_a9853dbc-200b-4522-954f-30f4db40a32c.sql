-- Fix list_members policies - the server functions handle authorization
DROP POLICY IF EXISTS "Members can view list members" ON public.list_members;
CREATE POLICY "Authenticated can view list members"
ON public.list_members FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Owners can add members" ON public.list_members;
CREATE POLICY "Authenticated can add members"
ON public.list_members FOR INSERT TO authenticated WITH CHECK (true);

-- Fix lists SELECT policy
DROP POLICY IF EXISTS "Members can view their lists" ON public.lists;
CREATE POLICY "Authenticated can view lists"
ON public.lists FOR SELECT TO authenticated USING (true);

-- Fix restaurants policies
DROP POLICY IF EXISTS "Members can view restaurants" ON public.restaurants;
CREATE POLICY "Authenticated can view restaurants"
ON public.restaurants FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Members can add restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Editors and owners can add restaurants" ON public.restaurants;
CREATE POLICY "Authenticated can add restaurants"
ON public.restaurants FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Members can update restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Editors and owners can update restaurants" ON public.restaurants;
CREATE POLICY "Authenticated can update restaurants"
ON public.restaurants FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Members can delete restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Editors and owners can delete restaurants" ON public.restaurants;
CREATE POLICY "Authenticated can delete restaurants"
ON public.restaurants FOR DELETE TO authenticated USING (true);

-- Fix list_invites policies
DROP POLICY IF EXISTS "Owners can create invites" ON public.list_invites;
CREATE POLICY "Authenticated can create invites"
ON public.list_invites FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view invites" ON public.list_invites;
DROP POLICY IF EXISTS "Anyone can view invites by code" ON public.list_invites;
CREATE POLICY "Authenticated can view invites"
ON public.list_invites FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update invites" ON public.list_invites;
CREATE POLICY "Authenticated can update invites"
ON public.list_invites FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
