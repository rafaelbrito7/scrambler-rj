"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import type { Map as MapInstance, Marker } from "maplibre-gl";
import { useEffect, useRef } from "react";

import { EMBER, MAP_STYLE, MAP_WORKER, RIO } from "@/components/app/map-style";
import type { MapPoint } from "@/server/ride-options";

type PinPickerProps = { value: MapPoint | null; onChange: (point: MapPoint) => void; label: string };

// A map the administrator taps to say where a stop is. The point is theirs: nothing here asks
// a search service for coordinates.
export function PinPicker({ value, onChange, label }: PinPickerProps) {
  const container = useRef<HTMLDivElement>(null);
  const marker = useRef<Marker | null>(null);
  const map = useRef<MapInstance | null>(null);
  const latest = useRef({ value, onChange });

  useEffect(() => {
    latest.current = { value, onChange };
  });

  useEffect(() => {
    let isCancelled = false;

    async function start() {
      const maplibre = await import("maplibre-gl");

      maplibre.setWorkerUrl(MAP_WORKER);

      if (isCancelled || !container.current) return;

      const initial = latest.current.value;
      const instance = new maplibre.Map({
        container: container.current,
        style: MAP_STYLE,
        center: initial ? [initial.lon, initial.lat] : RIO,
        zoom: initial ? 13 : 8.5,
        attributionControl: { compact: true },
      });

      instance.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
      map.current = instance;

      const place = (point: MapPoint) => {
        const pin = marker.current ?? new maplibre.Marker({ color: EMBER });

        pin.setLngLat([point.lon, point.lat]).addTo(instance);
        marker.current = pin;
      };

      if (initial) place(initial);

      instance.on("click", (event) => {
        const point = { lat: Number(event.lngLat.lat.toFixed(6)), lon: Number(event.lngLat.lng.toFixed(6)) };

        place(point);
        latest.current.onChange(point);
      });
    }

    void start();

    return () => {
      isCancelled = true;
      map.current?.remove();
      map.current = null;
      marker.current = null;
    };
  }, []);

  return (
    <div
      ref={container}
      role="application"
      aria-label={label}
      className="h-72 w-full overflow-hidden rounded-sm bg-background"
    />
  );
}
