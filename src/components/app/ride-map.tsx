"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import type { Map as MapInstance } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import { EMBER, MAP_STYLE, MAP_WORKER, ROUTE_ENDPOINT } from "@/components/app/map-style";
import { decodePolyline6 } from "@/server/polyline";
import { formatRideDuration, type MapPoint } from "@/server/ride-options";

type RideMapProps = {
  // The stops that have a pin, in itinerary order, each with the number it carries in the list.
  points: (MapPoint & { number: number; name: string })[];
  // The road from the group's own GPX file, as an encoded line. When present it is drawn as
  // it is and no route is asked from the map provider.
  track?: string | null;
};

type LiveRoute = { line: [number, number][]; km: number; minutes: number };

const WEEK = 7 * 24 * 60 * 60 * 1000;

// The provider's terms allow keeping a result in the browser for up to seven days, and nowhere
// else, so the route is asked for from here and remembered only on this device.
function readCache(key: string): LiveRoute | null {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? "null") as (LiveRoute & { at: number }) | null;

    return saved && Date.now() - saved.at < WEEK ? saved : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, route: LiveRoute) {
  try {
    localStorage.setItem(key, JSON.stringify({ ...route, at: Date.now() }));
  } catch {
    // A full or blocked storage only means the route is asked for again next time.
  }
}

async function fetchRoute(points: MapPoint[]): Promise<LiveRoute | null> {
  const response = await fetch(ROUTE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      locations: points.map((point) => ({ lat: point.lat, lon: point.lon })),
      costing: "motorcycle",
      units: "kilometers",
    }),
  });

  if (!response.ok) return null;

  const { trip } = (await response.json()) as {
    trip?: { legs: { shape: string }[]; summary: { length: number; time: number } };
  };

  if (!trip) return null;

  return {
    line: trip.legs.flatMap((leg) => decodePolyline6(leg.shape)),
    km: Math.round(trip.summary.length),
    minutes: Math.round(trip.summary.time / 60),
  };
}

export function RideMap({ points, track = null }: RideMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const [route, setRoute] = useState<LiveRoute | null>(null);
  const [hasFailed, setHasFailed] = useState(false);
  const hasTrack = track !== null;
  const key = `rota:${points.map((point) => `${point.lat},${point.lon}`).join(";")}`;
  const hasRoute = route !== null;
  const canRoute = !hasTrack && points.length > 1;
  const showsStraightNote = canRoute && hasFailed;

  useEffect(() => {
    let isCancelled = false;
    let instance: MapInstance | null = null;

    async function start() {
      const maplibre = await import("maplibre-gl");

      maplibre.setWorkerUrl(MAP_WORKER);

      if (isCancelled || !container.current) return;

      const bounds = new maplibre.LngLatBounds();
      const trackLine = track === null ? [] : decodePolyline6(track);

      points.forEach((point) => bounds.extend([point.lon, point.lat]));
      trackLine.forEach((coordinate) => bounds.extend(coordinate));

      const map = new maplibre.Map({
        container: container.current,
        style: MAP_STYLE,
        bounds,
        fitBoundsOptions: { padding: 48, maxZoom: 13 },
        // One finger scrolls the page; the map moves with two, or with the mouse plus a key.
        cooperativeGestures: true,
        // Credits stay one tap away instead of covering the route on a phone.
        attributionControl: { compact: true },
      });

      instance = map;
      map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");

      for (const point of points) {
        const pin = document.createElement("div");

        pin.textContent = String(point.number);
        pin.title = point.name;
        pin.className =
          "grid size-7 place-items-center rounded-full border border-[#f0dfbd] bg-[#0c0b0a] text-xs font-bold text-[#f0dfbd]";
        new maplibre.Marker({ element: pin }).setLngLat([point.lon, point.lat]).addTo(map);
      }

      let line = trackLine;

      if (canRoute) {
        const cached = readCache(key);
        const found = cached ?? (await fetchRoute(points).catch(() => null));

        if (isCancelled) return;

        if (!found) {
          setHasFailed(true);

          return;
        }

        if (!cached) writeCache(key, found);

        setRoute(found);
        line = found.line;
      }

      if (line.length < 2) return;

      const draw = () => {
        map.addSource("rota", {
          type: "geojson",
          data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: line } },
        });
        map.addLayer({
          id: "rota",
          type: "line",
          source: "rota",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": EMBER, "line-width": 4 },
        });

        const whole = new maplibre.LngLatBounds();

        line.forEach((coordinate) => whole.extend(coordinate));
        map.fitBounds(whole, { padding: 48, duration: 0 });
      };

      if (map.isStyleLoaded()) draw();
      else map.once("load", draw);
    }

    void start();

    return () => {
      isCancelled = true;
      instance?.remove();
    };
    // The key stands for the points: the map is rebuilt only when a pin moves or the track changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, track]);

  return (
    <div>
      <div
        ref={container}
        role="application"
        aria-label="Mapa da rota, com as paradas numeradas como no roteiro"
        className="aspect-[4/3] w-full overflow-hidden rounded-sm bg-card"
      />
      <p className="mt-2 min-h-5 text-sm text-cream-dim" aria-live="polite">
        {hasRoute && `Pelo mapa: ${route.km} km, ${formatRideDuration(route.minutes)} de moto sem as paradas.`}
        {showsStraightNote && "O traçado não carregou agora. As paradas estão marcadas no mapa."}
        {hasTrack && "Traçado do arquivo GPX enviado pelos administradores."}
      </p>
    </div>
  );
}
