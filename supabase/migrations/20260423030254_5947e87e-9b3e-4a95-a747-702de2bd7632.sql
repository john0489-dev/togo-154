-- ============================================================
-- 1. PROFILES: novos campos sociais
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text UNIQUE,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS followers_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count integer NOT NULL DEFAULT 0;

-- bio max 150 chars (validação por trigger — não usar CHECK porque pode ser alterado depois)
CREATE OR REPLACE FUNCTION public.validate_profile_bio()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.bio IS NOT NULL AND char_length(NEW.bio) > 150 THEN
    RAISE EXCEPTION 'Bio cannot exceed 150 characters';
  END IF;
  IF NEW.username IS NOT NULL AND NEW.username !~ '^[a-z0-9_]{3,30}$' THEN
    RAISE EXCEPTION 'Username must be 3-30 chars: lowercase letters, numbers and underscore only';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_profile_bio_trigger ON public.profiles;
CREATE TRIGGER validate_profile_bio_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_bio();

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON public.profiles(is_public);

-- Atualizar policy de SELECT para permitir perfis públicos sem login
DROP POLICY IF EXISTS "Authenticated can view profiles" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (is_public = true OR auth.uid() = id);

-- ============================================================
-- 2. FOLLOWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows"
  ON public.follows FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can follow others"
  ON public.follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- ============================================================
-- 3. ACTIVITY_FEED
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('added_restaurant', 'created_list', 'followed_user')),
  target_id uuid,
  target_name text,
  list_id uuid REFERENCES public.lists(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_user_created ON public.activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_feed(created_at DESC);

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Visível se o autor tem perfil público OU se é o próprio
CREATE POLICY "Activities visible based on profile visibility"
  ON public.activity_feed FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = activity_feed.user_id
        AND (p.is_public = true OR p.id = auth.uid())
    )
  );

CREATE POLICY "Users create own activities"
  ON public.activity_feed FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own activities"
  ON public.activity_feed FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('new_follower', 'restaurant_added')),
  title text NOT NULL,
  body text,
  target_url text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users mark own notifications read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages notifications"
  ON public.notifications FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 5. TRIGGERS: contadores + notificação de novo seguidor
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  follower_name text;
  follower_username text;
BEGIN
  -- contadores
  UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
  UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;

  -- notificação para quem foi seguido
  SELECT COALESCE(display_name, username, 'Alguém'), username
    INTO follower_name, follower_username
  FROM public.profiles WHERE id = NEW.follower_id;

  INSERT INTO public.notifications (user_id, actor_id, type, title, body, target_url)
  VALUES (
    NEW.following_id,
    NEW.follower_id,
    'new_follower',
    follower_name || ' começou a seguir você',
    NULL,
    CASE WHEN follower_username IS NOT NULL THEN '/u/' || follower_username ELSE NULL END
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_unfollow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
  UPDATE public.profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_follow_created ON public.follows;
CREATE TRIGGER on_follow_created
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_follow();

DROP TRIGGER IF EXISTS on_follow_deleted ON public.follows;
CREATE TRIGGER on_follow_deleted
  AFTER DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_unfollow();