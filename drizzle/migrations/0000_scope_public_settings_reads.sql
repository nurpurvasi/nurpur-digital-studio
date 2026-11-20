ALTER POLICY "Typography is publicly readable" ON public.typography_settings USING (id = 1);
ALTER POLICY "Public can read published content columns" ON public.site_content USING (id = 1);