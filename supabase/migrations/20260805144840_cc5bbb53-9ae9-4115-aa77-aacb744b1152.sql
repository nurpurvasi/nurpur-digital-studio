CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

ALTER FUNCTION public.has_role(uuid, public.app_role) SET SCHEMA private;
ALTER FUNCTION private.has_role(uuid, public.app_role) SET search_path = public;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE OR REPLACE VIEW public.site_content_public
WITH (security_invoker = true, security_barrier = true)
AS
SELECT id, published, updated_at
FROM public.site_content;

CREATE OR REPLACE VIEW public.team_members_public
WITH (security_invoker = true, security_barrier = true)
AS
SELECT
  id,
  name,
  designation,
  bio,
  profile_image,
  social_links,
  featured,
  sort_order,
  status,
  publish_date,
  seo_title,
  seo_description,
  created_at,
  updated_at
FROM public.team_members
WHERE status = 'published'
  AND (publish_date IS NULL OR publish_date <= now());

CREATE POLICY "Public can view published site content"
ON public.site_content
FOR SELECT
TO anon
USING (true);

REVOKE ALL ON public.site_content FROM anon;
GRANT SELECT (id, published, updated_at) ON public.site_content TO anon;
GRANT SELECT ON public.site_content_public TO anon, authenticated, service_role;

CREATE POLICY "Public can view published team members"
ON public.team_members
FOR SELECT
TO anon
USING (
  status = 'published'
  AND (publish_date IS NULL OR publish_date <= now())
);

REVOKE ALL ON public.team_members FROM anon;
GRANT SELECT (
  id,
  name,
  designation,
  bio,
  profile_image,
  social_links,
  featured,
  sort_order,
  status,
  publish_date,
  seo_title,
  seo_description,
  created_at,
  updated_at
) ON public.team_members TO anon;
GRANT SELECT ON public.team_members_public TO anon, authenticated, service_role;