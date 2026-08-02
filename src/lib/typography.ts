// Global typography model, font catalogue, presets and CSS-variable application.
// Shared by the public site provider and the admin Typography CMS.

export type TextTransform = "none" | "uppercase" | "capitalize";

export type TypographySettings = {
  heading_font: string;
  body_font: string;
  button_font: string;
  navigation_font: string;
  heading_weight: number;
  body_weight: number;
  button_weight: number;
  navigation_weight: number;
  heading_letter_spacing: number; // em
  body_letter_spacing: number; // em
  heading_line_height: number;
  body_line_height: number;
  base_font_size: number; // px
  text_transform: TextTransform;
};

/** Built-in Google Font catalogue (no coding required to use any of these). */
export const FONT_CATALOG: { name: string; stack: string; category: string }[] = [
  { name: "Inter", stack: "sans-serif", category: "Sans" },
  { name: "Poppins", stack: "sans-serif", category: "Sans" },
  { name: "Manrope", stack: "sans-serif", category: "Sans" },
  { name: "Outfit", stack: "sans-serif", category: "Sans" },
  { name: "DM Sans", stack: "sans-serif", category: "Sans" },
  { name: "Montserrat", stack: "sans-serif", category: "Sans" },
  { name: "Roboto", stack: "sans-serif", category: "Sans" },
  { name: "Open Sans", stack: "sans-serif", category: "Sans" },
  { name: "Lato", stack: "sans-serif", category: "Sans" },
  { name: "Nunito", stack: "sans-serif", category: "Sans" },
  { name: "Playfair Display", stack: "serif", category: "Serif" },
  { name: "Merriweather", stack: "serif", category: "Serif" },
  { name: "Raleway", stack: "sans-serif", category: "Sans" },
  { name: "Oswald", stack: "sans-serif", category: "Display" },
  { name: "Bebas Neue", stack: "sans-serif", category: "Display" },
  { name: "Space Grotesk", stack: "sans-serif", category: "Sans" },
  { name: "Rubik", stack: "sans-serif", category: "Sans" },
  { name: "Ubuntu", stack: "sans-serif", category: "Sans" },
  { name: "Source Sans 3", stack: "sans-serif", category: "Sans" },
  { name: "Plus Jakarta Sans", stack: "sans-serif", category: "Sans" },
  { name: "Instrument Serif", stack: "serif", category: "Serif" },
  { name: "Cormorant Garamond", stack: "serif", category: "Serif" },
  { name: "Libre Baskerville", stack: "serif", category: "Serif" },
  { name: "Work Sans", stack: "sans-serif", category: "Sans" },
];

export const FONT_NAMES = FONT_CATALOG.map((f) => f.name);

export const WEIGHT_OPTIONS = [300, 400, 500, 600, 700, 800];

export const defaultTypography: TypographySettings = {
  heading_font: "Instrument Serif",
  body_font: "Inter",
  button_font: "Inter",
  navigation_font: "Inter",
  heading_weight: 600,
  body_weight: 400,
  button_weight: 500,
  navigation_weight: 500,
  heading_letter_spacing: -0.02,
  body_letter_spacing: 0,
  heading_line_height: 1.1,
  body_line_height: 1.6,
  base_font_size: 16,
  text_transform: "none",
};

export type TypographyPreset = {
  id: string;
  label: string;
  description: string;
  values: TypographySettings;
};

