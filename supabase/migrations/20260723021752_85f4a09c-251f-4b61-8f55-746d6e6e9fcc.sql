REVOKE ALL ON public.site_content FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.user_roles FROM PUBLIC, anon, authenticated;

GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;