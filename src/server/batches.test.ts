import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { createAccessService } from "@/server/access";
import { BatchError, type BatchInput, createBatchService } from "@/server/batches";
import { connectTestDatabase, resetDatabase } from "@/server/test-database";

const db = connectTestDatabase();
const access = createAccessService(db, { adminEmails: ["chefe@exemplo.com"] });
const batches = createBatchService(db, access);

const profile = {
  fullName: "Bruna Tavares",
  whatsapp: "(21) 98888-7777",
  bikeModel: "Scrambler 900",
  engineSize: "900",
};

const shirt: BatchInput = {
  model: "Camiseta Mirante",
  unitPrice: "80,00",
  sizes: ["M", "G"],
  colors: [
    { name: "Preta", photoKey: "preta.webp" },
    { name: "Creme", photoKey: "creme.webp" },
  ],
};

async function createUser(email: string) {
  return db.user.create({ data: { email, name: email.split("@")[0] } });
}

async function createAdmin() {
  const admin = await createUser("chefe@exemplo.com");

  await access.submitJoinRequest(admin.id, profile);

  return admin;
}

async function createRequester(email: string) {
  const user = await createUser(email);
  const request = await access.submitJoinRequest(user.id, profile);

  return { user, request };
}

async function createParticipant(adminId: string, email: string) {
  const { user, request } = await createRequester(email);

  await access.decide(adminId, request.id, "approve");

  return user;
}

async function expectInvalid(action: Promise<unknown>, field: string) {
  await expect(action).rejects.toMatchObject({
    name: "BatchError",
    code: "INVALID_INPUT",
    fieldErrors: { [field]: expect.any(String) },
  });
}

async function expectBatchError(action: Promise<unknown>, code: BatchError["code"]) {
  await expect(action).rejects.toMatchObject({ name: "BatchError", code });
}

beforeEach(async () => {
  await resetDatabase(db);
});

afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

describe("abrir campanha", () => {
  it("abre a campanha e a mostra nas campanhas ativas de um rider aprovado", async () => {
    const admin = await createAdmin();
    const participant = await createParticipant(admin.id, "ana@exemplo.com");

    const opened = await batches.openBatch(admin.id, shirt);
    const active = await batches.listActive(participant.id);

    expect(active).toHaveLength(1);
    expect(active[0]).toMatchObject({
      id: opened.id,
      model: "Camiseta Mirante",
      unitPriceCents: 8000,
      sizes: ["M", "G"],
      status: "OPEN",
    });
    expect(active[0].colors.map((color) => [color.name, color.photoKey])).toEqual([
      ["Preta", "preta.webp"],
      ["Creme", "creme.webp"],
    ]);
  });

  it("lista várias campanhas abertas, do mais recente ao mais antigo", async () => {
    const admin = await createAdmin();

    await batches.openBatch(admin.id, shirt);
    await batches.openBatch(admin.id, { ...shirt, model: "Moletom Serra" });

    const models = (await batches.listActive(admin.id)).map((batch) => batch.model);

    expect(models).toEqual(["Moletom Serra", "Camiseta Mirante"]);
  });

  it.each([
    ["80", 8000],
    ["R$ 79,9", 7990],
    ["120.50", 12050],
    ["1.250,00", 125000],
  ])("guarda o preço %s como %i centavos", async (unitPrice, cents) => {
    const admin = await createAdmin();

    const opened = await batches.openBatch(admin.id, { ...shirt, unitPrice });

    expect(opened.unitPriceCents).toBe(cents);
  });

  it("recusa preço ausente, zerado ou que não é valor em reais", async () => {
    const admin = await createAdmin();

    for (const unitPrice of ["", "0", "abc", "80,123", "-5"]) {
      await expectInvalid(batches.openBatch(admin.id, { ...shirt, unitPrice }), "unitPrice");
    }
  });

  it("recusa campanha sem modelo ou sem tamanho", async () => {
    const admin = await createAdmin();

    await expectInvalid(batches.openBatch(admin.id, { ...shirt, model: " " }), "model");
    await expectInvalid(batches.openBatch(admin.id, { ...shirt, sizes: [] }), "sizes");
  });

  it("recusa campanha sem cor, com cor sem foto ou com cor repetida", async () => {
    const admin = await createAdmin();
    const withoutPhoto = [shirt.colors[0], { name: "Creme", photoKey: null }];
    const repeated = [shirt.colors[0], { name: " preta ", photoKey: "outra.webp" }];

    await expectInvalid(batches.openBatch(admin.id, { ...shirt, colors: [] }), "colors");
    await expectInvalid(batches.openBatch(admin.id, { ...shirt, colors: withoutPhoto }), "colors");
    await expectInvalid(batches.openBatch(admin.id, { ...shirt, colors: repeated }), "colors");
    expect(await batches.listActive(admin.id)).toEqual([]);
  });

  it("não deixa rider abrir campanha nem ver a lista administrativa", async () => {
    const admin = await createAdmin();
    const participant = await createParticipant(admin.id, "ana@exemplo.com");

    await expectBatchError(batches.openBatch(participant.id, shirt), "FORBIDDEN");
    await expectBatchError(batches.listAll(participant.id), "FORBIDDEN");
    expect(await batches.listActive(admin.id)).toEqual([]);
  });
});

