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

export type SiteContent = {
  brand: { name: string; initial: string; logo: string; tagline: string };
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
  };
  socials: {
    instagram: string;
    facebook: string;
    youtube: string;
    email: string;
  };
  hero: {
    eyebrow: string;
    headline: string;
    subheading: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    media: MediaAsset;
  };
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
  footer: { copyright: string; tagline: string };
};

export const defaultSiteContent: SiteContent = {
  brand: {
    name: "NurpurVasi Digitals",
    initial: "N",
    logo: "",
    tagline: "Premium Website Design • Development • SEO • Digital Solutions",
  },
  seo: {
    title: "NurpurVasi Digitals — Premium Digital Studio",
    description:
      "World-class websites, brands and digital products crafted with obsessive care.",
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
  },
  socials: { instagram: "", facebook: "", youtube: "", email: "" },
  hero: {
    eyebrow: "Premium Digital Studio · Est. 2015",
    headline: "Crafting digital experiences that inspire.",
    subheading:
      "NurpurVasi Digitals designs and builds world-class websites, brands and digital products for ambitious companies that refuse to look ordinary.",
    primaryCta: { label: "Start your project", href: "/contact" },
    secondaryCta: { label: "Watch showreel", href: "/portfolio" },
    media: { type: "image", src: "", alt: "Studio showcase" },
  },
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
    copyright: "© {year} NurpurVasi Digitals. All rights reserved.",
    tagline: "Premium digital studio",
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
