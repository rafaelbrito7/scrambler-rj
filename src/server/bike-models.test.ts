import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";

import { matchBikeModel, resolveBike } from "@/server/bike-models";
import { INITIAL_BIKE_MODELS } from "@/server/initial-bike-models";

const models = INITIAL_BIKE_MODELS.map((model, index) => ({ ...model, id: `modelo-${index}` }));

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
    expect(matchBikeModel(models, text)?.name).toBe(name);
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
    expect(matchBikeModel(models, text)).toBeNull();
  });

  it("dá a cada modelo da lista a própria cilindrada, ignorando a digitada", () => {
    for (const model of models) {
      expect(resolveBike(models, model.name, "9999")).toEqual({
        model: model.name,
        engineSize: String(model.engineSize),
        listedModelId: model.id,
      });
    }
  });

  it("mantém o que foi digitado quando o modelo não está na lista", () => {
    expect(resolveBike(models, " Speed Twin 900 ", " 900 ")).toEqual({
      model: "Speed Twin 900",
      engineSize: "900",
      listedModelId: null,
    });
  });

  it("texto vazio não é modelo nenhum, mesmo com um nome na lista que se reduz a nada", () => {
    const withNoise = [...models, { id: "ruido", name: "Triumph CC", engineSize: 900 }];

    expect(matchBikeModel(withNoise, "")).toBeNull();
    expect(matchBikeModel(withNoise, "  -- ")).toBeNull();
  });

  it("a lista com que os testes começam é a que a migração grava", () => {
    const migration = readFileSync("prisma/migrations/20261124100000_bike_models_table/migration.sql", "utf8");
    const written = [...migration.matchAll(/\('bikemodel_[a-z0-9_]+', '([^']+)', (\d+), (\d+)\)/g)]
      .toSorted((a, b) => Number(a[3]) - Number(b[3]))
      .map(([, name, engineSize]) => ({ name, engineSize: Number(engineSize) }));

    expect(written).toEqual(INITIAL_BIKE_MODELS);
  });

  it("não escolhe quando dois modelos da lista respondem pela mesma grafia", () => {
    const twins = [
      { id: "a", name: "Scrambler 900", engineSize: 900 },
      { id: "b", name: "Scrambler-900", engineSize: 900 },
    ];

    expect(matchBikeModel(twins, "scrambler 900")).toBeNull();
  });
});
