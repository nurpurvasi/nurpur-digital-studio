ALTER TABLE public.gallery
  ADD COLUMN IF NOT EXISTS gallery_id uuid,
  ADD COLUMN IF NOT EXISTS caption text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS location text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS opening_hours text NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS public.photo_galleries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  slug text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  cover_image text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  event_date date,
  featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT photo_galleries_status_check CHECK (status IN ('draft','published'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.photo_galleries TO authenticated;
GRANT SELECT ON public.photo_galleries TO anon;
GRANT ALL ON public.photo_galleries TO service_role;
ALTER TABLE public.photo_galleries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published photo_galleries"
  ON public.photo_galleries FOR SELECT TO anon, authenticated
  USING (status = 'published');
CREATE POLICY "Admins can view all photo_galleries"
  ON public.photo_galleries FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert photo_galleries"
  ON public.photo_galleries FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update photo_galleries"
  ON public.photo_galleries FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete photo_galleries"
  ON public.photo_galleries FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER photo_galleries_touch_updated_at
  BEFORE UPDATE ON public.photo_galleries
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  slug text NOT NULL DEFAULT '',
  cover_image text NOT NULL DEFAULT '',
  event_date date,
  event_time text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  map_url text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT events_status_check CHECK (status IN ('draft','published'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT ON public.events TO anon;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published events"
  ON public.events FOR SELECT TO anon, authenticated
  USING (status = 'published');
CREATE POLICY "Admins can view all events"
  ON public.events FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert events"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER events_touch_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.places (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  slug text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  cover_image text NOT NULL DEFAULT '',
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  description text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  map_url text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT places_status_check CHECK (status IN ('draft','published'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.places TO authenticated;
GRANT SELECT ON public.places TO anon;
GRANT ALL ON public.places TO service_role;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published places"
  ON public.places FOR SELECT TO anon, authenticated
  USING (status = 'published');
CREATE POLICY "Admins can view all places"
  ON public.places FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert places"
  ON public.places FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update places"
  ON public.places FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete places"
  ON public.places FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER places_touch_updated_at
  BEFORE UPDATE ON public.places
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.ticker_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '',
  start_date date,
  end_date date,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticker_items TO authenticated;
GRANT SELECT ON public.ticker_items TO anon;
GRANT ALL ON public.ticker_items TO service_role;
ALTER TABLE public.ticker_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active ticker_items"
  ON public.ticker_items FOR SELECT TO anon, authenticated
  USING (
    active = true
    AND (start_date IS NULL OR start_date <= current_date)
    AND (end_date IS NULL OR end_date >= current_date)
  );
CREATE POLICY "Admins can view all ticker_items"
  ON public.ticker_items FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert ticker_items"
  ON public.ticker_items FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update ticker_items"
  ON public.ticker_items FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete ticker_items"
  ON public.ticker_items FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER ticker_items_touch_updated_at
  BEFORE UPDATE ON public.ticker_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS gallery_gallery_id_idx ON public.gallery(gallery_id);
CREATE INDEX IF NOT EXISTS photo_galleries_status_idx ON public.photo_galleries(status);
CREATE INDEX IF NOT EXISTS events_status_idx ON public.events(status);
CREATE INDEX IF NOT EXISTS places_status_idx ON public.places(status);