describe("ver campanha", () => {
  it("mostra a campanha a um rider aprovado", async () => {
    const admin = await createAdmin();
    const participant = await createParticipant(admin.id, "ana@exemplo.com");
    const opened = await batches.openBatch(admin.id, shirt);

    expect(await batches.getBatch(participant.id, opened.id)).toMatchObject({
      model: "Camiseta Mirante",
    });
    await expectBatchError(batches.getBatch(participant.id, "inexistente"), "NOT_FOUND");
  });

  it("esconde as campanhas de quem está em avaliação ou foi reprovado", async () => {
    const admin = await createAdmin();
    const opened = await batches.openBatch(admin.id, shirt);
    const pending = await createRequester("espera@exemplo.com");
    const rejected = await createRequester("negado@exemplo.com");
    const stranger = await createUser("novo@exemplo.com");

    await access.decide(admin.id, rejected.request.id, "reject");

    for (const user of [pending.user, rejected.user, stranger]) {
      await expectBatchError(batches.listActive(user.id), "FORBIDDEN");
      await expectBatchError(batches.getBatch(user.id, opened.id), "FORBIDDEN");
    }
  });
});

describe("pedir a volta de uma peça", () => {
  async function setup() {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com");
    const bia = await createParticipant(admin.id, "bia@exemplo.com");
    const closed = await batches.openBatch(admin.id, shirt);

    await batches.closeBatch(admin.id, closed.id);

    return { admin, ana, bia, closed };
  }

  async function entryOf(viewerId: string, batchId: string) {
    return (await batches.listCatalog(viewerId)).find((entry) => entry.batch.id === batchId);
  }

  it("mostra a todos quem quer a peça de volta, e a pessoa pode desfazer", async () => {
    const { ana, bia, closed } = await setup();

    await batches.setComeback(ana.id, closed.id, true);
    await batches.setComeback(ana.id, closed.id, true);

    const seenByBia = await entryOf(bia.id, closed.id);

    expect(seenByBia?.wanted.people.map((person) => person.userId)).toEqual([ana.id]);
    expect(seenByBia?.wanted.mine).toBe(false);
    expect((await entryOf(ana.id, closed.id))?.wanted.mine).toBe(true);

    await batches.setComeback(ana.id, closed.id, false);

    expect((await entryOf(bia.id, closed.id))?.wanted.people).toEqual([]);
  });

  it("só aceita pedido de volta em campanha fechada, de quem está no grupo", async () => {
    const { admin, ana, closed } = await setup();
    const open = await batches.openBatch(admin.id, { ...shirt, model: "Jaqueta" });
    const { user: outsider } = await createRequester("fora@exemplo.com");

    await expectBatchError(batches.setComeback(ana.id, open.id, true), "NOT_REQUESTABLE");
    await expectBatchError(batches.setComeback(outsider.id, closed.id, true), "FORBIDDEN");
    await expectBatchError(batches.setComeback(ana.id, "nao-existe", true), "NOT_FOUND");
    expect((await entryOf(ana.id, open.id))?.canRequest).toBe(false);
  });

  it("abrir a campanha nova atende os pedidos e continua a mesma peça", async () => {
    const { admin, ana, bia, closed } = await setup();

    await batches.setComeback(ana.id, closed.id, true);
    await batches.setComeback(bia.id, closed.id, true);

    const revival = await batches.openBatch(admin.id, shirt, closed.id);
    const catalog = await batches.listCatalog(ana.id);

    expect(catalog.map((entry) => entry.batch.id)).toEqual([revival.id]);
    expect(catalog[0]).toMatchObject({ campaignCount: 2, canRequest: false });
    expect(await db.batchComeback.count()).toBe(0);
    expect((await batches.getBatch(ana.id, closed.id)).status).toBe("CLOSED");
    await expectBatchError(batches.setComeback(ana.id, closed.id, true), "NOT_REQUESTABLE");

    await batches.closeBatch(admin.id, revival.id);
    await batches.setComeback(ana.id, revival.id, true);

    expect((await entryOf(bia.id, revival.id))?.wanted.people).toHaveLength(1);
  });

  it("não traz de volta uma campanha que não está fechada", async () => {
    const { admin } = await setup();
    const open = await batches.openBatch(admin.id, { ...shirt, model: "Jaqueta" });

    await expectBatchError(batches.openBatch(admin.id, shirt, open.id), "INVALID_STATE");
    await expectBatchError(batches.openBatch(admin.id, shirt, "nao-existe"), "NOT_FOUND");
  });

  it("deixa campanha cancelada fora do que já tivemos", async () => {
    const { admin, ana, closed } = await setup();

    await batches.cancelBatch(admin.id, closed.id);

    expect(await batches.listCatalog(ana.id)).toEqual([]);
  });
});
