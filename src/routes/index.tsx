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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NurpurVasi Digitals — Premium Digital Studio by Gaurav Bharti" },
      {
        name: "description",
        content:
          "NurpurVasi Digitals designs and builds world-class websites, brands and digital products for ambitious companies. Premium web design, development, SEO and digital solutions.",
      },
      { property: "og:title", content: "NurpurVasi Digitals — Premium Digital Studio" },
      {
        property: "og:description",
        content:
          "World-class websites, brands and digital products crafted with obsessive care by Gaurav Bharti.",
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
      <Hero />
      <StatsSection />
      <ServicesSection />
      <FeaturedPortfolio />
      <ProcessSection />
      <TestimonialsSection />
      <FAQSection />
      <PremiumContactSection />
      <PremiumCTA />
    </SiteLayout>
  );
}
