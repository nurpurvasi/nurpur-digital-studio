alter view public.site_content_public set (security_invoker = true);

-- Column-level access: anon may read only published content columns, never `draft`.
grant select (id, published, updated_at) on public.site_content to anon;

drop policy if exists "Public can read published content columns" on public.site_content;
create policy "Public can read published content columns"
on public.site_content for select to anon
using (true);