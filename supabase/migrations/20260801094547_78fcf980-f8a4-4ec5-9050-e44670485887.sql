CREATE TABLE public.pricing_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT ''::text,
  slug text NOT NULL UNIQUE,
  short_description text NOT NULL DEFAULT ''::text,
  price text NOT NULL DEFAULT ''::text,
  currency text NOT NULL DEFAULT 'INR'::text,
  billing_cycle text NOT NULL DEFAULT 'One Time'::text,
  badge text NOT NULL DEFAULT ''::text,
  button_text text NOT NULL DEFAULT ''::text,
  button_link text NOT NULL DEFAULT ''::text,
  plan_color text NOT NULL DEFAULT ''::text,
  icon text NOT NULL DEFAULT ''::text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  display_order integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  seo_title text NOT NULL DEFAULT ''::text,
  seo_description text NOT NULL DEFAULT ''::text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pricing_plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_plans TO authenticated;
GRANT ALL ON public.pricing_plans TO service_role;

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published pricing plans" ON public.pricing_plans FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins can view all pricing plans" ON public.pricing_plans FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert pricing plans" ON public.pricing_plans FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update pricing plans" ON public.pricing_plans FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete pricing plans" ON public.pricing_plans FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER pricing_plans_touch_updated_at BEFORE UPDATE ON public.pricing_plans FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();