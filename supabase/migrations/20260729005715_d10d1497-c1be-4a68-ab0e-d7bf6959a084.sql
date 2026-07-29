CREATE TABLE public.gallery (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  media_type text NOT NULL DEFAULT 'image',
  media_url text NOT NULL DEFAULT '',
  thumbnail text NOT NULL DEFAULT '',
  alt_text text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  publish_date timestamp with time zone,
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT gallery_media_type_check CHECK (media_type IN ('image','video')),
  CONSTRAINT gallery_status_check CHECK (status IN ('draft','published'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery TO authenticated;
GRANT SELECT ON public.gallery TO anon;
GRANT ALL ON public.gallery TO service_role;

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published gallery"
  ON public.gallery FOR SELECT
  TO anon, authenticated
  USING (status = 'published' AND (publish_date IS NULL OR publish_date <= now()));

CREATE POLICY "Admins can view all gallery"
  ON public.gallery FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert gallery"
  ON public.gallery FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update gallery"
  ON public.gallery FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete gallery"
  ON public.gallery FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER gallery_touch_updated_at
  BEFORE UPDATE ON public.gallery
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX gallery_status_idx ON public.gallery(status);
CREATE INDEX gallery_featured_idx ON public.gallery(featured);
CREATE INDEX gallery_sort_order_idx ON public.gallery(sort_order);