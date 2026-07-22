import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { defaultSiteContent, mergeSiteContent, type SiteContent } from "./site";

const SiteContentCtx = createContext<SiteContent>(defaultSiteContent);

export function useSiteContent(): SiteContent {
  return useContext(SiteContentCtx);
}

/**
 * Fetches the single published site_content row from Cloud (public read),
 * merges it over the compiled defaults, and provides it to every descendant.
 * Falls back to defaults while loading or on error — the site never blanks.
 */
export function SiteContentProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery({
    queryKey: ["site-content", "published"],
    queryFn: async (): Promise<SiteContent> => {
      const { data, error } = await supabase
        .from("site_content")
        .select("published")
        .eq("id", 1)
        .maybeSingle();
      if (error || !data) return defaultSiteContent;
      return mergeSiteContent(data.published as Partial<SiteContent>);
    },
    initialData: defaultSiteContent,
    staleTime: 60_000,
  });

  return <SiteContentCtx.Provider value={data}>{children}</SiteContentCtx.Provider>;
}
