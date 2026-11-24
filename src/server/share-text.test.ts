import { describe, expect, it } from "vitest";

import { buildBatchShareText, buildRideShareText } from "@/server/share-text";

const origin = "https://scramblerrj.example";

const ride = {
  id: "ride1",
  route: "Serra de Petrópolis",
  meetingPoint: "Posto BR da Washington Luís",
  startsAt: new Date("2026-11-22T10:00:00.000Z"),
  returnsAt: new Date("2026-11-22T19:30:00.000Z"),
  mapUrl: "https://maps.app.goo.gl/abc",
};

describe("resumo para divulgar", () => {
  it("monta o resumo da campanha com preço, cores, tamanhos e o link direto", () => {
    const text = buildBatchShareText(
      {
        id: "batch1",
        model: "Camiseta Mirante",
        unitPriceCents: 8000,
        sizes: ["M", "G"],
        colors: [{ name: "Preta" }, { name: "Creme" }],
      },
      origin,
    );

    expect(text.split("\n")).toEqual([
      "*Camiseta Mirante* · campanha de vestuário aberta no Scrambler RJ",
      "R$ 80,00 por peça",
      "Cores: Preta, Creme",
      "Tamanhos: M, G",
      "Pede por aqui: https://scramblerrj.example/vestuario/batch1",
    ]);
  });

  it("monta o resumo do passeio com data, horários no fuso do Rio, encontro, mapa e link", () => {
    expect(buildRideShareText(ride, origin).split("\n")).toEqual([
      "*Serra de Petrópolis* · passeio do Scrambler RJ",
      "dom 22 nov · saída 7h · retorno previsto 16h30",
      "Encontro: Posto BR da Washington Luís",
      "Mapa: https://maps.app.goo.gl/abc",
      "Diz se vai por aqui: https://scramblerrj.example/passeios/ride1",
    ]);
  });

  it("inclui horário de encontro, distância e tempo de moto quando o passeio tem ficha", () => {
    const text = buildRideShareText(
      { ...ride, meetsAt: new Date("2026-11-22T09:30:00.000Z"), distanceKm: 142, rideMinutes: 200 },
      origin,
    );

    expect(text.split("\n")).toEqual([
      "*Serra de Petrópolis* · passeio do Scrambler RJ",
      "dom 22 nov · saída 7h · retorno previsto 16h30",
      "Encontro às 6h30: Posto BR da Washington Luís",
      "142 km · 3h20 de moto",
      "Mapa: https://maps.app.goo.gl/abc",
      "Diz se vai por aqui: https://scramblerrj.example/passeios/ride1",
    ]);
  });

  it("deixa a linha do mapa de fora quando o passeio não tem link", () => {
    const text = buildRideShareText({ ...ride, mapUrl: null }, origin);

    expect(text).not.toContain("Mapa:");
    expect(text.split("\n")).toHaveLength(4);
  });

  it("não usa os termos que o grupo evita", () => {
    const text = buildRideShareText(ride, origin).toLowerCase();

    expect(text).not.toMatch(/clube/);
  });
});
