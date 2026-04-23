ALTER TABLE public.restaurants 
  DROP CONSTRAINT IF EXISTS restaurants_list_id_fkey,
  ADD CONSTRAINT restaurants_list_id_fkey 
    FOREIGN KEY (list_id) 
    REFERENCES public.lists(id) 
    ON DELETE CASCADE;

ALTER TABLE public.list_invites
  DROP CONSTRAINT IF EXISTS list_invites_list_id_fkey,
  ADD CONSTRAINT list_invites_list_id_fkey
    FOREIGN KEY (list_id)
    REFERENCES public.lists(id)
    ON DELETE CASCADE;

ALTER TABLE public.list_members
  DROP CONSTRAINT IF EXISTS list_members_list_id_fkey,
  ADD CONSTRAINT list_members_list_id_fkey
    FOREIGN KEY (list_id)
    REFERENCES public.lists(id)
    ON DELETE CASCADE;