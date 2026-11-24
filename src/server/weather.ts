import type { AccessService } from "@/server/access";
import { rioDateInput, rioTimeInput } from "@/server/ride-options";
import { RideError, type RideService } from "@/server/rides";

export type WeatherPoint = { lat: number; lon: number; at: Date };

export type WeatherReading = { temperatureC: number; rainChance: number; weatherCode: number };

// Where forecasts come from. Injected, so the tests need no network and the provider can change.
export type WeatherProvider = {
  forecast(point: WeatherPoint): Promise<WeatherReading | null>;
};

export type Sky = "clear" | "partly" | "cloudy" | "fog" | "rain" | "storm";

export type RideForecastPoint = {
  label: "Encontro" | "Destino";
  place: string;
  at: Date;
  temperatureC: number;
  rainChance: number;
  sky: Sky;
};

export const FORECAST_WINDOW_DAYS = 7;

const DAY = 24 * 60 * 60 * 1000;
const KEEP_FOR = 3 * 60 * 60 * 1000;

// The sky in one word, from the WMO weather code forecasts use.
export function skyOf(weatherCode: number): Sky {
  if (weatherCode >= 95) return "storm";
  if (weatherCode >= 51) return "rain";
  if (weatherCode >= 45) return "fog";
  if (weatherCode === 3) return "cloudy";
  if (weatherCode >= 1) return "partly";

  return "clear";
}

type OpenMeteoAnswer = {
  hourly?: {
    time?: string[];
    temperature_2m?: (number | null)[];
    precipitation_probability?: (number | null)[];
    weather_code?: (number | null)[];
  };
};

// Picks one hour out of the day Open-Meteo answered with. `hour` is local time, "2026-12-12T07:00".
export function readOpenMeteo(answer: OpenMeteoAnswer, hour: string): WeatherReading | null {
  const index = answer.hourly?.time?.indexOf(hour) ?? -1;
  const temperatureC = answer.hourly?.temperature_2m?.[index];
  const rainChance = answer.hourly?.precipitation_probability?.[index];
  const weatherCode = answer.hourly?.weather_code?.[index];
  const isComplete =
    typeof temperatureC === "number" && typeof rainChance === "number" && typeof weatherCode === "number";

  return isComplete ? { temperatureC, rainChance, weatherCode } : null;
}

// Open-Meteo, free for non-commercial use and without a key. Asked from the server only.
export const openMeteo: WeatherProvider = {
  async forecast(point) {
    const day = rioDateInput(point.at);
    const params = new URLSearchParams({
      latitude: point.lat.toFixed(2),
      longitude: point.lon.toFixed(2),
      hourly: "temperature_2m,precipitation_probability,weather_code",
      timezone: "America/Sao_Paulo",
      start_date: day,
      end_date: day,
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });

    if (!response.ok) return null;

    return readOpenMeteo((await response.json()) as OpenMeteoAnswer, `${day}T${rioTimeInput(point.at).slice(0, 2)}:00`);
  },
};

export function createWeatherService(
  access: Pick<AccessService, "getAccess">,
  rides: Pick<RideService, "getRide">,
  provider: WeatherProvider,
  now: () => Date = () => new Date(),
) {
  // Kept in this process for three hours, so a page visit rarely means a call to the provider.
  // A restart only empties it.
  const kept = new Map<string, { reading: WeatherReading; at: number }>();

  async function readingFor(point: WeatherPoint) {
    const key = `${point.lat.toFixed(2)},${point.lon.toFixed(2)},${point.at.toISOString().slice(0, 13)}`;
    const saved = kept.get(key);

    if (saved && now().getTime() - saved.at < KEEP_FOR) return saved.reading;

    // The weather never breaks a page: a provider that fails just leaves the point out.
    const reading = await provider.forecast(point).catch(() => null);

    if (reading) kept.set(key, { reading, at: now().getTime() });

    return reading;
  }

  // Temperature and chance of rain where the ride meets, when it leaves, and at its destination,
  // at the time planned for it. Null when there is nothing to show: more than a week ahead,
  // once the ride has set off, on a cancelled ride, without pins or with the provider down.
  async function getRideForecast(viewerId: string, rideId: string): Promise<RideForecastPoint[] | null> {
    const viewer = await access.getAccess(viewerId);

    if (viewer.state !== "approved") throw new RideError("FORBIDDEN");

    const ride = await rides.getRide(viewerId, rideId);
    const isWithinWindow = ride.startsAt.getTime() - now().getTime() <= FORECAST_WINDOW_DAYS * DAY;

    if (ride.status === "CANCELLED" || ride.isOver || !isWithinWindow) return null;

    const day = rioDateInput(ride.startsAt);
    const meeting = ride.stops[0];
    const destination = ride.stops.find((stop) => stop.kind === "DESTINATION");
    const wanted = [
      { label: "Encontro" as const, stop: meeting, at: ride.startsAt },
      {
        label: "Destino" as const,
        stop: destination,
        at: destination?.time ? new Date(`${day}T${destination.time}:00-03:00`) : null,
      },
    ];
    const points: RideForecastPoint[] = [];

    for (const { label, stop, at } of wanted) {
      if (!stop || stop.lat === null || stop.lon === null || at === null) continue;

      const reading = await readingFor({ lat: stop.lat, lon: stop.lon, at });

      if (!reading) continue;

      points.push({
        label,
        place: stop.name,
        at,
        temperatureC: Math.round(reading.temperatureC),
        rainChance: Math.round(reading.rainChance),
        sky: skyOf(reading.weatherCode),
      });
    }

    return points.length > 0 ? points : null;
  }

  return { getRideForecast };
}

export type WeatherService = ReturnType<typeof createWeatherService>;
