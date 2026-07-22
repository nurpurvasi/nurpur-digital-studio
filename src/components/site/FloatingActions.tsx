import { useEffect, useState } from "react";
import { Phone, MessageCircle, ArrowUp } from "lucide-react";
import { useSiteContent } from "@/content/SiteContentContext";

export function FloatingActions() {
  const siteContent = useSiteContent();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { phone, whatsapp } = siteContent.contact;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`group grid h-11 w-11 place-items-center rounded-full border border-border bg-white/90 text-foreground shadow-[0_10px_30px_-15px_rgba(30,40,90,0.35)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 ${
          showTop ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
      </button>

      {phone && (
        <a
          href={`tel:${phone}`}
          aria-label="Call the studio"
          className="group relative grid h-12 w-12 place-items-center rounded-full text-white shadow-[0_16px_40px_-15px_color-mix(in_oklab,var(--royal)_55%,transparent)] transition-transform duration-500 hover:-translate-y-0.5 sm:h-14 sm:w-14"
          style={{ background: "var(--gradient-brand)" }}
        >
          <span
            className="absolute inset-0 -z-10 rounded-full opacity-60 animate-ping"
            style={{ background: "color-mix(in oklab, var(--royal) 55%, transparent)" }}
          />
          <Phone className="h-5 w-5" />
        </a>
      )}

      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          className="group relative grid h-12 w-12 place-items-center rounded-full text-white shadow-[0_16px_40px_-15px_rgba(37,211,102,0.55)] transition-transform duration-500 hover:-translate-y-0.5 sm:h-14 sm:w-14"
          style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
        >
          <MessageCircle className="h-5 w-5" />
        </a>
      )}
    </div>
  );
}
