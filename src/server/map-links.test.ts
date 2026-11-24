import { describe, expect, it } from "vitest";

import { buildPointLinks, buildRouteLink, MAX_ROUTE_WAYPOINTS } from "@/server/map-links";

// Stops strung along a line, so each one is recognisable in the address by its latitude.
const stops = (count: number) =>
  Array.from({ length: count }, (_unused, index) => ({ lat: -22 - index / 100, lon: -43.1 }));

function read(url: string) {
  const parsed = new URL(url);

  return {
    base: `${parsed.origin}${parsed.pathname}`,
    origin: parsed.searchParams.get("origin"),
    destination: parsed.searchParams.get("destination"),
    waypoints: parsed.searchParams.get("waypoints")?.split("|") ?? [],
    mode: parsed.searchParams.get("travelmode"),
  };
}

describe("link da rota no Google Maps", () => {
  it("não existe sem parada com coordenadas", () => {
    expect(buildRouteLink([])).toBeNull();
  });

  it("com uma parada só, leva até ela", () => {
    const link = buildRouteLink(stops(1));

    expect(link?.isPartial).toBe(false);
    expect(read(link?.url ?? "")).toMatchObject({ origin: null, destination: "-22,-43.1", waypoints: [] });
  });

  it("com duas paradas vai do encontro ao destino, de moto", () => {
    const link = buildRouteLink(stops(2));

    expect(read(link?.url ?? "")).toEqual({
      base: "https://www.google.com/maps/dir/",
      origin: "-22,-43.1",
      destination: "-22.01,-43.1",
      waypoints: [],
      mode: "two-wheeler",
    });
    expect(link?.isPartial).toBe(false);
  });

  it("leva as paradas intermediárias na ordem", () => {
    const link = buildRouteLink(stops(9));
    const route = read(link?.url ?? "");

    expect(route.origin).toBe("-22,-43.1");
    expect(route.destination).toBe("-22.08,-43.1");
    expect(route.waypoints).toEqual([
      "-22.01,-43.1",
      "-22.02,-43.1",
      "-22.03,-43.1",
      "-22.04,-43.1",
      "-22.05,-43.1",
      "-22.06,-43.1",
      "-22.07,-43.1",
    ]);
    expect(link?.isPartial).toBe(false);
  });

  it("além do limite fica com encontro, destino e as primeiras intermediárias, e avisa", () => {
    const link = buildRouteLink(stops(12));
    const route = read(link?.url ?? "");

    expect(route.origin).toBe("-22,-43.1");
    expect(route.destination).toBe("-22.11,-43.1");
    expect(route.waypoints).toHaveLength(MAX_ROUTE_WAYPOINTS);
    expect(route.waypoints.at(0)).toBe("-22.01,-43.1");
    expect(route.waypoints.at(-1)).toBe("-22.09,-43.1");
    expect(link?.isPartial).toBe(true);
    expect(link?.url.length).toBeLessThanOrEqual(2048);
  });

  it("arredonda as coordenadas para o endereço não crescer à toa", () => {
    const link = buildRouteLink([
      { lat: -22.123456789, lon: -43.987654321 },
      { lat: -22.5, lon: -43.25 },
    ]);

    expect(read(link?.url ?? "").origin).toBe("-22.123457,-43.987654");
  });
});

describe("links de uma parada", () => {
  it("abre o ponto no Google Maps e no Waze", () => {
    const links = buildPointLinks({ lat: -22.5112, lon: -43.1779 });

    expect(links.maps).toBe("https://www.google.com/maps/search/?api=1&query=-22.5112%2C-43.1779");
    expect(links.waze).toBe("https://waze.com/ul?ll=-22.5112%2C-43.1779&navigate=yes");
  });
});
