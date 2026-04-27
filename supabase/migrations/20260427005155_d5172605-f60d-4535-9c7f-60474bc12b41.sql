-- Public buckets serve file URLs without needing a SELECT policy on storage.objects.
-- Removing the broad SELECT policy prevents listing the bucket contents while
-- keeping individual public URLs working.
DROP POLICY IF EXISTS "Restaurant photos are publicly viewable" ON storage.objects;