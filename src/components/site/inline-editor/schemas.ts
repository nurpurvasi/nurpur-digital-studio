import type { SectionKey, SectionSchema } from "./types";

export const SECTION_SCHEMAS: Partial<Record<SectionKey, SectionSchema>> = {
  brand: {
    kind: "object",
    title: "Brand",
    fields: [
      { key: "name", label: "Brand name", type: "text" },
      { key: "initial", label: "Logo initial", type: "text" },
      { key: "logo", label: "Logo image", type: "media", accept: "image" },
      { key: "tagline", label: "Tagline", type: "text" },
    ],
  },
  hero: {
    kind: "object",
    title: "Hero section",
    fields: [
      { key: "eyebrow", label: "Eyebrow badge", type: "text" },
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "subheading", label: "Subheading", type: "textarea" },
      { key: "primaryCta.label", label: "Primary button label", type: "text" },
      { key: "primaryCta.href", label: "Primary button link", type: "url" },
      { key: "secondaryCta.label", label: "Secondary button label", type: "text" },
      { key: "secondaryCta.href", label: "Secondary button link", type: "url" },
      { key: "media.type", label: "Media type (image/video)", type: "text" },
      { key: "media.src", label: "Media file", type: "media", accept: "any" },
      { key: "media.alt", label: "Media alt text", type: "text" },
    ],
  },
  contact: {
    kind: "object",
    title: "Contact details",
    fields: [
      { key: "ownerName", label: "Owner name", type: "text" },
      { key: "email", label: "Email", type: "email" },
      { key: "phone", label: "Phone (tel: format)", type: "text" },
      { key: "phoneDisplay", label: "Phone (display)", type: "text" },
      { key: "whatsapp", label: "WhatsApp number", type: "text" },
      { key: "location", label: "Office address", type: "textarea" },
      { key: "workingHours", label: "Working hours", type: "text" },
      { key: "responseTime", label: "Response time", type: "text" },
      { key: "mapEmbed", label: "Map embed URL", type: "url" },
      { key: "mapsUrl", label: "Google Maps link", type: "url" },
    ],
  },
  socials: {
    kind: "object",
    title: "Social links",
    fields: [
      { key: "instagram", label: "Instagram URL", type: "url" },
      { key: "facebook", label: "Facebook URL", type: "url" },
      { key: "youtube", label: "YouTube URL", type: "url" },
      { key: "linkedin", label: "LinkedIn URL", type: "url" },
      { key: "email", label: "Email URL (mailto:)", type: "url" },
    ],
  },
  footer: {
    kind: "object",
    title: "Footer",
    fields: [
      { key: "copyright", label: "Copyright line ({year} allowed)", type: "text" },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "privacyUrl", label: "Privacy policy link", type: "url" },
      { key: "termsUrl", label: "Terms link", type: "url" },
    ],
  },
  seo: {
    kind: "object",
    title: "SEO & meta",
    fields: [
      { key: "title", label: "Meta title", type: "text" },
      { key: "description", label: "Meta description", type: "textarea" },
      { key: "ogImage", label: "Open Graph image", type: "media", accept: "image" },
      { key: "favicon", label: "Favicon URL", type: "text" },
      { key: "analyticsCode", label: "Analytics code", type: "textarea" },
      { key: "gscVerification", label: "Google Search Console token", type: "text" },
    ],
  },
  services: {
    kind: "list",
    title: "Services",
    item: {
      itemLabel: (v, i) => (v.title as string) || `Service ${i + 1}`,
      newItem: () => ({ id: crypto.randomUUID(), title: "", desc: "", icon: "Sparkles", tag: "" }),
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "desc", label: "Description", type: "textarea" },
        { key: "icon", label: "Icon (lucide name)", type: "text", placeholder: "Sparkles" },
        { key: "tag", label: "Tag", type: "text" },
      ],
    },
  },
  portfolio: {
    kind: "list",
    title: "Portfolio",
    item: {
      itemLabel: (v, i) => (v.title as string) || `Project ${i + 1}`,
      newItem: () => ({ id: crypto.randomUUID(), title: "", tag: "", year: "", image: "", href: "" }),
      fields: [
        { key: "title", label: "Project title", type: "text" },
        { key: "tag", label: "Category / tag", type: "text" },
        { key: "year", label: "Year", type: "text" },
        { key: "image", label: "Cover image", type: "media", accept: "image" },
        { key: "href", label: "Project URL", type: "url" },
      ],
    },
  },
  testimonials: {
    kind: "list",
    title: "Testimonials",
    item: {
      itemLabel: (v, i) => (v.name as string) || `Testimonial ${i + 1}`,
      newItem: () => ({ id: crypto.randomUUID(), quote: "", name: "", role: "", avatar: "" }),
      fields: [
        { key: "quote", label: "Quote", type: "textarea" },
        { key: "name", label: "Person name", type: "text" },
        { key: "role", label: "Role / company", type: "text" },
        { key: "avatar", label: "Avatar", type: "media", accept: "image" },
      ],
    },
  },
  stats: {
    kind: "list",
    title: "Statistics",
    item: {
      itemLabel: (v, i) => (v.label as string) || `Stat ${i + 1}`,
      newItem: () => ({ id: crypto.randomUUID(), value: 0, suffix: "", label: "" }),
      fields: [
        { key: "value", label: "Value (number)", type: "number" },
        { key: "suffix", label: "Suffix (e.g. +, %)", type: "text" },
        { key: "label", label: "Label", type: "text" },
      ],
    },
  },
  faqs: {
    kind: "list",
    title: "FAQ",
    item: {
      itemLabel: (v, i) => (v.q as string) || `FAQ ${i + 1}`,
      newItem: () => ({ id: crypto.randomUUID(), q: "", a: "" }),
      fields: [
        { key: "q", label: "Question", type: "text" },
        { key: "a", label: "Answer", type: "textarea" },
      ],
    },
  },
  clients: {
    kind: "list",
    title: "Client logos",
    item: {
      itemLabel: (v, i) => (v.name as string) || `Client ${i + 1}`,
      newItem: () => ({ name: "", logo: "" }),
      fields: [
        { key: "name", label: "Client name", type: "text" },
        { key: "logo", label: "Logo", type: "media", accept: "image" },
      ],
    },
  },
};
