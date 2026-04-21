-- Step 1: merge coordinates from duplicate list B into original list A
-- where A is missing them
UPDATE restaurants a
SET 
  latitude = b.latitude,
  longitude = b.longitude,
  address = COALESCE(a.address, b.address),
  updated_at = now()
FROM restaurants b
WHERE a.list_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND b.list_id = '6f31abc9-6c4e-4162-b15c-662a8e518755'
  AND lower(trim(a.name)) = lower(trim(b.name))
  AND lower(trim(a.location)) = lower(trim(b.location))
  AND a.latitude IS NULL
  AND b.latitude IS NOT NULL;

-- Step 2: delete all restaurants in duplicate list B
DELETE FROM restaurants WHERE list_id = '6f31abc9-6c4e-4162-b15c-662a8e518755';

-- Step 3: delete the duplicate list itself (and its members via cascade-style cleanup)
DELETE FROM list_members WHERE list_id = '6f31abc9-6c4e-4162-b15c-662a8e518755';
DELETE FROM list_invites WHERE list_id = '6f31abc9-6c4e-4162-b15c-662a8e518755';
DELETE FROM lists WHERE id = '6f31abc9-6c4e-4162-b15c-662a8e518755';