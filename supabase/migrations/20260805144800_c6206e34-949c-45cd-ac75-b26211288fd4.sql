CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = _role
    )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Anyone can read site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can insert site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can update site content" ON public.site_content;

CREATE POLICY "Staff can view site content"
ON public.site_content
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'editor'::public.app_role)
);

CREATE POLICY "Staff can insert site content"
ON public.site_content
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'editor'::public.app_role)
);

CREATE POLICY "Staff can update site content"
ON public.site_content
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'editor'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'editor'::public.app_role)
);

REVOKE ALL ON public.site_content FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

DROP VIEW IF EXISTS public.site_content_public;
CREATE VIEW public.site_content_public
WITH (security_barrier = true)
AS
SELECT id, published, updated_at
FROM public.site_content;

REVOKE ALL ON public.site_content_public FROM PUBLIC, authenticated;
GRANT SELECT ON public.site_content_public TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Public can view published team members" ON public.team_members;

DROP VIEW IF EXISTS public.team_members_public;
CREATE VIEW public.team_members_public
WITH (security_barrier = true)
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

REVOKE ALL ON public.team_members FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
REVOKE ALL ON public.team_members_public FROM PUBLIC;
GRANT SELECT ON public.team_members_public TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Public read site-media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload site-media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update site-media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete site-media" ON storage.objects;
DROP POLICY IF EXISTS "Staff can read site-media" ON storage.objects;
DROP POLICY IF EXISTS "Staff can upload site-media" ON storage.objects;
DROP POLICY IF EXISTS "Staff can update site-media" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete site-media" ON storage.objects;

CREATE POLICY "Staff can read site-media"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'site-media'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'editor'::public.app_role)
  )
);

CREATE POLICY "Staff can upload site-media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-media'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'editor'::public.app_role)
  )
);

CREATE POLICY "Staff can update site-media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'site-media'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'editor'::public.app_role)
  )
)
WITH CHECK (
  bucket_id = 'site-media'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'editor'::public.app_role)
  )
);

CREATE POLICY "Staff can delete site-media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'site-media'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'editor'::public.app_role)
  )
);