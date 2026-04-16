
-- Enum for member roles
CREATE TYPE public.list_role AS ENUM ('owner', 'editor', 'viewer');

-- Lists table
CREATE TABLE public.lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- List members table
CREATE TABLE public.list_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role list_role NOT NULL DEFAULT 'editor',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(list_id, user_id)
);

-- Restaurants table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  cuisine TEXT NOT NULL DEFAULT 'Variado',
  visited BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3,1) NOT NULL DEFAULT 0,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- List invites table (link + email)
CREATE TABLE public.list_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  email TEXT,
  role list_role NOT NULL DEFAULT 'editor',
  accepted BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security definer function to check list membership
CREATE OR REPLACE FUNCTION public.is_list_member(_user_id UUID, _list_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.list_members
    WHERE user_id = _user_id AND list_id = _list_id
  );
$$;

-- Security definer function to check list role
CREATE OR REPLACE FUNCTION public.get_list_role(_user_id UUID, _list_id UUID)
RETURNS list_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.list_members
  WHERE user_id = _user_id AND list_id = _list_id
  LIMIT 1;
$$;

-- Enable RLS on all tables
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_invites ENABLE ROW LEVEL SECURITY;

-- LISTS policies
CREATE POLICY "Members can view their lists"
  ON public.lists FOR SELECT
  TO authenticated
  USING (public.is_list_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create lists"
  ON public.lists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can update their lists"
  ON public.lists FOR UPDATE
  TO authenticated
  USING (public.get_list_role(auth.uid(), id) = 'owner');

CREATE POLICY "Owners can delete their lists"
  ON public.lists FOR DELETE
  TO authenticated
  USING (public.get_list_role(auth.uid(), id) = 'owner');

-- LIST_MEMBERS policies
CREATE POLICY "Members can view list members"
  ON public.list_members FOR SELECT
  TO authenticated
  USING (public.is_list_member(auth.uid(), list_id));

CREATE POLICY "Owners can add members"
  ON public.list_members FOR INSERT
  TO authenticated
  WITH CHECK (public.get_list_role(auth.uid(), list_id) = 'owner' OR user_id = auth.uid());

CREATE POLICY "Owners can remove members"
  ON public.list_members FOR DELETE
  TO authenticated
  USING (public.get_list_role(auth.uid(), list_id) = 'owner' OR user_id = auth.uid());

-- RESTAURANTS policies
CREATE POLICY "Members can view restaurants"
  ON public.restaurants FOR SELECT
  TO authenticated
  USING (public.is_list_member(auth.uid(), list_id));

CREATE POLICY "Editors and owners can add restaurants"
  ON public.restaurants FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_list_role(auth.uid(), list_id) IN ('owner', 'editor')
  );

CREATE POLICY "Editors and owners can update restaurants"
  ON public.restaurants FOR UPDATE
  TO authenticated
  USING (
    public.get_list_role(auth.uid(), list_id) IN ('owner', 'editor')
  );

CREATE POLICY "Editors and owners can delete restaurants"
  ON public.restaurants FOR DELETE
  TO authenticated
  USING (
    public.get_list_role(auth.uid(), list_id) IN ('owner', 'editor')
  );

-- LIST_INVITES policies
CREATE POLICY "Members can view invites for their lists"
  ON public.list_invites FOR SELECT
  TO authenticated
  USING (public.is_list_member(auth.uid(), list_id));

CREATE POLICY "Owners can create invites"
  ON public.list_invites FOR INSERT
  TO authenticated
  WITH CHECK (public.get_list_role(auth.uid(), list_id) = 'owner');

CREATE POLICY "Owners can delete invites"
  ON public.list_invites FOR DELETE
  TO authenticated
  USING (public.get_list_role(auth.uid(), list_id) = 'owner');

-- Allow anyone authenticated to read an invite by code (for accepting)
CREATE POLICY "Anyone can read invite by code"
  ON public.list_invites FOR SELECT
  TO authenticated
  USING (true);

-- Allow updating accepted status
CREATE POLICY "Invited users can accept"
  ON public.list_invites FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (accepted = true);

-- Auto-add owner as member when list is created
CREATE OR REPLACE FUNCTION public.auto_add_list_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.list_members (list_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_list_created
  AFTER INSERT ON public.lists
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_add_list_owner();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_lists_updated_at
  BEFORE UPDATE ON public.lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_list_members_user ON public.list_members(user_id);
CREATE INDEX idx_list_members_list ON public.list_members(list_id);
CREATE INDEX idx_restaurants_list ON public.restaurants(list_id);
CREATE INDEX idx_list_invites_code ON public.list_invites(invite_code);
CREATE INDEX idx_list_invites_email ON public.list_invites(email);
