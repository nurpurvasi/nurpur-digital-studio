import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { Hero } from "@/components/site/Hero";
import {
  StatsSection,
  ServicesSection,
  FeaturedPortfolio,
  ProcessSection,
  TestimonialsSection,
  FAQSection,
  PremiumCTA,
} from "@/components/site/HomeSections";
import { PremiumContactSection } from "@/components/site/PremiumContact";
import { Gallery } from "@/components/site/Gallery";
import { PricingSection } from "@/components/site/Pricing";
import { Team } from "@/components/site/Team";
import { ClientsSection } from "@/components/site/Clients";
import { InlineEditable } from "@/components/site/inline-editor/InlineEditable";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NurpurVasi Digitals — Premium Digital Studio by Gaurav Bharti" },
      {
        name: "description",
        content:
          "NurpurVasi Digitals designs and builds world-class websites, brands and digital products for ambitious companies. Premium web design, development, SEO and digital solutions.",
      },
      { property: "og:title", content: "NurpurVasi Digitals — Premium Digital Studio by Gaurav Bharti" },
      {
        property: "og:description",
        content:
          "NurpurVasi Digitals designs and builds world-class websites, brands and digital products for ambitious companies. Premium web design, development, SEO and digital solutions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <InlineEditable section="hero" label="Hero">
        <Hero />
      </InlineEditable>
      <InlineEditable section="stats" label="Statistics">
        <StatsSection />
      </InlineEditable>
      <InlineEditable section="services" label="Services">
        <ServicesSection />
      </InlineEditable>
      <InlineEditable section="portfolio" label="Portfolio">
        <FeaturedPortfolio />
      </InlineEditable>
      <Gallery variant="featured" eyebrow="Gallery" title="A closer look" showEmpty={false} />
      <Team
        variant="featured"
        eyebrow="Our Team"
        title="The people behind the work"
        subtitle="A focused team of designers, engineers and strategists."
        showEmpty={false}
      />
      <ClientsSection />
      <PricingSection variant="featured" />
      <ProcessSection />

      <InlineEditable section="testimonials" label="Testimonials">
        <TestimonialsSection />
      </InlineEditable>
      <InlineEditable section="faqs" label="FAQ">
        <FAQSection />
      </InlineEditable>
      <InlineEditable section="contact" label="Contact">
        <PremiumContactSection />
      </InlineEditable>
      <PremiumCTA />
    </SiteLayout>
  );
}
