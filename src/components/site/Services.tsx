import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { LucideIcon } from "lucide-react";
import { listFeaturedServices, listPublicServices } from "@/lib/services.functions";
import { getServiceIcon } from "@/components/site/service-icons";
import { Code2, LineChart, Palette, Rocket, Search, Smartphone } from "lucide-react";

const FALLBACK: ServiceCard[] = [
  { key: "design", title: "Website Design", desc: "Cinematic, brand-first interfaces designed to feel unmistakably premium.", tag: "Design", icon: Palette },
  { key: "dev", title: "Development", desc: "Production-grade builds with buttery motion, blazing performance and clean code.", tag: "Engineering", icon: Code2 },
  { key: "seo", title: "SEO Growth", desc: "Technical SEO, content strategy and Core Web Vitals tuned for organic growth.", tag: "Growth", icon: Search },
  { key: "mobile", title: "Mobile Experiences", desc: "Mobile-first, fluid layouts and gestures that feel native on every device.", tag: "Mobile", icon: Smartphone },
  { key: "analytics", title: "Analytics & CRO", desc: "Instrumented insights and conversion experiments that compound over time.", tag: "Insights", icon: LineChart },
  { key: "solutions", title: "Digital Solutions", desc: "End-to-end brand, marketing sites, dashboards and bespoke digital products.", tag: "Product", icon: Rocket },
];

export type ServiceCard = {
  key: string;
  title: string;
  desc: string;
  tag: string;
  icon: LucideIcon;
  slug?: string;
};

/**
 * Returns service cards from the CMS when available, otherwise falls back to
 * the built-in starter set so the design never renders empty.
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

  return FALLBACK;
}
