import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { createAccessService } from "@/server/access";
import { createBikeModelService } from "@/server/bike-model-list";
import type { PhotoStorage } from "@/server/photo-storage";
import { createProfileService } from "@/server/profiles";
import { connectTestDatabase, resetDatabase } from "@/server/test-database";

const db = connectTestDatabase();
const access = createAccessService(db, { adminEmails: ["chefe@exemplo.com"] });
const noPhotos: PhotoStorage = {
  save: async () => "foto.jpg",
  read: async () => null,
  remove: async () => {},
};
const profiles = createProfileService(db, access, noPhotos);
const bikeModels = createBikeModelService(db, access);

const person = { fullName: "Ana Reis", whatsapp: "(21) 98888-7777" };
const blankBike = { model: "", engineSize: "", year: "", color: "", nickname: "", rangeKm: "" };

async function createAdmin() {
  const admin = await db.user.create({ data: { email: "chefe@exemplo.com" } });

  await access.submitJoinRequest(admin.id, { ...person, fullName: "Chefe Lima", bikeModel: "Scrambler 1200 XE", engineSize: "" });

  return admin;
}

async function createRider(adminId: string, email: string, bikeModel: string, engineSize = "") {
  const user = await db.user.create({ data: { email } });
  const request = await access.submitJoinRequest(user.id, { ...person, bikeModel, engineSize });

  await access.decide(adminId, request.id, "approve");

  return user;
}

async function bikesOf(userId: string) {
  return (await profiles.getOwnProfile(userId)).bikes.map((bike) => `${bike.model} ${bike.engineSize}`);
}

async function offered() {
  return (await bikeModels.listOffered()).map((model) => model.name);
}

async function idOf(adminId: string, name: string) {
  const model = (await bikeModels.listAll(adminId)).find((candidate) => candidate.name === name);

  if (!model) throw new Error(`modelo ausente: ${name}`);

  return model.id;
}

async function expectModelError(action: Promise<unknown>, code: string) {
  await expect(action).rejects.toMatchObject({ name: "BikeModelError", code });
}

beforeEach(async () => {
  await resetDatabase(db);
});

afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

