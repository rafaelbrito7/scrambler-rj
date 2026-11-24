import { describe, expect, it } from "vitest";

import { decodePolyline6 } from "@/server/polyline";

function encode(points: [number, number][]) {
  let lastLat = 0;
  let lastLon = 0;
  let text = "";

  function write(value: number) {
    let shifted = value < 0 ? ~(value << 1) : value << 1;

    while (shifted >= 0x20) {
      text += String.fromCharCode((0x20 | (shifted & 0x1f)) + 63);
      shifted >>= 5;
    }

    text += String.fromCharCode(shifted + 63);
  }

  for (const [lon, lat] of points) {
    const latE6 = Math.round(lat * 1e6);
    const lonE6 = Math.round(lon * 1e6);

    write(latE6 - lastLat);
    write(lonE6 - lastLon);
    lastLat = latE6;
    lastLon = lonE6;
  }

  return text;
}

describe("traçado compactado da rota", () => {
  it("devolve os pontos na ordem longitude, latitude, com seis casas", () => {
    const route: [number, number][] = [
      [-43.3117, -22.7858],
      [-43.1779, -22.5112],
      [-43.1336, -22.3936],
    ];

    expect(decodePolyline6(encode(route))).toEqual(route);
  });

  it("devolve lista vazia para um traçado vazio", () => {
    expect(decodePolyline6("")).toEqual([]);
  });
});
