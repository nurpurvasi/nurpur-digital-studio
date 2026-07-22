import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Eyebrow, Section, SiteLayout } from "@/components/site/Layout";

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
  const [sent, setSent] = useState(false);
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
                { Icon: Mail, label: "hello@nurpurvasidigitals.com" },
                { Icon: Phone, label: "+91 00000 00000" },
                { Icon: MapPin, label: "India · Working worldwide" },
              ].map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl border border-border bg-background">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="glass rounded-[28px] p-6 sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" name="name" placeholder="Your name" />
              <Field label="Email" name="email" type="email" placeholder="you@brand.com" />
            </div>
            <div className="mt-4">
              <Field label="Company" name="company" placeholder="Company (optional)" />
            </div>
            <div className="mt-4">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                About the project
              </label>
              <textarea
                required
                rows={5}
                placeholder="Tell us about goals, timeline and budget…"
                className="mt-2 w-full resize-none rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
              />
            </div>
            <button type="submit" className="btn-primary mt-6 w-full sm:w-auto">
              {sent ? "Thanks — we'll be in touch" : "Send message"}
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </Section>
    </SiteLayout>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required
        className="mt-2 w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
      />
    </div>
  );
}
