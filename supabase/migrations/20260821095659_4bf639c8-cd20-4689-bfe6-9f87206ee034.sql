drop policy if exists "Public can view published site content" on public.site_content;

drop policy if exists "Staff can insert site content" on public.site_content;
create policy "Staff can insert site content"
on public.site_content for insert to authenticated
with check (private.has_role(auth.uid(), 'admin'::app_role) or private.has_role(auth.uid(), 'editor'::app_role));

revoke select on public.site_content from anon;
grant select on public.site_content_public to anon, authenticated;