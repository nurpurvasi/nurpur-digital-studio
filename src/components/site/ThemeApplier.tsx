import { useEffect } from "react";
import { useSiteContent } from "@/content/SiteContentContext";
import type { ThemeSettings } from "@/content/site";

/**
 * Applies theme settings from the CMS to the document by overriding CSS
 * variables and <html> attributes. Safe no-op when values are empty.
 */
export function applyThemeToElement(el: HTMLElement, theme: ThemeSettings) {
  if (theme.primaryColor) {
    el.style.setProperty("--navy", theme.primaryColor);
    el.style.setProperty("--primary", theme.primaryColor);
  }
  if (theme.secondaryColor) {
    el.style.setProperty("--royal", theme.secondaryColor);
    el.style.setProperty("--ring", theme.secondaryColor);
  }
  if (theme.accentColor) {
    el.style.setProperty("--purple", theme.accentColor);
  }
  if (typeof theme.borderRadius === "number") {
    el.style.setProperty("--radius", `${theme.borderRadius}rem`);
  }
  if (theme.buttonStyle) {
    const map = { pill: "9999px", rounded: "0.75rem", square: "0.25rem" } as const;
    el.style.setProperty("--btn-radius", map[theme.buttonStyle]);
  }
}

export function ThemeApplier() {
  const site = useSiteContent();
  const theme = site.theme;

  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    applyThemeToElement(root, theme);
    root.classList.toggle("dark", theme.mode === "dark");
  }, [theme]);

  // Browser title from CMS applies to the homepage only — every other route
  // owns its own SEO title via the route head().
  useEffect(() => {
    if (theme?.browserTitle && window.location.pathname === "/") {
      document.title = theme.browserTitle;
    }
  }, [theme?.browserTitle]);


  useEffect(() => {
    const href = site.seo?.favicon;
    if (!href) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [site.seo?.favicon]);

  return null;
}
