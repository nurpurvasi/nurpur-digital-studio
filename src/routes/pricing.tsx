import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Eyebrow, Section, SiteLayout } from "@/components/site/Layout";
import { ContactCTA } from "@/components/site/Sections";
import { Reveal } from "@/components/site/Reveal";
import { PricingGrid } from "@/components/site/Pricing";
import { listPublicPricingPlans, type PricingPlan } from "@/lib/pricing.functions";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex,follow" },
      { title: "Pricing Plans — NurpurVasi Digitals" },
      {
        name: "description",
        content:
          "Transparent pricing for website design, development, SEO and digital solutions. Choose the NurpurVasi Digitals plan that fits your business.",
      },
      { property: "og:title", content: "Pricing Plans — NurpurVasi Digitals" },
      {
        property: "og:description",
        content:
          "Clear, outcome-based packages for design, development and growth — pick the plan that fits your ambition.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const load = useServerFn(listPublicPricingPlans);
  const { data, isLoading } = useQuery({
    queryKey: ["pricing-public", "all"],
    queryFn: () => load(),
  });
  const items = (data?.items ?? []) as PricingPlan[];

  return (
    <SiteLayout>
      <Section className="pt-8 sm:pt-12">
        <Reveal variant="up">
          <div className="max-w-3xl">
            <Eyebrow>Pricing</Eyebrow>
            <h1
              className="mt-5 text-5xl font-normal tracking-tight sm:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Plans built around <span className="text-gradient italic">outcomes</span>.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              Straightforward packages with everything included. Need something bespoke? We'll shape
              a plan around your roadmap.
            </p>
          </div>
        </Reveal>

        <div className="mt-16">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 p-16 text-center text-sm text-muted-foreground">
              {isLoading ? "Loading plans…" : "Pricing plans will appear here once published."}
            </div>
          ) : (
            <PricingGrid items={items} />
          )}
        </div>
      </Section>
      <ContactCTA />
    </SiteLayout>
  );
}
