
-- 1. Add plan fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS pro_expires_at timestamptz;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'pro'));

-- 2. Allow users to update their own profile (needed so they can read it; updates will be admin-only later via service role)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND plan = (SELECT plan FROM public.profiles WHERE id = auth.uid()));
-- Note: the WITH CHECK prevents users from upgrading their own plan via direct update.

-- 3. Helper function: returns effective plan considering expiration
CREATE OR REPLACE FUNCTION public.get_user_plan(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN p.plan = 'pro' AND (p.pro_expires_at IS NULL OR p.pro_expires_at > now())
      THEN 'pro'
    ELSE 'free'
  END
  FROM public.profiles p
  WHERE p.id = _user_id
$$;

-- 4. Update handle_new_user to set default plan
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, plan)
  VALUES (NEW.id, NEW.email, 'free')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

-- 5. Add Pro-only fields to restaurants
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS price_range text,
  ADD COLUMN IF NOT EXISTS occasion text,
  ADD COLUMN IF NOT EXISTS visited_at timestamptz;

ALTER TABLE public.restaurants
  DROP CONSTRAINT IF EXISTS restaurants_price_range_check;
ALTER TABLE public.restaurants
  ADD CONSTRAINT restaurants_price_range_check
  CHECK (price_range IS NULL OR price_range IN ('$', '$$', '$$$', '$$$$'));
