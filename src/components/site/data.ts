import { Code2, Search, Palette, Rocket, Smartphone, LineChart } from "lucide-react";

// Service offerings — real studio capabilities, editable here.
export const services = [
  {
    icon: Palette,
    title: "Website Design",
    desc: "Cinematic, brand-first interfaces designed to feel unmistakably premium.",
  },
  {
    icon: Code2,
    title: "Development",
    desc: "Production-grade builds with buttery motion, blazing performance and clean code.",
  },
  {
    icon: Search,
    title: "SEO",
    desc: "Technical SEO, content strategy and Core Web Vitals tuned for organic growth.",
  },
  {
    icon: Smartphone,
    title: "Mobile Experiences",
    desc: "Mobile-first, fluid layouts and gestures that feel native on every device.",
  },
  {
    icon: LineChart,
    title: "Analytics & CRO",
    desc: "Instrumented insights and conversion experiments that compound over time.",
  },
  {
    icon: Rocket,
    title: "Digital Solutions",
    desc: "End-to-end brand, marketing sites, dashboards and bespoke digital products.",
  },
];

// Portfolio projects are managed centrally via siteContent.portfolio
// in `src/content/site.ts` so they can be swapped without touching code.
export { siteContent as _siteContent } from "@/content/site";
