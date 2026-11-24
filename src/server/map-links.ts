import type { MapPoint } from "@/server/ride-options";

// Google Maps takes at most nine stops between origin and destination in a shared address.
export const MAX_ROUTE_WAYPOINTS = 9;

const MAX_URL_LENGTH = 2048;

function coordinates(point: MapPoint) {
  const round = (value: number) => Number(value.toFixed(6));

  return `${round(point.lat)},${round(point.lon)}`;
}

function routeUrl(points: MapPoint[]) {
  const params = new URLSearchParams({ api: "1" });
  const waypoints = points.slice(1, -1);

  if (points.length > 1) params.set("origin", coordinates(points[0]));

  params.set("destination", coordinates(points[points.length - 1]));

  if (waypoints.length > 0) params.set("waypoints", waypoints.map(coordinates).join("|"));

  params.set("travelmode", "two-wheeler");

  return `https://www.google.com/maps/dir/?${params}`;
}

// The whole ride in Google Maps, from the stops that have a pin, in itinerary order. Past the
// limit the meeting point and the destination stay, with the first stops in between;
// `isPartial` says the address leaves part of the itinerary out. A single stop is opened as a
// destination, from wherever the person is.
export function buildRouteLink(points: MapPoint[]): { url: string; isPartial: boolean } | null {
  if (points.length === 0) return null;

  const last = points[points.length - 1];
  let between = points.slice(1, -1).slice(0, MAX_ROUTE_WAYPOINTS);
  const compose = () => (points.length === 1 ? [last] : [points[0], ...between, last]);
  let url = routeUrl(compose());

  while (url.length > MAX_URL_LENGTH && between.length > 0) {
    between = between.slice(0, -1);
    url = routeUrl(compose());
  }

  return { url, isPartial: between.length < Math.max(0, points.length - 2) };
}

// One stop on its own. Waze only takes a single destination, so it gets its own address.
export function buildPointLinks(point: MapPoint) {
  const query = new URLSearchParams({ api: "1", query: coordinates(point) });
  const waze = new URLSearchParams({ ll: coordinates(point), navigate: "yes" });

  return {
    maps: `https://www.google.com/maps/search/?${query}`,
    waze: `https://waze.com/ul?${waze}`,
  };
}
