import { Link } from "@tanstack/react-router";
import { Github, Instagram, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface/60">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="grid h-9 w-9 place-items-center rounded-xl text-sm font-bold text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                N
              </span>
              <span className="text-base font-semibold tracking-tight">NurpurVasi Digitals</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Premium website design, development, SEO and digital solutions crafted with obsessive care.
            </p>
          </div>

          <FooterCol title="Studio" items={[
            { label: "Services", to: "/services" },
            { label: "Portfolio", to: "/portfolio" },
            { label: "About", to: "/about" },
          ]} />
          <FooterCol title="Company" items={[
            { label: "Contact", to: "/contact" },
          ]} />

          <div>
            <p className="text-sm font-medium">Follow</p>
            <div className="mt-4 flex gap-2">
              {[Twitter, Instagram, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background transition-colors hover:bg-accent"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} NurpurVasi Digitals. Crafted by Gaurav Bharti.</p>
          <p>Made with care · Premium digital studio</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {items.map((it) => (
          <li key={it.to}>
            <Link to={it.to} className="transition-colors hover:text-foreground">
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
