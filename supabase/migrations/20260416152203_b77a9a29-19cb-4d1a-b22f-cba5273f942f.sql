
ALTER TABLE public.list_members
ADD CONSTRAINT list_members_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
