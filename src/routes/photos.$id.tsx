import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/Layout";
import { MediaDetailView, MediaMissing, mediaDetailHead } from "@/components/media/MediaDetailView";
import { getPublicGalleryItem } from "@/lib/gallery.functions";

const SITE = "https://nurpur-digital-studio.lovable.app";

export const Route = createFileRoute("/photos/$id")({
  loader: async ({ params }) => getPublicGalleryItem({ data: { id: params.id } }),
  head: ({ params, loaderData }) =>
    mediaDetailHead({ item: loaderData?.item, kind: "photos", id: params.id, site: SITE }),
  component: PhotoDetail,
});

function PhotoDetail() {
  const { id } = Route.useParams();
  const load = useServerFn(getPublicGalleryItem);
  const { data } = useQuery({
    queryKey: ["gallery-item", id],
    queryFn: () => load({ data: { id } }),
    initialData: Route.useLoaderData(),
  });
  const item = data?.item ?? null;

  return (
    <SiteLayout>
      {item ? <MediaDetailView item={item} kind="photos" galleryName={data?.galleryName ?? ""} /> : <MediaMissing kind="photos" />}
    </SiteLayout>
  );
}
