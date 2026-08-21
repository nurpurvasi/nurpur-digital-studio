import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/AdminShell";
import { CollectionManager, type FieldDef } from "@/components/admin/CollectionManager";
import {
  deleteGalleryItem,
  listAdminGallery,
  reorderGallery,
  upsertGalleryItem,
  type GalleryItem,
} from "@/lib/gallery.functions";
import { isSocialUrl, youtubeThumb } from "@/components/media/useGallery";

export const Route = createFileRoute("/_authenticated/admin/reels")({
  head: () => ({
    meta: [
      { title: "Social Reels — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminReelsPage,
});

const FIELDS: FieldDef[] = [
  { key: "title", label: "Title", kind: "text", placeholder: "Nurpur Mela highlights" },
  {
    key: "media_url",
    label: "Reel URL",
    kind: "url",
    full: true,
    placeholder: "https://www.instagram.com/reel/…",
    help: "Instagram, Facebook or YouTube link. The card opens this URL.",
  },
  {
    key: "thumbnail",
    label: "Custom thumbnail",
    kind: "image",
    full: true,
    help: "Optional. YouTube thumbnails are detected automatically.",
  },
  { key: "description", label: "Description", kind: "textarea" },
  { key: "category", label: "Category", kind: "text", placeholder: "Reels" },
  { key: "featured", label: "Featured", kind: "switch" },
];

const EMPTY = {
  title: "",
  slug: "",
  caption: "",
  location: "",
  gallery_id: null,
  description: "",
  category: "Reels",
  media_type: "video",
  media_url: "",
  thumbnail: "",
  alt_text: "",
  featured: false,
  sort_order: 0,
  status: "draft",
  publish_date: null,
  seo_title: "",
  seo_description: "",
} as unknown as GalleryItem;

function AdminReelsPage() {
  const load = useServerFn(listAdminGallery);
  const save = useServerFn(upsertGalleryItem);
  const del = useServerFn(deleteGalleryItem);
  const reorder = useServerFn(reorderGallery);

  return (
    <AdminShell
      title="Social Reels"
      description="Add Instagram, Facebook and YouTube reels. We never re-host the video — cards open the original post."
    >
      <CollectionManager<GalleryItem>
        queryKey="admin-reels"
        load={async () => {
          const res = await load();
          return { items: res.items.filter((i) => isSocialUrl(i.media_url)) };
        }}
        save={(row) =>
          save({
            data: {
              ...row,
              media_type: "video",
              thumbnail: row.thumbnail || youtubeThumb(row.media_url || ""),
              publish_date:
                row.status === "published" ? row.publish_date || new Date().toISOString() : null,
            } as never,
          })
        }
        remove={(id) => del({ data: { id } })}
        reorder={(items) => reorder({ data: { items } })}
        fields={FIELDS}
        empty={EMPTY}
        titleKey="title"
        subtitleKey="category"
        imageKey="thumbnail"
        addLabel="Add reel"
      />
    </AdminShell>
  );
}
