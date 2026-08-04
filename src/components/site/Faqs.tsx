import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { sanitizeRichText, faqPlainText, type Faq } from "@/lib/faqs.functions";

/** Escape a user query for safe use inside a RegExp. */
function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Highlight matches inside plain text, returning React nodes. */
export function highlight(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const parts = text.split(new RegExp(`(${escapeRe(q)})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="rounded bg-[color:var(--royal)]/15 px-0.5 text-foreground">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

/** Highlight matches inside rich text without touching tags/attributes. */
export function highlightHtml(html: string, query: string) {
  const clean = sanitizeRichText(html);
  const q = query.trim();
  if (!q) return clean;
  const re = new RegExp(escapeRe(q), "gi");
  return clean
    .split(/(<[^>]*>)/g)
    .map((seg) =>
      seg.startsWith("<")
        ? seg
        : seg.replace(re, (m) => `<mark class="faq-mark">${m}</mark>`),
    )
    .join("");
}

export function FaqRichText({ html, query = "" }: { html: string; query?: string }) {
  const content = useMemo(() => highlightHtml(html, query), [html, query]);
  return (
    <div
      className="faq-rich prose-sm max-w-none text-sm leading-relaxed text-muted-foreground sm:text-[15px] [&_a]:underline [&_img]:my-3 [&_img]:rounded-xl [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-3 [&_strong]:text-foreground [&_.faq-mark]:rounded [&_.faq-mark]:bg-[color:var(--royal)]/15 [&_.faq-mark]:px-0.5 [&_.faq-mark]:text-foreground"
      // Content is admin-authored and sanitized server-side and on render.
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

/**
 * Reusable accordion. Design matches the existing homepage FAQ block so it can
 * be dropped into any template (business, agency, school, hotel, hospital,
 * restaurant, real estate, NGO).
 */
export function FaqAccordion({
  items,
  query = "",
  defaultOpen = 0,
}: {
  items: Faq[];
  query?: string;
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<string | null>(
    defaultOpen !== null && items[defaultOpen] ? items[defaultOpen].id : null,
  );

  return (
    <div className="divide-y divide-border rounded-3xl border border-border bg-white/70 backdrop-blur-xl">
      {items.map((f) => {
        const isOpen = open === f.id;
        return (
          <div key={f.id} className="px-6 sm:px-8">
            <button
              onClick={() => setOpen(isOpen ? null : f.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className="text-base font-semibold sm:text-lg">
                {highlight(f.question, query)}
              </span>
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-background transition-colors"
                style={
                  isOpen
                    ? {
                        background: "var(--gradient-brand)",
                        color: "white",
                        borderColor: "transparent",
                      }
                    : undefined
                }
              >
                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
            </button>
            <div
              className="grid overflow-hidden transition-all duration-500 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="min-h-0">
                <div className="pb-6 pr-4 sm:pr-14">
                  <FaqRichText html={f.answer} query={query} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Auto-generated FAQPage structured data for published FAQs. */
export function FaqJsonLd({ items }: { items: Faq[] }) {
  const json = useMemo(() => {
    const entries = items
      .filter((f) => f.question.trim() && f.answer.trim())
      .map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: faqPlainText(f.answer) },
      }));
    if (entries.length === 0) return null;
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: entries,
    });
  }, [items]);

  if (!json) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
