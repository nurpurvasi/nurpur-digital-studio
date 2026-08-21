import { useQuery } from "@tanstack/react-query";
import { CloudSun, Droplets, Wind, Thermometer } from "lucide-react";

const LAT = 32.3;
const LON = 75.89;

const CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Freezing fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Violent showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Severe thunderstorm",
};

type Weather = {
  temp: number;
  feels: number;
  code: number;
  wind: number;
  humidity: number;
  days: { date: string; min: number; max: number; code: number }[];
};

/** Live Nurpur weather from the free Open-Meteo API — no API key needed, no manual updates. */
export function WeatherPanel({ compact = false }: { compact?: boolean }) {
  const { data, isLoading, isError, refetch, isFetching } = useQuery<Weather>({
    queryKey: ["weather", LAT, LON],
    staleTime: 15 * 60_000,
    refetchInterval: 15 * 60_000,
    retry: 1,
    queryFn: async () => {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata&forecast_days=5`,
      );
      if (!res.ok) throw new Error("weather-unavailable");
      const json = await res.json();
      if (!json?.current || !json?.daily) throw new Error("weather-unavailable");
      return {
        temp: Math.round(json.current.temperature_2m),
        feels: Math.round(json.current.apparent_temperature ?? json.current.temperature_2m),
        code: json.current.weather_code,
        wind: Math.round(json.current.wind_speed_10m),
        humidity: Math.round(json.current.relative_humidity_2m),
        days: (json.daily.time as string[]).map((date, i) => ({
          date,
          min: Math.round(json.daily.temperature_2m_min[i]),
          max: Math.round(json.daily.temperature_2m_max[i]),
          code: json.daily.weather_code[i],
        })),
      };
    },
  });

  return (
    <div
      className="overflow-hidden rounded-3xl border border-border p-6 sm:p-8"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--cyan) 26%, var(--card)), var(--card) 65%)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Nurpur weather
          </p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              {isLoading || !data ? "--" : data.temp}°
            </span>
            <span className="text-sm text-muted-foreground">
              {data ? (CODES[data.code] ?? "—") : "Loading"}
            </span>
          </p>
        </div>
        <span
          className="grid h-14 w-14 place-items-center rounded-2xl text-background"
          style={{ background: "var(--gradient-warm)" }}
        >
          <CloudSun className="h-7 w-7" />
        </span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <Metric icon={<Thermometer className="h-4 w-4" />} label="Feels" value={data ? `${data.temp}°C` : "--"} />
        <Metric icon={<Droplets className="h-4 w-4" />} label="Humidity" value={data ? `${data.humidity}%` : "--"} />
        <Metric icon={<Wind className="h-4 w-4" />} label="Wind" value={data ? `${data.wind} km/h` : "--"} />
      </div>

      {!compact && data && (
        <div className="mt-6 grid grid-cols-5 gap-2">
          {data.days.map((d) => (
            <div key={d.date} className="rounded-2xl bg-background/70 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" })}
              </p>
              <p className="mt-1 text-sm font-semibold">{d.max}°</p>
              <p className="text-[11px] text-muted-foreground">{d.min}°</p>
            </div>
          ))}
        </div>
      )}
      <p className="mt-5 text-[10px] text-muted-foreground">Live data · Open-Meteo · updates every 15 minutes</p>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background/70 p-3">
      <span className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-surface text-muted-foreground">
        {icon}
      </span>
      <p className="mt-1.5 text-sm font-semibold">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
