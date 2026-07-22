import { createFileRoute } from "@tanstack/react-router";
import { Eyebrow, Section, SiteLayout } from "@/components/site/Layout";
import { ContactCTA, ProjectsGrid } from "@/components/site/Sections";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — NurpurVasi Digitals" },
      {
        name: "description",
        content: "Selected work from NurpurVasi Digitals — premium websites, products and brands.",
      },
      { property: "og:title", content: "Portfolio — NurpurVasi Digitals" },
      {
        property: "og:description",
        content: "Selected work: premium websites, products and brands.",
      },
      { property: "og:url", content: "/portfolio" },
    ],
    links: [{ rel: "canonical", href: "/portfolio" }],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  return (
    <SiteLayout>
      <Section className="pt-8 sm:pt-12">
        <Reveal variant="up">
          <div className="max-w-3xl">
            <Eyebrow>Selected work</Eyebrow>
            <h1
              className="mt-5 text-5xl font-normal tracking-tight sm:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Work we're <span className="text-gradient italic">proud of</span>.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              A small selection of recent engagements across brand, product and platform.
            </p>
          </div>
        </Reveal>
        <Reveal variant="up" delay={120} className="mt-16 block">
          <ProjectsGrid />
        </Reveal>
      </Section>
      <ContactCTA />
    </SiteLayout>
  );
}
