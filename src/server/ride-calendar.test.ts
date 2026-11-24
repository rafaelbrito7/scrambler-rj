import { describe, expect, it } from "vitest";

import { buildRideCalendar } from "@/server/ride-calendar";

const ride = {
  id: "ride1",
  route: "Serra de Petrópolis",
  meetingPoint: "Posto Shell, Duque de Caxias",
  startsAt: new Date("2026-12-12T10:30:00.000Z"),
  returnsAt: new Date("2026-12-12T18:30:00.000Z"),
  meetsAt: new Date("2026-12-12T10:00:00.000Z"),
  distanceKm: 142,
};
const origin = "https://scramblerrj.example";
const now = new Date("2026-11-17T12:00:00.000Z");

function unfolded(calendar: string) {
  return calendar.replace(/\r\n /g, "").trimEnd().split("\r\n");
}

describe("arquivo de agenda do passeio", () => {
  it("começa no encontro e termina no retorno, com local, distância e o link do passeio", () => {
    expect(unfolded(buildRideCalendar(ride, origin, now))).toEqual([
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Scrambler RJ//Passeios//PT-BR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:passeio-ride1@scramblerrj",
      "DTSTAMP:20261117T120000Z",
      "DTSTART:20261212T100000Z",
      "DTEND:20261212T183000Z",
      "SUMMARY:Serra de Petrópolis · Scrambler RJ",
      "LOCATION:Posto Shell\\, Duque de Caxias",
      "DESCRIPTION:142 km. Detalhes e presença: https://scramblerrj.example/passeios/ride1",
      "URL:https://scramblerrj.example/passeios/ride1",
      "END:VEVENT",
      "END:VCALENDAR",
    ]);
  });

  it("começa na saída quando não há horário de encontro e omite a distância que não existe", () => {
    const lines = unfolded(buildRideCalendar({ ...ride, meetsAt: null, distanceKm: null }, origin, now));

    expect(lines).toContain("DTSTART:20261212T103000Z");
    expect(lines).toContain("DESCRIPTION:Detalhes e presença: https://scramblerrj.example/passeios/ride1");
  });

  it("escapa vírgula, ponto e vírgula e barra, e não deixa linha passar de 75 octetos", () => {
    const calendar = buildRideCalendar(
      { ...ride, route: "Serra; café, mirante \\ volta pela BR-040 com parada longa em Itaipava e Araras" },
      origin,
      now,
    );

    expect(unfolded(calendar)).toContain(
      "SUMMARY:Serra\\; café\\, mirante \\\\ volta pela BR-040 com parada longa em Itaipava e Araras · Scrambler RJ",
    );

    for (const line of calendar.split("\r\n")) expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);
  });

  it("termina cada linha com CRLF, como os aplicativos de calendário exigem", () => {
    const calendar = buildRideCalendar(ride, origin, now);

    expect(calendar.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(calendar.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
  });
});
