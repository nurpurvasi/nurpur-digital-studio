// Central editable site content shape + defaults.
// This file defines the TYPE and the DEFAULT (empty-placeholder) values.
// At runtime, published content from Lovable Cloud is merged over these
// defaults via the SiteContentProvider — components read via useSiteContent().

export type MediaAsset = {
  type: "image" | "video";
  src: string;
  alt?: string;
  poster?: string;
};

export type Client = { name: string; logo?: string };
export type PortfolioItem = {
  id?: string;
  title: string;
  tag: string;
  year: string;
  image?: string;
  gradient?: string;
  href?: string;
};
export type Testimonial = {
  id?: string;
  quote: string;
  name: string;
  role: string;
  avatar?: string;
};
export type Stat = { id?: string; value: number; suffix?: string; label: string };
export type FAQ = { id?: string; q: string; a: string };
export type ServiceItem = {
  id?: string;
  icon?: string; // lucide icon name
  title: string;
  desc: string;
  tag?: string;
};

export type ThemeSettings = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  buttonStyle: "pill" | "rounded" | "square";
  borderRadius: number; // in rem, applied to --radius
  mode: "light" | "dark";
  browserTitle: string;
  heroBackgroundImage: string;
  heroBackgroundVideo: string;
  footerLogo: string;
  loadingLogo: string;
};

export type SiteContent = {
  brand: { name: string; initial: string; logo: string; tagline: string };
  theme: ThemeSettings;
  seo: {
    title: string;
    description: string;
    ogImage: string;
    favicon: string;
    analyticsCode: string;
    gscVerification: string;
  };
  contact: {
    email: string;
    phone: string;
    phoneDisplay: string;
    whatsapp: string;
    location: string;
    responseTime: string;
    mapEmbed: string;
    mapsUrl: string;
    workingHours: string;
    ownerName: string;
  };
  socials: {
    instagram: string;
    facebook: string;
    youtube: string;
    linkedin: string;
    email: string;
  };
  hero: {
    eyebrow: string;
    /** Optional featured-story badge, e.g. FEATURED / NEW VIDEO / SPONSORED. */
    badge?: string;
    headline: string;
    subheading: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    media: MediaAsset;
  };
  /** Second, independent marquee shown directly below the hero. */
  bottomTicker: { enabled: boolean; items: { text: string; link?: string }[] };
  banners: {
    aboutCover: MediaAsset;
    servicesCover: MediaAsset;
    portfolioCover: MediaAsset;
  };
  services: ServiceItem[];
  clients: Client[];
  portfolio: PortfolioItem[];
  testimonials: Testimonial[];
  stats: Stat[];
  faqs: FAQ[];
  footer: { copyright: string; tagline: string; privacyUrl: string; termsUrl: string };
};

export const defaultTheme: ThemeSettings = {
  primaryColor: "#1a2547",
  secondaryColor: "#2f4bd6",
  accentColor: "#8b5cf6",
  buttonStyle: "pill",
  borderRadius: 1,
  mode: "light",
  browserTitle: "NurpurVasi Media — Photos, Videos & Events of Nurpur",
  heroBackgroundImage: "",
  heroBackgroundVideo: "",
  footerLogo: "",
  loadingLogo: "",
};


export const defaultSiteContent: SiteContent = {
  brand: {
    name: "NurpurVasi Media",
    initial: "N",
    logo: "",
    tagline: "Photos • Videos • Local Events • Culture • Weather",
  },
  theme: defaultTheme,
  seo: {
    title: "NurpurVasi Media — Photos, Videos & Events of Nurpur",
    description:
      "Photos, videos, local events, culture, weather and business promotion from Nurpur, Himachal Pradesh.",
    ogImage: "",
    favicon: "/favicon.ico",
    analyticsCode: "",
    gscVerification: "",
  },
  contact: {
    email: "",
    phone: "",
    phoneDisplay: "",
    whatsapp: "",
    location: "",
    responseTime: "Within 24 hours",
    mapEmbed: "",
    mapsUrl: "",
    workingHours: "",
    ownerName: "",
  },
  socials: { instagram: "", facebook: "", youtube: "", linkedin: "", email: "" },
  hero: {
    eyebrow: "Nurpur · Himachal Pradesh",
    headline: "Your window to Nurpur.",
    subheading:
      "Photos, videos, local events, culture, weather and neighbourhood businesses — captured and published by NurpurVasi Media.",
    primaryCta: { label: "Explore photos", href: "/photos" },
    secondaryCta: { label: "Watch videos", href: "/videos" },
    media: { type: "image", src: "", alt: "Studio showcase" },
    badge: "FEATURED",
  },
  bottomTicker: { enabled: true, items: [] },
  banners: {
    aboutCover: { type: "image", src: "", alt: "About cover" },
    servicesCover: { type: "image", src: "", alt: "Services cover" },
    portfolioCover: { type: "image", src: "", alt: "Portfolio cover" },
  },
  services: [],
  clients: [],
  portfolio: [],
  testimonials: [],
  stats: [],
  faqs: [],
  footer: {
    copyright: "© {year} NurpurVasi Media. All rights reserved.",
    tagline: "Local media portal for Nurpur",
    privacyUrl: "",
    termsUrl: "",
  },
};

// Backwards-compat static export: components that don't yet use the hook
// still read defaults. Prefer useSiteContent() for anything that must reflect
// live Cloud edits.
export const siteContent = defaultSiteContent;

// Deep-merge published Cloud content over defaults so partial payloads are safe.
export function mergeSiteContent(overrides: Partial<SiteContent> | null | undefined): SiteContent {
  if (!overrides || typeof overrides !== "object") return defaultSiteContent;
  const out: SiteContent = JSON.parse(JSON.stringify(defaultSiteContent));
  for (const key of Object.keys(overrides) as (keyof SiteContent)[]) {
    const v = overrides[key];
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      // Arrays replace wholesale — editor owns full list ordering.
      (out as Record<string, unknown>)[key] = v;
    } else if (typeof v === "object") {
      (out as Record<string, unknown>)[key] = { ...(out[key] as object), ...(v as object) };
    } else {
      (out as Record<string, unknown>)[key] = v;
    }
  }
  return out;
}
