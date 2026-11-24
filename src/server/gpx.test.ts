import { describe, expect, it } from "vitest";

import { lineKm, MAX_TRACK_POINTS, readGpx, simplifyLine, type TrackLine } from "@/server/gpx";
import { decodePolyline6, encodePolyline6 } from "@/server/polyline";

const wrap = (body: string) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="teste" xmlns="http://www.topografix.com/GPX/1/1">${body}</gpx>`;

describe("ler um GPX", () => {
  it("lê os pontos de uma trilha, na ordem, como longitude e latitude", () => {
    const gpx = wrap(`<trk><name>Serra</name><trkseg>
      <trkpt lat="-22.50" lon="-43.20"><ele>10</ele></trkpt>
      <trkpt lon='-43.10' lat='-22.40'/>
    </trkseg></trk>`);

    expect(readGpx(gpx)).toEqual({
      ok: true,
      line: [
        [-43.2, -22.5],
        [-43.1, -22.4],
      ],
      km: 15,
    });
  });

  it("usa a rota planejada quando o arquivo não tem trilha", () => {
    const gpx = wrap(`<rte><rtept lat="-22.0" lon="-43.0"/><rtept lat="-23.0" lon="-43.0"/></rte>`);
    const reading = readGpx(gpx);

    // One degree of latitude is 111 km anywhere on Earth.
    expect(reading).toMatchObject({ ok: true, km: 111 });
  });

  it("prefere a trilha gravada à rota planejada", () => {
    const gpx = wrap(`<rte><rtept lat="0" lon="0"/><rtept lat="1" lon="0"/></rte>
      <trk><trkseg><trkpt lat="-22.0" lon="-43.0"/><trkpt lat="-22.1" lon="-43.0"/></trkseg></trk>`);

    expect(readGpx(gpx)).toMatchObject({ ok: true, line: [[-43, -22], [-43, -22.1]] });
  });

  it("lê arquivo em que as marcas vêm com prefixo", () => {
    const gpx = `<gpx:gpx xmlns:gpx="http://www.topografix.com/GPX/1/1"><gpx:trk><gpx:trkseg>
      <gpx:trkpt lat="-22.0" lon="-43.0"/><gpx:trkpt lat="-22.1" lon="-43.0"/>
    </gpx:trkseg></gpx:trk></gpx:gpx>`;

    expect(readGpx(gpx)).toMatchObject({ ok: true, line: [[-43, -22], [-43, -22.1]] });
  });

  it("ignora o que está em comentário", () => {
    const gpx = wrap(`<!-- <trk><trkseg><trkpt lat="0" lon="0"/></trkseg></trk> -->
      <rte><rtept lat="-22.0" lon="-43.0"/><rtept lat="-22.1" lon="-43.0"/></rte>`);

    expect(readGpx(gpx)).toMatchObject({ ok: true, line: [[-43, -22], [-43, -22.1]] });
  });

  it("junta os trechos de uma trilha gravada em partes", () => {
    const gpx = wrap(`<trk><trkseg><trkpt lat="-22.0" lon="-43.0"/><trkpt lat="-22.1" lon="-43.0"/></trkseg>
      <trkseg><trkpt lat="-22.2" lon="-43.0"/></trkseg></trk>`);
    const reading = readGpx(gpx);

    expect(reading.ok && reading.line).toHaveLength(3);
  });

  it.each([
    ["texto qualquer", "isto não é um gpx"],
    ["outro XML", "<kml><Placemark/></kml>"],
    ["coordenada que não é número", wrap(`<trk><trkseg><trkpt lat="abc" lon="-43"/><trkpt lat="-22" lon="-43"/></trkseg></trk>`)],
    ["ponto sem longitude", wrap(`<trk><trkseg><trkpt lat="-22"/><trkpt lat="-22" lon="-43"/></trkseg></trk>`)],
    ["coordenada fora da Terra", wrap(`<trk><trkseg><trkpt lat="-122" lon="-43"/><trkpt lat="-22" lon="-43"/></trkseg></trk>`)],
  ])("recusa como malformado: %s", (_case, gpx) => {
    expect(readGpx(gpx)).toEqual({ ok: false, reason: "MALFORMED" });
  });

  it.each([
    ["sem pontos", wrap("<trk><name>Vazio</name><trkseg></trkseg></trk>")],
    ["um ponto só", wrap(`<wpt lat="-22" lon="-43"/><trk><trkseg><trkpt lat="-22" lon="-43"/></trkseg></trk>`)],
    ["só pontos de interesse", wrap(`<wpt lat="-22" lon="-43"/><wpt lat="-22.1" lon="-43"/>`)],
  ])("recusa como vazio: %s", (_case, gpx) => {
    expect(readGpx(gpx)).toEqual({ ok: false, reason: "EMPTY" });
  });
});

describe("simplificar o traçado", () => {
  it("deixa como está um traçado que já cabe no limite", () => {
    const line: TrackLine = [[-43, -22], [-43.05, -22.03], [-43.1, -22]];

    expect(simplifyLine(line)).toEqual(line);
  });

  it("tira os pontos de uma reta e guarda as curvas e as pontas", () => {
    // 20,000 points along two straight legs that meet at a corner.
    const corner = 10_000;
    const line: TrackLine = Array.from({ length: 20_001 }, (_unused, index) =>
      index <= corner ? [-43 + index * 1e-5, -22] : [-43 + corner * 1e-5, -22 + (index - corner) * 1e-5],
    );
    const simplified = simplifyLine(line);

    expect(simplified.length).toBeLessThanOrEqual(MAX_TRACK_POINTS);
    expect(simplified.at(0)).toEqual(line[0]);
    expect(simplified.at(-1)).toEqual(line[20_000]);
    expect(simplified).toContainEqual(line[corner]);
    expect(lineKm(simplified)).toBeCloseTo(lineKm(line), 3);
  });

  it("mantém a forma de uma estrada sinuosa longa dentro do limite", () => {
    // 60,000 points of a winding road: bends of about 500 m, ten along the way.
    const line: TrackLine = Array.from({ length: 60_000 }, (_unused, index) => [
      -43 + index * 1e-5,
      -22 + 0.005 * Math.sin(index / 1000),
    ]);
    const simplified = simplifyLine(line);

    expect(simplified.length).toBeLessThanOrEqual(MAX_TRACK_POINTS);
    // Dropping points can only cut corners; a road that keeps its shape loses almost no length.
    expect(lineKm(simplified) / lineKm(line)).toBeGreaterThan(0.999);
  });
});

describe("guardar o traçado", () => {
  it("codifica a linha de um jeito que o mapa lê de volta", () => {
    const line: TrackLine = [[-43.315593, -22.787282], [-43.283146, -22.592229], [-43.177693, -22.500923]];

    expect(decodePolyline6(encodePolyline6(line))).toEqual(line);
  });
});
