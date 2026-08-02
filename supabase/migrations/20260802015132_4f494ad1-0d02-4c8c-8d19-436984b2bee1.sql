CREATE TABLE public.typography_settings (
  id integer PRIMARY KEY DEFAULT 1,
  heading_font text NOT NULL DEFAULT 'Instrument Serif',
  body_font text NOT NULL DEFAULT 'Inter',
  button_font text NOT NULL DEFAULT 'Inter',
  navigation_font text NOT NULL DEFAULT 'Inter',
  heading_weight integer NOT NULL DEFAULT 600,
  body_weight integer NOT NULL DEFAULT 400,
  button_weight integer NOT NULL DEFAULT 500,
  navigation_weight integer NOT NULL DEFAULT 500,
  heading_letter_spacing numeric NOT NULL DEFAULT -0.02,
  body_letter_spacing numeric NOT NULL DEFAULT 0,
  heading_line_height numeric NOT NULL DEFAULT 1.1,
  body_line_height numeric NOT NULL DEFAULT 1.6,
  base_font_size numeric NOT NULL DEFAULT 16,
  text_transform text NOT NULL DEFAULT 'none',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT typography_singleton CHECK (id = 1)
);

GRANT SELECT ON public.typography_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.typography_settings TO authenticated;
GRANT ALL ON public.typography_settings TO service_role;

ALTER TABLE public.typography_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Typography is publicly readable"
  ON public.typography_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins and editors can insert typography"
  ON public.typography_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins and editors can update typography"
  ON public.typography_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER typography_settings_touch
  BEFORE UPDATE ON public.typography_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.typography_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;