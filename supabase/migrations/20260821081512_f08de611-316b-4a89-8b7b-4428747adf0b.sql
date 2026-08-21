UPDATE public.site_content
SET published = jsonb_set(
      jsonb_set(published, '{brand,name}', '"NurpurVasi Media"'::jsonb, true),
      '{brand,tagline}', '"Photos • Videos • Local Events • Culture • Weather"'::jsonb, true
    ),
    draft = CASE WHEN draft IS NULL THEN draft ELSE jsonb_set(
      jsonb_set(draft, '{brand,name}', '"NurpurVasi Media"'::jsonb, true),
      '{brand,tagline}', '"Photos • Videos • Local Events • Culture • Weather"'::jsonb, true
    ) END
WHERE id = 1;