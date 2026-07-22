import { useEffect, useState } from "react";
import { useSiteContent } from "@/content/SiteContentContext";

export function LoadingScreen() {
  const siteContent = useSiteContent();
  const [hidden, setHidden] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const done = () => setTimeout(() => setHidden(true), 350);
    if (document.readyState === "complete") done();
    else {
      window.addEventListener("load", done, { once: true });
      // Safety net
      const t = setTimeout(done, 2200);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!hidden) return;
    const t = setTimeout(() => setGone(true), 700);
    return () => clearTimeout(t);
  }, [hidden]);

  if (gone) return null;

  return (
    <div
      aria-hidden={hidden}
      className={`fixed inset-0 z-[100] grid place-items-center bg-background transition-opacity duration-700 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative">
          <span
            className="absolute -inset-4 rounded-3xl opacity-40 blur-2xl"
            style={{ background: "var(--gradient-brand)" }}
          />
          <span
            className="relative grid h-16 w-16 place-items-center rounded-3xl text-xl font-semibold text-white shadow-2xl"
            style={{ background: "var(--gradient-brand)" }}
          >
            {siteContent.brand.initial}
          </span>
        </div>
        <p
          className="text-2xl font-normal tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {siteContent.brand.name}
        </p>
        <div className="relative h-[3px] w-40 overflow-hidden rounded-full bg-border">
          <span
            className="absolute inset-y-0 left-0 w-1/3 rounded-full"
            style={{
              background: "var(--gradient-brand)",
              animation: "loading-slide 1.2s cubic-bezier(.4,0,.2,1) infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}
