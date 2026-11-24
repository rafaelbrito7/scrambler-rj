import { describe, expect, it } from "vitest";

import { BIKE_MODELS, matchBikeModel, resolveBike } from "@/server/bike-models";

describe("modelo da moto por lista", () => {
  it.each([
    ["Scrambler 900", "Scrambler 900"],
    ["scrambler 900cc", "Scrambler 900"],
    ["Triumph Scrambler 900", "Scrambler 900"],
    ["  SCRAMBLER   1200 xe ", "Scrambler 1200 XE"],
    ["Scrambler 1200XE", "Scrambler 1200 XE"],
    ["Scrambler 400 X", "Scrambler 400 X"],
    ["Scrambler 400x 400cc", "Scrambler 400 X"],
    ["Scrambler 400 XC", "Scrambler 400 XC"],
    ["street scrambler", "Street Scrambler"],
    ["Triumph Street Scrambler 900", "Street Scrambler"],
    ["Scrambler 865", "Scrambler 865"],
  ])("reconhece %s como %s", (text, name) => {
    expect(matchBikeModel(text)?.name).toBe(name);
  });

  it.each([
    "Scrambler 1200",
    "Scrambler 400",
    "Scrambler",
    "Scrambler 900 Chrome Edition",
    "Speed Twin 900",
    "Bonneville T120",
    "",
  ])("deixa %s fora da lista, por ser ambíguo ou outro modelo", (text) => {
    expect(matchBikeModel(text)).toBeNull();
  });

  it("dá a cada modelo da lista a própria cilindrada, ignorando a digitada", () => {
    for (const model of BIKE_MODELS) {
      expect(resolveBike(model.name, "9999")).toEqual({
        model: model.name,
        engineSize: String(model.engineSize),
        isListed: true,
      });
    }
  });

  it("mantém o que foi digitado quando o modelo não está na lista", () => {
    expect(resolveBike(" Speed Twin 900 ", " 900 ")).toEqual({
      model: "Speed Twin 900",
      engineSize: "900",
      isListed: false,
    });
  });
});
