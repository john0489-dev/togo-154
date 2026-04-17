ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS address text;

CREATE INDEX IF NOT EXISTS idx_restaurants_coords ON public.restaurants (latitude, longitude);