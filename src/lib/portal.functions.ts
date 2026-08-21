import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  adminDelete,
  adminList,
  adminReorder,
  adminUpsert,
  assertAdmin,
  eventSchema,
  idSchema,
  normalizeDates,
  photoGallerySchema,
  placeSchema,
  publicList,
  reorderSchema,
  serverPublicClient,
  tickerSchema,
} from "@/lib/collection.server";
import {
  EVENT_COLS,
  GALLERY_COLS,
  PLACE_COLS,
  TICKER_COLS,
  type PhotoGallery,
  type Place,
  type PortalEvent,
  type TickerItem,
} from "@/lib/portal-types";

// ---------------- PHOTO GALLERIES ----------------

export const listPublicGalleries = createServerFn({ method: "GET" }).handler(async () => ({
  items: (await publicList("photo_galleries", GALLERY_COLS, "sort_order")) as PhotoGallery[],
}));

export const listAdminGalleries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return {
      items: (await adminList(context.supabase, "photo_galleries", GALLERY_COLS)) as PhotoGallery[],
    };
  });

export const upsertPhotoGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => photoGallerySchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const row = await adminUpsert(context.supabase, "photo_galleries", GALLERY_COLS, {
      ...normalizeDates(data, ["event_date"]),
      created_by: context.userId,
    });
    return { item: row as PhotoGallery };
  });

export const deletePhotoGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => idSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return adminDelete(context.supabase, "photo_galleries", data.id);
  });

export const reorderPhotoGalleries = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => reorderSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return adminReorder(context.supabase, "photo_galleries", data.items);
  });

export const getPublicGalleryBySlug = createServerFn({ method: "GET" })
  .inputValidator((i: { slug: string }) => ({ slug: String(i.slug).slice(0, 200) }))
  .handler(async ({ data }) => {
    const supa = serverPublicClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row } = await (supa as any)
      .from("photo_galleries")
      .select(GALLERY_COLS)
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    return { item: (row ?? null) as PhotoGallery | null };
  });

// ---------------- EVENTS ----------------

export const listPublicEvents = createServerFn({ method: "GET" }).handler(async () => ({
  items: (await publicList("events", EVENT_COLS, "sort_order")) as PortalEvent[],
}));

export const listAdminEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return { items: (await adminList(context.supabase, "events", EVENT_COLS)) as PortalEvent[] };
  });

export const upsertEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => eventSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const row = await adminUpsert(context.supabase, "events", EVENT_COLS, {
      ...normalizeDates(data, ["event_date"]),
      created_by: context.userId,
    });
    return { item: row as PortalEvent };
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => idSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return adminDelete(context.supabase, "events", data.id);
  });

// ---------------- PLACES ----------------

export const listPublicPlaces = createServerFn({ method: "GET" }).handler(async () => ({
  items: (await publicList("places", PLACE_COLS, "sort_order")) as Place[],
}));

export const listAdminPlaces = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return { items: (await adminList(context.supabase, "places", PLACE_COLS)) as Place[] };
  });

export const upsertPlace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => placeSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const row = await adminUpsert(context.supabase, "places", PLACE_COLS, {
      ...data,
      created_by: context.userId,
    });
    return { item: row as Place };
  });

export const deletePlace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => idSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return adminDelete(context.supabase, "places", data.id);
  });

// ---------------- TICKER ----------------

export const listPublicTicker = createServerFn({ method: "GET" }).handler(async () => {
  const supa = serverPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supa as any)
    .from("ticker_items")
    .select(TICKER_COLS)
    .order("sort_order", { ascending: true });
  return { items: (data ?? []) as TickerItem[] };
});

export const listAdminTicker = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (context.supabase as any)
      .from("ticker_items")
      .select(TICKER_COLS)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return { items: (data ?? []) as TickerItem[] };
  });

export const upsertTickerItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => tickerSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const row = await adminUpsert(context.supabase, "ticker_items", TICKER_COLS, {
      ...normalizeDates(data, ["start_date", "end_date"]),
      created_by: context.userId,
    });
    return { item: row as TickerItem };
  });

export const deleteTickerItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => idSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return adminDelete(context.supabase, "ticker_items", data.id);
  });

// ---------------- DASHBOARD ----------------

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = context.supabase as any;
    const social = "%instagram.com%,%facebook.com%,%youtube.com%,%youtu.be%";
    const [media, galleries, events, places, blog, businesses, messages] = await Promise.all([
      supa.from("gallery").select("id, media_type, media_url, views, status"),
      supa.from("photo_galleries").select("id", { count: "exact", head: true }),
      supa.from("events").select("id, event_date, status"),
      supa.from("places").select("id", { count: "exact", head: true }),
      supa.from("blog_posts").select("id", { count: "exact", head: true }),
      supa.from("clients").select("id, published"),
      supa.from("leads").select("id, name, status, created_at").order("created_at", { ascending: false }),
    ]);
    const rows = (media.data ?? []) as {
      id: string;
      media_type: string;
      media_url: string;
      views: number;
      status: string;
    }[];
    const isSocial = (u: string) => /instagram\.com|facebook\.com|fb\.watch|youtube\.com|youtu\.be/i.test(u || "");
    void social;
    const today = new Date().toISOString().slice(0, 10);
    const eventRows = (events.data ?? []) as { id: string; event_date: string | null; status: string }[];
    const leadRows = (messages.data ?? []) as {
      id: string;
      name: string;
      status: string;
      created_at: string;
    }[];
    return {
      photos: rows.filter((r) => r.media_type === "image" && !isSocial(r.media_url)).length,
      videos: rows.filter((r) => r.media_type === "video" && !isSocial(r.media_url)).length,
      reels: rows.filter((r) => isSocial(r.media_url)).length,
      views: rows.reduce((sum, r) => sum + (r.views || 0), 0),
      galleries: galleries.count ?? 0,
      places: places.count ?? 0,
      posts: blog.count ?? 0,
      businesses: (businesses.data ?? []).length,
      publishedBusinesses: ((businesses.data ?? []) as { published: boolean }[]).filter(
        (b) => b.published,
      ).length,
      upcomingEvents: eventRows.filter((e) => !e.event_date || e.event_date >= today).length,
      unreadMessages: leadRows.filter((l) => l.status === "new").length,
      recentMessages: leadRows.slice(0, 6),
    };
  });
