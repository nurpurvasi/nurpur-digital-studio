alter view public.site_content_public set (security_invoker = false);
grant select on public.site_content_public to anon, authenticated;