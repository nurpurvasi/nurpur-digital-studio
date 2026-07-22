import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { Hero } from "@/components/site/Hero";
import {
  AboutPreview,
  ContactCTA,
  PortfolioPreview,
  ServicesPreview,
} from "@/components/site/Sections";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <Hero />
      <ServicesPreview />
      <PortfolioPreview />
      <AboutPreview />
      <ContactCTA />
    </SiteLayout>
  );
}
