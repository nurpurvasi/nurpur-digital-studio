// Central editable site content — single source of truth.
// All text, media, contact info and collections below are placeholders
// designed to be wired to a CMS later without touching components.
// Empty arrays render "Add …" editable placeholder cards in the UI.

export type MediaAsset = {
  type: "image" | "video";
  src: string;
  alt?: string;
  poster?: string;
};

export type Client = { name: string; logo?: string };
export type PortfolioItem = {
  title: string;
  tag: string;
  year: string;
  image?: string;
  gradient?: string;
  href?: string;
};
export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  avatar?: string;
};
export type Stat = { value: number; suffix?: string; label: string };
export type FAQ = { q: string; a: string };

export const siteContent = {
  brand: {
    name: "NurpurVasi Digitals",
    initial: "N",
    logo: "" as string,
    tagline: "Premium Website Design • Development • SEO • Digital Solutions",
  },
  contact: {
    email: "",
    phone: "", // digits only for tel: link, e.g. "+911234567890"
    phoneDisplay: "",
    whatsapp: "", // international, no + or spaces
    location: "",
    responseTime: "Within 24 hours",
    mapEmbed: "" as string,
  },
  socials: {
    instagram: "",
    facebook: "",
    youtube: "",
    email: "",
  },
  hero: {
    media: { type: "image", src: "", alt: "Studio showcase" } as MediaAsset,
  },
  banners: {
    aboutCover: { type: "image", src: "", alt: "About cover" } as MediaAsset,
    servicesCover: { type: "image", src: "", alt: "Services cover" } as MediaAsset,
    portfolioCover: { type: "image", src: "", alt: "Portfolio cover" } as MediaAsset,
  },
  // ——— Editable collections (empty = placeholder “Add …” cards) ———
  clients: [] as Client[],
  portfolio: [] as PortfolioItem[],
  testimonials: [] as Testimonial[],
  stats: [] as Stat[],
  faqs: [] as FAQ[],
};

export type SiteContent = typeof siteContent;
