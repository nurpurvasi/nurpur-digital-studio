import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { LucideIcon } from "lucide-react";
import { listFeaturedServices, listPublicServices } from "@/lib/services.functions";
import { getServiceIcon } from "@/components/site/service-icons";

export type ServiceCard = {
  key: string;
  title: string;
  desc: string;
  tag: string;
  icon: LucideIcon;
  slug?: string;
};

/**
 * Returns service cards exclusively from published CMS records.
 */
export function useServiceCards(variant: "featured" | "all" = "all") {
  const fetchFeatured = useServerFn(listFeaturedServices);
  const fetchAll = useServerFn(listPublicServices);

  const { data } = useQuery({
    queryKey: ["services-public", variant],
    queryFn: () => (variant === "featured" ? fetchFeatured() : fetchAll()),
  });

  const items = data?.items ?? [];

  if (items.length > 0) {
    return items.map<ServiceCard>((s) => ({
      key: s.id,
      title: s.title,
      desc: s.short_description,
      tag: s.category,
      icon: getServiceIcon(s.icon),
      slug: s.slug,
    }));
  }

  return [];
}
