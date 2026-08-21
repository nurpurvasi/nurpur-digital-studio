/** Shared row types for the NurpurVasi Media portal collections (browser-safe). */

export type Status = "draft" | "published";

export type PhotoGallery = {
  id: string;
  name: string;
  slug: string;
  category: string;
  cover_image: string;
  description: string;
  location: string;
  event_date: string | null;
  featured: boolean;
  status: Status;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
};

export type PortalEvent = {
  id: string;
  name: string;
  slug: string;
  cover_image: string;
  event_date: string | null;
  event_time: string;
  location: string;
  map_url: string;
  description: string;
  category: string;
  featured: boolean;
  status: Status;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
};

export type Place = {
  id: string;
  name: string;
  slug: string;
  category: string;
  cover_image: string;
  gallery: string[];
  description: string;
  location: string;
  map_url: string;
  featured: boolean;
  status: Status;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
};

export type TickerItem = {
  id: string;
  text: string;
  link: string;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export const GALLERY_COLS =
  "id, name, slug, category, cover_image, description, location, event_date, featured, status, sort_order, seo_title, seo_description, created_at, updated_at";
export const EVENT_COLS =
  "id, name, slug, cover_image, event_date, event_time, location, map_url, description, category, featured, status, sort_order, seo_title, seo_description, created_at, updated_at";
export const PLACE_COLS =
  "id, name, slug, category, cover_image, gallery, description, location, map_url, featured, status, sort_order, seo_title, seo_description, created_at, updated_at";
export const TICKER_COLS =
  "id, text, link, start_date, end_date, active, sort_order, created_at, updated_at";
