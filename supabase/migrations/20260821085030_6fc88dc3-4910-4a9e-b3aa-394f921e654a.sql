-- Views counter for gallery media
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

-- Business promotion fields on clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS map_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cover_image text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS instagram text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS facebook text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS youtube text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS gallery jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Public, safe view counter (no row data returned)
CREATE OR REPLACE FUNCTION public.increment_gallery_views(_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.gallery
  SET views = views + 1
  WHERE id = _id AND status = 'published';
$$;

GRANT EXECUTE ON FUNCTION public.increment_gallery_views(uuid) TO anon, authenticated, service_role;