import { rioDateInput, rioInstant, rioTimeInput } from "@/server/ride-options";
import type { RideService } from "@/server/rides";

export type WeatherPoint = { lat: number; lon: number; at: Date };

export type WeatherReading = { temperatureC: number; rainChance: number; weatherCode: number };

export type WeatherProvider = {
  forecast(point: WeatherPoint): Promise<WeatherReading | null>;
};

export type Sky = "clear" | "partly" | "cloudy" | "fog" | "rain" | "storm";

export type RideForecastPoint = {
  kind: "meeting" | "destination";
  place: string;
  at: Date;
  temperatureC: number;
  rainChance: number;
  sky: Sky;
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const FORECAST_WINDOW_DAYS = 7;
const KEEP_READING_FOR = 3 * HOUR;
const KEEP_FAILURE_FOR = 10 * 60 * 1000;

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
      latitude: String(point.lat),
      longitude: String(point.lon),
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

    return readOpenMeteo((await response.json()) as OpenMeteoAnswer, `${day}T${rioTimeInput(point.at)}`);
  },
};

// Forecasts come by the hour and for an area, not a spot: the hour nearest the time asked,
// and a place rounded to about a kilometre. Both the query and the stored key use this.
function forecastSlot(place: { lat: number; lon: number }, at: Date): WeatherPoint {
  return {
    lat: Number(place.lat.toFixed(2)),
    lon: Number(place.lon.toFixed(2)),
    at: new Date(Math.round(at.getTime() / HOUR) * HOUR),
  };
}

export function createWeatherService(
  rides: Pick<RideService, "getRide">,
  provider: WeatherProvider,
  now: () => Date = () => new Date(),
) {
  // Kept in this process, so a page visit rarely means a call to the provider: a reading for
  // three hours, a failure for ten minutes, so a provider that is down does not slow every
  // visit. A restart only empties it.
  const kept = new Map<string, { reading: WeatherReading | null; until: number }>();

  function forget(moment: number) {
    for (const [key, entry] of kept) {
      if (entry.until <= moment) kept.delete(key);
    }
  }

  async function readingFor(slot: WeatherPoint) {
    const moment = now().getTime();
    const key = `${slot.lat},${slot.lon},${slot.at.toISOString()}`;
    const saved = kept.get(key);

    if (saved && saved.until > moment) return saved.reading;

    // The weather never breaks a page: a provider that fails just leaves the point out.
    const reading = await provider.forecast(slot).catch(() => null);

    forget(moment);
    kept.set(key, { reading, until: moment + (reading ? KEEP_READING_FOR : KEEP_FAILURE_FOR) });

    return reading;
  }

  // Temperature and chance of rain where the ride meets, when it leaves, and at its destination,
  // at the time planned for it. Null when there is nothing to show: more than a week ahead,
  // once the ride has set off, on a cancelled ride, without pins or with the provider down.
  async function getRideForecast(viewerId: string, rideId: string): Promise<RideForecastPoint[] | null> {
    const ride = await rides.getRide(viewerId, rideId);
    const isWithinWindow = ride.startsAt.getTime() - now().getTime() <= FORECAST_WINDOW_DAYS * DAY;

    if (ride.status === "CANCELLED" || ride.isOver || !isWithinWindow) return null;

    const destination = ride.stops.find((stop) => stop.kind === "DESTINATION");
    const arrival = destination?.time ? rioInstant(rioDateInput(ride.startsAt), destination.time) : null;
    // A stop's time carries no date: one that is not after the departure cannot be placed.
    const arrivesAfterLeaving = arrival !== null && arrival > ride.startsAt;
    const wanted = [
      { kind: "meeting" as const, stop: ride.stops[0], at: ride.startsAt },
      { kind: "destination" as const, stop: destination, at: arrivesAfterLeaving ? arrival : null },
    ];
    const found = await Promise.all(
      wanted.map(async ({ kind, stop, at }): Promise<RideForecastPoint | null> => {
        if (!stop || stop.lat === null || stop.lon === null || at === null) return null;

        const reading = await readingFor(forecastSlot({ lat: stop.lat, lon: stop.lon }, at));

        if (!reading) return null;

        return {
          kind,
          place: stop.name,
          at,
          temperatureC: Math.round(reading.temperatureC),
          rainChance: Math.round(reading.rainChance),
          sky: skyOf(reading.weatherCode),
        };
      }),
    );
    const points = found.filter((point) => point !== null);

    return points.length > 0 ? points : null;
  }

  return { getRideForecast };
}

export type WeatherService = ReturnType<typeof createWeatherService>;
