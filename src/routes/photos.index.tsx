import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, Section, Eyebrow } from "@/components/site/Layout";
import { MediaGrid } from "@/components/media/MediaGrid";
import { MediaCard } from "@/components/media/MediaGrid";
import { useGallery, usePhotos } from "@/components/media/useGallery";

export const Route = createFileRoute("/photos/")({
  head: () => ({
    meta: [
      { title: "Nurpur Photos — Fort, Temples, Melas & Nature | NurpurVasi Media" },
      {
        name: "description",
        content:
          "Browse high-quality photos of Nurpur — Nurpur Fort, Brijraj Swami Mandir, Nagni Mata, local melas, nature and everyday culture, captured by NurpurVasi Media.",
      },
      { property: "og:title", content: "Nurpur Photos — Fort, Temples, Melas & Nature" },
      {
        property: "og:description",
        content: "A growing photo archive of Nurpur places, temples, events and culture.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://nurpur-digital-studio.lovable.app/photos" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://nurpur-digital-studio.lovable.app/photos" }],
  }),
  component: PhotosPage,
});

function PhotosPage() {
  const { items } = useGallery();
  const photos = usePhotos(items);
  const featured = photos.filter((p) => p.featured).slice(0, 4);

  return (
    <SiteLayout>
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Photo archive</Eyebrow>
          <h1
            className="mt-5 text-4xl tracking-tight sm:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Nurpur in <span className="text-gradient italic">pictures</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Nurpur Fort, temples, melas, mountains and everyday moments — tap any photo to open its
            full page with details.
          </p>
        </div>
        {featured.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold sm:text-2xl">Featured photos</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
              {featured.map((p) => (
                <MediaCard key={p.id} item={p} detail="photos" />
              ))}
            </div>
          </div>
        )}

        <div className="mt-14">
          {photos.length > 0 && <h2 className="mb-5 text-xl font-semibold sm:text-2xl">Latest photos</h2>}
          <MediaGrid items={photos} detail="photos" emptyLabel="" />
          {photos.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Photos will appear here as soon as they are published.
            </p>
          )}
        </div>
      </Section>
    </SiteLayout>
  );
}