describe("lista de modelos no banco", () => {
  it("começa com os oito modelos, na ordem, para quem ainda nem pediu ingresso", async () => {
    expect(await offered()).toEqual([
      "Scrambler 400 X",
      "Scrambler 400 XC",
      "Scrambler 900",
      "Street Scrambler",
      "Scrambler 1200 X",
      "Scrambler 1200 XC",
      "Scrambler 1200 XE",
      "Scrambler 865",
    ]);
  });

  it("só administrador mantém a lista", async () => {
    const admin = await createAdmin();
    const ana = await createRider(admin.id, "ana@exemplo.com", "Scrambler 900");
    const id = await idOf(admin.id, "Scrambler 900");

    await expectModelError(bikeModels.listAll(ana.id), "FORBIDDEN");
    await expectModelError(bikeModels.addModel(ana.id, { name: "Scrambler 1200 RX", engineSize: "1200" }), "FORBIDDEN");
    await expectModelError(bikeModels.updateModel(ana.id, id, { name: "Outra", engineSize: "900" }), "FORBIDDEN");
    await expectModelError(bikeModels.setModelActive(ana.id, id, false), "FORBIDDEN");
    await expectModelError(bikeModels.moveModel(ana.id, id, "up"), "FORBIDDEN");
  });

  it("inclui um modelo no fim da lista, e ele já serve no pedido de ingresso e no perfil", async () => {
    const admin = await createAdmin();

    await bikeModels.addModel(admin.id, { name: " Scrambler 1200 RX ", engineSize: "1200" });

    expect((await offered()).at(-1)).toBe("Scrambler 1200 RX");

    const ana = await createRider(admin.id, "ana@exemplo.com", "triumph scrambler 1200rx", "999");

    await profiles.addBike(ana.id, { ...blankBike, model: "Scrambler 1200 RX" });

    expect(await bikesOf(ana.id)).toEqual(["Scrambler 1200 RX 1200", "Scrambler 1200 RX 1200"]);
  });

  it("recusa nome ou cilindrada inválidos e modelo que se confunde com outro da lista", async () => {
    const admin = await createAdmin();
    const id = await idOf(admin.id, "Scrambler 865");

    await expectModelError(bikeModels.addModel(admin.id, { name: "X", engineSize: "900" }), "INVALID_INPUT");
    await expectModelError(bikeModels.addModel(admin.id, { name: "Scrambler 1200 RX", engineSize: "mil" }), "INVALID_INPUT");
    await expectModelError(bikeModels.addModel(admin.id, { name: "scrambler 900cc", engineSize: "900" }), "DUPLICATE");
    await expectModelError(bikeModels.updateModel(admin.id, id, { name: "Street-Scrambler", engineSize: "900" }), "DUPLICATE");
    await expectModelError(bikeModels.updateModel(admin.id, "nao-existe", { name: "Outra", engineSize: "900" }), "NOT_FOUND");
    expect(await offered()).toHaveLength(8);
  });

  it("renomear ou corrigir a cilindrada muda as motos que usam o modelo, e só elas", async () => {
    const admin = await createAdmin();
    const ana = await createRider(admin.id, "ana@exemplo.com", "Scrambler 900");
    const bia = await createRider(admin.id, "bia@exemplo.com", "Speed Twin 900", "900");

    await bikeModels.updateModel(admin.id, await idOf(admin.id, "Scrambler 900"), {
      name: "Scrambler 900 (2023 em diante)",
      engineSize: "901",
    });

    expect(await bikesOf(ana.id)).toEqual(["Scrambler 900 (2023 em diante) 901"]);
    expect(await bikesOf(bia.id)).toEqual(["Speed Twin 900 900"]);
    expect(await bikesOf(admin.id)).toEqual(["Scrambler 1200 XE 1200"]);
  });

  it("modelo desativado sai da escolha, fica nas motos que o usam e volta ao reativar", async () => {
    const admin = await createAdmin();
    const ana = await createRider(admin.id, "ana@exemplo.com", "Scrambler 865");
    const id = await idOf(admin.id, "Scrambler 865");

    await bikeModels.setModelActive(admin.id, id, false);

    expect(await offered()).not.toContain("Scrambler 865");
    expect((await bikeModels.listAll(admin.id)).map((model) => model.name)).toContain("Scrambler 865");
    expect(await bikesOf(ana.id)).toEqual(["Scrambler 865 865"]);

    // Off the list, the name is just text: it needs its engine size typed, like any other.
    await expect(profiles.addBike(ana.id, { ...blankBike, model: "Scrambler 865" })).rejects.toMatchObject({
      code: "INVALID_INPUT",
    });

    await bikeModels.setModelActive(admin.id, id, true);

    expect(await offered()).toContain("Scrambler 865");
  });

  it("a moto que já usa um modelo desativado continua ligada a ele ao ser editada", async () => {
    const admin = await createAdmin();
    const ana = await createRider(admin.id, "ana@exemplo.com", "Scrambler 865");
    const id = await idOf(admin.id, "Scrambler 865");
    const [bike] = (await profiles.getOwnProfile(ana.id)).bikes;

    await bikeModels.setModelActive(admin.id, id, false);

    expect((await bikeModels.listOffered(bike.id)).map((model) => model.name)).toContain("Scrambler 865");

    await profiles.updateBike(ana.id, bike.id, { ...blankBike, model: "Scrambler 865", color: "Verde" });
    await bikeModels.updateModel(admin.id, id, { name: "Scrambler 865 (carburada)", engineSize: "865" });

    expect(await bikesOf(ana.id)).toEqual(["Scrambler 865 (carburada) 865"]);
  });

  it("reordena um modelo com o vizinho", async () => {
    const admin = await createAdmin();

    await bikeModels.moveModel(admin.id, await idOf(admin.id, "Scrambler 865"), "up");
    await bikeModels.moveModel(admin.id, await idOf(admin.id, "Scrambler 400 X"), "down");
    await bikeModels.moveModel(admin.id, await idOf(admin.id, "Scrambler 400 XC"), "up");

    expect(await offered()).toEqual([
      "Scrambler 400 XC",
      "Scrambler 400 X",
      "Scrambler 900",
      "Street Scrambler",
      "Scrambler 1200 X",
      "Scrambler 1200 XC",
      "Scrambler 865",
      "Scrambler 1200 XE",
    ]);
  });
});
