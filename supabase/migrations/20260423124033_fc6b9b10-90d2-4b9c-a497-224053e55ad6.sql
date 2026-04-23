-- Admin: list all signups (id, email, created_at)
CREATE OR REPLACE FUNCTION public.get_all_signups_admin()
RETURNS TABLE (id uuid, email text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.email, p.created_at
  FROM public.profiles p
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY p.created_at DESC
$$;

REVOKE ALL ON FUNCTION public.get_all_signups_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_all_signups_admin() TO authenticated;

-- List member emails: only callable by members of that list
CREATE OR REPLACE FUNCTION public.get_list_member_emails(_list_id uuid)
RETURNS TABLE (user_id uuid, email text, role list_role, joined_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lm.user_id, p.email, lm.role, lm.joined_at
  FROM public.list_members lm
  LEFT JOIN public.profiles p ON p.id = lm.user_id
  WHERE lm.list_id = _list_id
    AND public.is_list_member(auth.uid(), _list_id)
  ORDER BY lm.joined_at ASC
$$;

REVOKE ALL ON FUNCTION public.get_list_member_emails(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_list_member_emails(uuid) TO authenticated;

-- Email of a specific user, only if the caller shares a list with them
CREATE OR REPLACE FUNCTION public.get_user_email_for_list_member(_user_id uuid, _list_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.email
  FROM public.profiles p
  WHERE p.id = _user_id
    AND public.is_list_member(auth.uid(), _list_id)
    AND public.is_list_member(_user_id, _list_id)
$$;

REVOKE ALL ON FUNCTION public.get_user_email_for_list_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_email_for_list_member(uuid, uuid) TO authenticated;