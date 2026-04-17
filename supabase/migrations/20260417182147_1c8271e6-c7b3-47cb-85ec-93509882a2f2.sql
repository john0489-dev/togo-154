UPDATE public.restaurants
SET latitude = NULL,
    longitude = NULL,
    address = NULL
WHERE latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND (
    COALESCE(location, '') ILIKE '%são paulo%'
    OR COALESCE(location, '') ILIKE '%sao paulo%'
    OR COALESCE(location, '') = ''
    OR COALESCE(location, '') ILIKE '%pinheiros%'
    OR COALESCE(location, '') ILIKE '%jardins%'
    OR COALESCE(location, '') ILIKE '%itaim%'
    OR COALESCE(location, '') ILIKE '%vila madalena%'
    OR COALESCE(location, '') ILIKE '%vila mariana%'
    OR COALESCE(location, '') ILIKE '%mooca%'
    OR COALESCE(location, '') ILIKE '%centro%'
    OR COALESCE(location, '') ILIKE '%perdizes%'
    OR COALESCE(location, '') ILIKE '%pompeia%'
    OR COALESCE(location, '') ILIKE '%bela vista%'
    OR COALESCE(location, '') ILIKE '%campo belo%'
    OR COALESCE(location, '') ILIKE '%vila olímpia%'
    OR COALESCE(location, '') ILIKE '%vila olimpia%'
    OR COALESCE(location, '') ILIKE '%barra funda%'
    OR COALESCE(location, '') ILIKE '%paraíso%'
    OR COALESCE(location, '') ILIKE '%paraiso%'
    OR COALESCE(location, '') ILIKE '%anália franco%'
    OR COALESCE(location, '') ILIKE '%analia franco%'
    OR COALESCE(location, '') ILIKE '%conceição%'
    OR COALESCE(location, '') ILIKE '%rosewood%'
    OR COALESCE(location, '') ILIKE '%tania bulhões%'
    OR COALESCE(location, '') ILIKE '%tania bulhoes%'
    OR COALESCE(location, '') ILIKE '%zona norte%'
  )
  AND NOT (
    latitude BETWEEN -24.2 AND -23.2
    AND longitude BETWEEN -46.95 AND -46.2
  );