function preset(
  id: string,
  label: string,
  description: string,
  values: Partial<TypographySettings>,
): TypographyPreset {
  return { id, label, description, values: { ...defaultTypography, ...values } };
}

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  preset("modern-startup", "Modern Startup", "Clean geometric sans, tight headings", {
    heading_font: "Plus Jakarta Sans",
    body_font: "Inter",
    button_font: "Plus Jakarta Sans",
    navigation_font: "Inter",
    heading_weight: 700,
    heading_letter_spacing: -0.03,
    heading_line_height: 1.08,
  }),
  preset("luxury", "Luxury", "High-contrast serif headings, airy body", {
    heading_font: "Playfair Display",
    body_font: "Lato",
    button_font: "Lato",
    navigation_font: "Lato",
    heading_weight: 600,
    heading_letter_spacing: -0.01,
    body_line_height: 1.8,
  }),
  preset("corporate", "Corporate", "Trustworthy, neutral and readable", {
    heading_font: "Montserrat",
    body_font: "Open Sans",
    button_font: "Montserrat",
    navigation_font: "Open Sans",
    heading_weight: 700,
    heading_letter_spacing: -0.01,
  }),
  preset("creative-agency", "Creative Agency", "Bold display headings with attitude", {
    heading_font: "Space Grotesk",
    body_font: "DM Sans",
    button_font: "Space Grotesk",
    navigation_font: "DM Sans",
    heading_weight: 700,
    heading_letter_spacing: -0.04,
    heading_line_height: 1.02,
  }),
  preset("restaurant", "Restaurant", "Warm serif headlines, friendly body", {
    heading_font: "Cormorant Garamond",
    body_font: "Nunito",
    button_font: "Nunito",
    navigation_font: "Nunito",
    heading_weight: 600,
    body_line_height: 1.75,
  }),
  preset("hospital", "Hospital", "Calm, highly legible clinical tone", {
    heading_font: "Source Sans 3",
    body_font: "Source Sans 3",
    button_font: "Source Sans 3",
    navigation_font: "Source Sans 3",
    heading_weight: 600,
    heading_letter_spacing: 0,
    body_line_height: 1.7,
  }),
  preset("school", "School", "Approachable rounded academic feel", {
    heading_font: "Merriweather",
    body_font: "Nunito",
    button_font: "Nunito",
    navigation_font: "Nunito",
    heading_weight: 700,
    heading_line_height: 1.25,
  }),
  preset("real-estate", "Real Estate", "Refined, spacious and premium", {
    heading_font: "Libre Baskerville",
    body_font: "Work Sans",
    button_font: "Work Sans",
    navigation_font: "Work Sans",
    heading_weight: 700,
    body_line_height: 1.7,
  }),
  preset("photographer", "Photographer", "Editorial uppercase navigation", {
    heading_font: "Oswald",
    body_font: "Raleway",
    button_font: "Oswald",
    navigation_font: "Raleway",
    heading_weight: 500,
    heading_letter_spacing: 0.02,
    text_transform: "uppercase",
  }),
  preset("minimal", "Minimal", "Understated single-family system", {
    heading_font: "Manrope",
    body_font: "Manrope",
    button_font: "Manrope",
    navigation_font: "Manrope",
    heading_weight: 600,
    heading_letter_spacing: -0.02,
  }),
];

export function fontStack(name: string) {
  const found = FONT_CATALOG.find((f) => f.name === name);
  const fallback = found?.stack ?? "sans-serif";
  return `"${name}", ${fallback === "serif" ? "Georgia, serif" : "ui-sans-serif, system-ui, sans-serif"}`;
}

/** Google Fonts stylesheet URL covering every family used by these settings. */
export function googleFontsHref(t: TypographySettings) {
  const families = Array.from(
    new Set([t.heading_font, t.body_font, t.button_font, t.navigation_font].filter(Boolean)),
  );
  if (families.length === 0) return "";
  const params = families
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@300;400;500;600;700;800`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

/** Writes the typography CSS variables onto an element (usually <html>). */
export function applyTypographyToElement(el: HTMLElement, t: TypographySettings) {
  el.style.setProperty("--font-heading", fontStack(t.heading_font));
  el.style.setProperty("--font-body", fontStack(t.body_font));
  el.style.setProperty("--font-button", fontStack(t.button_font));
  el.style.setProperty("--font-nav", fontStack(t.navigation_font));
  el.style.setProperty("--weight-heading", String(t.heading_weight));
  el.style.setProperty("--weight-body", String(t.body_weight));
  el.style.setProperty("--weight-button", String(t.button_weight));
  el.style.setProperty("--weight-nav", String(t.navigation_weight));
  el.style.setProperty("--tracking-heading", `${t.heading_letter_spacing}em`);
  el.style.setProperty("--tracking-body", `${t.body_letter_spacing}em`);
  el.style.setProperty("--leading-heading", String(t.heading_line_height));
  el.style.setProperty("--leading-body", String(t.body_line_height));
  el.style.setProperty("--base-font-size", `${t.base_font_size}px`);
  el.style.setProperty("--heading-transform", t.text_transform);
}

export function mergeTypography(partial: Partial<TypographySettings> | null | undefined) {
  if (!partial || typeof partial !== "object") return defaultTypography;
  const out = { ...defaultTypography };
  for (const key of Object.keys(defaultTypography) as (keyof TypographySettings)[]) {
    const v = partial[key];
    if (v === undefined || v === null) continue;
    if (typeof defaultTypography[key] === "number") {
      const n = Number(v);
      if (!Number.isNaN(n)) (out as Record<string, unknown>)[key] = n;
    } else {
      (out as Record<string, unknown>)[key] = v;
    }
  }
  return out;
}
