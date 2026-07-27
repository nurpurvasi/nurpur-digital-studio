import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Plus } from "lucide-react";
import { Eyebrow, Section, SiteLayout } from "@/components/site/Layout";
import { useSiteContent } from "@/content/SiteContentContext";
import { ContactForm } from "@/components/site/ContactForm";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — NurpurVasi Digitals" },
      {
        name: "description",
        content: "Start a premium project with NurpurVasi Digitals. Get in touch with Gaurav Bharti.",
      },
      { property: "og:title", content: "Contact — NurpurVasi Digitals" },
      {
        property: "og:description",
        content: "Start a premium project. We'd love to hear from you.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
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
              Let's build <span className="text-gradient">something great</span>.
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground sm:text-lg">
              Tell us a little about your project and we'll be in touch within one business day.
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

          <ContactForm template="business" />
        </div>
      </Section>
    </SiteLayout>
  );
}
