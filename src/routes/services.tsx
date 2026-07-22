import { createFileRoute } from "@tanstack/react-router";
import { Eyebrow, Section, SiteLayout } from "@/components/site/Layout";
import { ContactCTA, ServicesGrid } from "@/components/site/Sections";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — NurpurVasi Digitals" },
      {
        name: "description",
        content:
          "Website design, development, SEO, analytics and bespoke digital solutions from NurpurVasi Digitals.",
      },
      { property: "og:title", content: "Services — NurpurVasi Digitals" },
      {
        property: "og:description",
        content: "Premium services: design, development, SEO and digital solutions.",
      },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <SiteLayout>
      <Section className="pt-8 sm:pt-12">
        <div className="max-w-3xl">
        <Reveal variant="up">
          <div className="max-w-3xl">
            <Eyebrow>Services</Eyebrow>
            <h1
              className="mt-5 text-5xl font-normal tracking-tight sm:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Everything your brand needs, <span className="text-gradient italic">nothing it doesn't</span>.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              A tight, senior team covering the full spectrum from strategy and design to
              engineering, SEO and long-term partnership.
            </p>
          </div>
        </Reveal>
        <Reveal variant="up" delay={120} className="mt-16 block">
          <ServicesGrid />
        </Reveal>
      </Section>
      <ContactCTA />
    </SiteLayout>
  );
}
