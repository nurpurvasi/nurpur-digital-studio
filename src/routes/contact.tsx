import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Plus } from "lucide-react";
import { Eyebrow, Section, SiteLayout } from "@/components/site/Layout";
import { useSiteContent } from "@/content/SiteContentContext";
import { ContactForm } from "@/components/site/ContactForm";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact NurpurVasi Media — Share News, Photos or Promote Your Business" },
      {
        name: "description",
        content: "Contact NurpurVasi Media — send us Nurpur photos, videos or event information, or ask about promoting your local business.",
      },
      { property: "og:title", content: "Contact NurpurVasi Media" },
      {
        property: "og:description",
        content: "Send us Nurpur photos, videos, event details or a business promotion enquiry.",
      },
      { property: "og:url", content: "https://nurpur-digital-studio.lovable.app/contact" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://nurpur-digital-studio.lovable.app/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const siteContent = useSiteContent();
  return (
    <SiteLayout>
      <Section className="pt-8 sm:pt-12">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Eyebrow>Contact</Eyebrow>
            <h1
              className="mt-5 text-5xl font-semibold tracking-tight sm:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Share Nurpur's <span className="text-gradient">stories</span> with us.
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground sm:text-lg">
              Send us photos, videos or event details from Nurpur, or ask about listing your local
              business. We usually reply within a day.
            </p>


            <ul className="mt-10 space-y-5">
              {[
                { Icon: Mail, label: siteContent.contact.email, placeholder: "Add Email" },
                { Icon: Phone, label: siteContent.contact.phoneDisplay || siteContent.contact.phone, placeholder: "Add Phone Number" },
                { Icon: MapPin, label: siteContent.contact.location, placeholder: "Add Address" },
              ].map(({ Icon, label, placeholder }) => (
                <li key={placeholder} className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl border border-border bg-background">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label ? (
                    <span className="text-sm">{label}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Plus className="h-3.5 w-3.5" style={{ color: "var(--royal)" }} />
                      {placeholder}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <ContactForm template="media-portal" showCompany={false} showSubject={false} />
        </div>
      </Section>
    </SiteLayout>
  );
}
