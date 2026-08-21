import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, Section, Eyebrow } from "@/components/site/Layout";
import { WeatherPanel } from "@/components/media/WeatherPanel";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Nurpur Weather Today — Live Forecast | NurpurVasi Media" },
      {
        name: "description",
        content:
          "Live Nurpur weather: current temperature, humidity, wind and a 5-day forecast for Nurpur, Kangra district, Himachal Pradesh.",
      },
      { property: "og:title", content: "Nurpur Weather Today — Live Forecast" },
      {
        property: "og:description",
        content: "Current conditions and 5-day forecast for Nurpur, Himachal Pradesh.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://nurpur-digital-studio.lovable.app/weather" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://nurpur-digital-studio.lovable.app/weather" }],
  }),
  component: WeatherPage,
});

function WeatherPage() {
  return (
    <SiteLayout>
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Local weather</Eyebrow>
          <h1
            className="mt-5 text-4xl tracking-tight sm:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Nurpur <span className="text-gradient italic">weather today</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Current conditions and the week ahead for Nurpur, Kangra district, Himachal Pradesh.
          </p>
        </div>
        <div className="mt-12 max-w-2xl">
          <WeatherPanel />
        </div>
      </Section>
    </SiteLayout>
  );
}
