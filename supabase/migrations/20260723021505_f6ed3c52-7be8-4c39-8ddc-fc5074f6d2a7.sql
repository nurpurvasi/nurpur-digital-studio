GRANT USAGE ON TYPE public.app_role TO authenticated, service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Prevent a race where two first-time signups happen at the same moment.
  PERFORM pg_advisory_xact_lock(hashtext('public.user_roles.first_admin'));

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;