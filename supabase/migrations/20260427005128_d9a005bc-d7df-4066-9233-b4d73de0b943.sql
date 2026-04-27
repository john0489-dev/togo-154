-- Photos column on restaurants (array, max 3 enforced via trigger)
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS photos text[] NOT NULL DEFAULT '{}';

CREATE OR REPLACE FUNCTION public.validate_restaurant_photos()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.photos IS NOT NULL AND array_length(NEW.photos, 1) > 3 THEN
    RAISE EXCEPTION 'Máximo de 3 fotos por restaurante';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_restaurant_photos_trigger ON public.restaurants;
CREATE TRIGGER validate_restaurant_photos_trigger
  BEFORE INSERT OR UPDATE OF photos ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.validate_restaurant_photos();

-- Storage bucket for restaurant photos (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-photos', 'restaurant-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read for the bucket
DROP POLICY IF EXISTS "Restaurant photos are publicly viewable" ON storage.objects;
CREATE POLICY "Restaurant photos are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-photos');

-- Authenticated users can upload to their own folder (path starts with their user id)
DROP POLICY IF EXISTS "Users upload own restaurant photos" ON storage.objects;
CREATE POLICY "Users upload own restaurant photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'restaurant-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete photos they uploaded
DROP POLICY IF EXISTS "Users delete own restaurant photos" ON storage.objects;
CREATE POLICY "Users delete own restaurant photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'restaurant-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own photos (rename/move)
DROP POLICY IF EXISTS "Users update own restaurant photos" ON storage.objects;
CREATE POLICY "Users update own restaurant photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'restaurant-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);