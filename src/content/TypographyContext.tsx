import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  applyTypographyToElement,
  defaultTypography,
  googleFontsHref,
  mergeTypography,
  type TypographySettings,
} from "@/lib/typography";

type Ctx = {
  typography: TypographySettings;
  /** Live-preview override (admin only, not persisted). Pass null to clear. */
  setPreview: (t: TypographySettings | null) => void;
};

const TypographyCtx = createContext<Ctx>({
  typography: defaultTypography,
  setPreview: () => {},
});

export function useTypography() {
  return useContext(TypographyCtx);
}

/** Injects/updates a single <link> tag loading the selected Google Fonts. */
export function useGoogleFontLoader(t: TypographySettings, id = "nvd-google-fonts") {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const href = googleFontsHref(t);
    if (!href) return;
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    if (link.href !== href) link.href = href;
  }, [t, id]);
}

export function TypographyProvider({ children }: { children: ReactNode }) {
  const [preview, setPreviewState] = useState<TypographySettings | null>(null);

  const { data } = useQuery({
    queryKey: ["typography-settings"],
    queryFn: async (): Promise<TypographySettings> => {
      const { data, error } = await supabase
        .from("typography_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error || !data) return defaultTypography;
      return mergeTypography(data as Partial<TypographySettings>);
    },
    initialData: defaultTypography,
    staleTime: 60_000,
  });

  const typography = preview ?? data;

  useGoogleFontLoader(typography);

  useEffect(() => {
    if (typeof document === "undefined") return;
    applyTypographyToElement(document.documentElement, typography);
  }, [typography]);

  const setPreview = useCallback((t: TypographySettings | null) => setPreviewState(t), []);

  const value = useMemo(() => ({ typography, setPreview }), [typography, setPreview]);

  return <TypographyCtx.Provider value={value}>{children}</TypographyCtx.Provider>;
}
