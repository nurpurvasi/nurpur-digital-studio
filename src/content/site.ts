// Central editable site content.
// Every value here is a placeholder ready for a future CMS wiring
// (single source of truth for logo, banners, media, contact, socials).

export type MediaAsset = {
  type: "image" | "video";
  src: string;
  alt?: string;
  poster?: string;
};

export const siteContent = {
  brand: {
    name: "NurpurVasi Digitals",
    initial: "N",
    // Editable logo placeholder — swap with hosted URL or CMS field later.
    logo: "" as string,
  },
  contact: {
    email: "hello@nurpurvasidigitals.com",
    phone: "+910000000000", // digits only for tel: link
    phoneDisplay: "+91 00000 00000",
    whatsapp: "910000000000", // international, no + / spaces
    location: "India · Working worldwide",
    mapEmbed: "" as string, // paste Google Maps embed URL when ready
  },
  socials: {
    instagram: "#",
    facebook: "#",
    youtube: "#",
    email: "mailto:hello@nurpurvasidigitals.com",
  },
  hero: {
    // Editable hero media (image OR video). Leave src empty to fall back to
    // the animated gradient.
    media: { type: "image", src: "", alt: "Studio showcase" } as MediaAsset,
  },
  banners: {
    // Editable banner placeholders reused across pages.
    aboutCover: { type: "image", src: "", alt: "About cover" } as MediaAsset,
    servicesCover: { type: "image", src: "", alt: "Services cover" } as MediaAsset,
    portfolioCover: { type: "image", src: "", alt: "Portfolio cover" } as MediaAsset,
  },
};

export type SiteContent = typeof siteContent;
