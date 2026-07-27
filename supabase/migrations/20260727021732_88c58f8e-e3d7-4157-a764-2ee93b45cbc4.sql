
DROP POLICY "Anyone can create leads" ON public.leads;
CREATE POLICY "Anyone can create leads" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) > 0
    AND length(btrim(email)) between 3 and 320
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(btrim(message)) > 0
    AND length(message) <= 5000
  );
