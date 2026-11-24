import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { createAccessService } from "@/server/access";
import { type BatchSummary, createBatchService } from "@/server/batches";
import { createOrderService, OrderError } from "@/server/orders";
import { connectTestDatabase, resetDatabase } from "@/server/test-database";

const db = connectTestDatabase();
const access = createAccessService(db, { adminEmails: ["chefe@exemplo.com"] });
const batches = createBatchService(db, access);
const orders = createOrderService(db, access);

const bike = { whatsapp: "(21) 98888-7777", bikeModel: "Scrambler 900", engineSize: "900" };

async function createAdmin() {
  const admin = await db.user.create({ data: { email: "chefe@exemplo.com" } });

  await access.submitJoinRequest(admin.id, { ...bike, fullName: "Chefe Lima" });

  return admin;
}

async function createRequester(email: string, fullName: string) {
  const user = await db.user.create({ data: { email } });
  const request = await access.submitJoinRequest(user.id, { ...bike, fullName });

  return { user, request };
}

async function createParticipant(adminId: string, email: string, fullName: string) {
  const { user, request } = await createRequester(email, fullName);

  await access.decide(adminId, request.id, "approve");

  return user;
}

async function openShirtBatch(adminId: string) {
  return batches.openBatch(adminId, {
    model: "Camiseta Mirante",
    unitPrice: "80",
    sizes: ["M", "G"],
    colors: [
      { name: "Preta", photoKey: "preta.webp" },
      { name: "Creme", photoKey: "creme.webp" },
    ],
  });
}

function colorId(batch: BatchSummary, name: string) {
  const color = batch.colors.find((candidate) => candidate.name === name);

  if (!color) throw new Error(`Cor ${name} não existe na campanha de teste.`);

  return color.id;
}

async function expectOrderError(action: Promise<unknown>, code: OrderError["code"]) {
  await expect(action).rejects.toMatchObject({ name: "OrderError", code });
}

async function setup() {
  const admin = await createAdmin();
  const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");
  const batch = await openShirtBatch(admin.id);
  const black = colorId(batch, "Preta");
  const cream = colorId(batch, "Creme");

  return { admin, ana, batch, black, cream };
}

beforeEach(async () => {
  await resetDatabase(db);
});

afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

describe("fazer pedido", () => {
  it("soma 2 M e 1 G a R$ 80 em R$ 240 e mostra o pedido a outro rider", async () => {
    const { admin, ana, batch, black } = await setup();

    await orders.saveOrder(ana.id, batch.id, [
      { colorId: black, size: "M", quantity: 2 },
      { colorId: black, size: "G", quantity: 1 },
    ]);

    const [order] = await orders.listOrders(admin.id, batch.id);

    expect(order).toMatchObject({
      participantName: "Ana Reis",
      pieces: 3,
      totalCents: 24000,
      paymentStatus: "PENDING",
      isMine: false,
    });
    expect(order.items).toEqual([
      { colorId: black, colorName: "Preta", size: "M", quantity: 2 },
      { colorId: black, colorName: "Preta", size: "G", quantity: 1 },
    ]);
    expect((await orders.listOrders(ana.id, batch.id))[0].isMine).toBe(true);
  });

  it("mantém um único pedido por rider: salvar de novo substitui as combinações", async () => {
    const { ana, batch, black, cream } = await setup();

    await orders.saveOrder(ana.id, batch.id, [{ colorId: black, size: "M", quantity: 2 }]);
    await orders.saveOrder(ana.id, batch.id, [{ colorId: cream, size: "G", quantity: 1 }]);

    const list = await orders.listOrders(ana.id, batch.id);

    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ pieces: 1, totalCents: 8000 });
    expect(list[0].items).toEqual([{ colorId: cream, colorName: "Creme", size: "G", quantity: 1 }]);
  });

  it("junta combinações repetidas numa só", async () => {
    const { ana, batch, black } = await setup();

    await orders.saveOrder(ana.id, batch.id, [
      { colorId: black, size: "M", quantity: 1 },
      { colorId: black, size: "M", quantity: 2 },
    ]);

    const [order] = await orders.listOrders(ana.id, batch.id);

    expect(order.items).toEqual([{ colorId: black, colorName: "Preta", size: "M", quantity: 3 }]);
  });

  it("recusa pedido vazio, quantidade inválida, tamanho ou cor fora da campanha", async () => {
    const { admin, ana, batch, black } = await setup();
    const otherBatch = await openShirtBatch(admin.id);
    const foreignColor = colorId(otherBatch, "Preta");
    const invalid = [
      [],
      [{ colorId: black, size: "M", quantity: 0 }],
      [{ colorId: black, size: "M", quantity: 1.5 }],
      [{ colorId: black, size: "M", quantity: -1 }],
      [{ colorId: black, size: "XGG", quantity: 1 }],
      [{ colorId: foreignColor, size: "M", quantity: 1 }],
    ];

    for (const items of invalid) {
      await expectOrderError(orders.saveOrder(ana.id, batch.id, items), "INVALID_INPUT");
    }

    expect(await orders.listOrders(ana.id, batch.id)).toEqual([]);
  });

  it("recusa pedido em campanha que não está aberta ou não existe", async () => {
    const { ana, batch, black } = await setup();
    const items = [{ colorId: black, size: "M", quantity: 1 }];

    await db.batch.update({ where: { id: batch.id }, data: { status: "CLOSED" } });

    await expectOrderError(orders.saveOrder(ana.id, batch.id, items), "BATCH_NOT_OPEN");
    await expectOrderError(orders.saveOrder(ana.id, "inexistente", items), "NOT_FOUND");
  });

  it("não deixa quem não foi aprovado pedir nem ver os pedidos", async () => {
    const { ana, batch, black } = await setup();
    const { user: pending } = await createRequester("espera@exemplo.com", "Caio Sá");
    const items = [{ colorId: black, size: "M", quantity: 1 }];

    await orders.saveOrder(ana.id, batch.id, items);

    await expectOrderError(orders.saveOrder(pending.id, batch.id, items), "FORBIDDEN");
    await expectOrderError(orders.listOrders(pending.id, batch.id), "FORBIDDEN");
    await expectOrderError(orders.deleteOrder(pending.id, batch.id), "FORBIDDEN");
  });
});

describe("editar e excluir pedido", () => {
  it("exclui só o pedido de quem pede: o de outro rider continua lá", async () => {
    const { admin, ana, batch, black } = await setup();
    const bia = await createParticipant(admin.id, "bia@exemplo.com", "Bia Luz");
    const items = [{ colorId: black, size: "M", quantity: 1 }];

    await orders.saveOrder(ana.id, batch.id, items);

    await expectOrderError(orders.deleteOrder(bia.id, batch.id), "NOT_FOUND");
    expect(await orders.listOrders(bia.id, batch.id)).toHaveLength(1);

    await orders.deleteOrder(ana.id, batch.id);

    expect(await orders.listOrders(bia.id, batch.id)).toEqual([]);
  });

  it("trava edição e exclusão depois que o pedido foi pago", async () => {
    const { ana, batch, black } = await setup();
    const items = [{ colorId: black, size: "M", quantity: 1 }];

    await orders.saveOrder(ana.id, batch.id, items);
    await db.order.updateMany({ data: { paymentStatus: "PAID" } });

    await expectOrderError(orders.saveOrder(ana.id, batch.id, items), "ORDER_LOCKED");
    await expectOrderError(orders.deleteOrder(ana.id, batch.id), "ORDER_LOCKED");
  });

  it("trava exclusão quando a campanha fecha", async () => {
    const { ana, batch, black } = await setup();

    await orders.saveOrder(ana.id, batch.id, [{ colorId: black, size: "M", quantity: 1 }]);
    await db.batch.update({ where: { id: batch.id }, data: { status: "CLOSED" } });

    await expectOrderError(orders.deleteOrder(ana.id, batch.id), "BATCH_NOT_OPEN");
  });
});

describe("pagamento", () => {
  async function setupWithOrder() {
    const context = await setup();

    await orders.saveOrder(context.ana.id, context.batch.id, [
      { colorId: context.black, size: "M", quantity: 2 },
    ]);

    const [order] = await orders.listOrders(context.ana.id, context.batch.id);

    return { ...context, orderId: order.id };
  }

  it("marca como pago, registra autor e data e tira a edição do titular", async () => {
    const { admin, ana, batch, black, orderId } = await setupWithOrder();

    await orders.markPaid(admin.id, orderId);

    const [managed] = await orders.listManagedOrders(admin.id, batch.id);

    expect(managed.paymentStatus).toBe("PAID");
    expect(managed.history).toHaveLength(1);
    expect(managed.history[0]).toMatchObject({
      kind: "MARKED_PAID",
      authorName: "Chefe Lima",
      reason: null,
    });
    expect(managed.history[0].createdAt).toBeInstanceOf(Date);
    await expectOrderError(
      orders.saveOrder(ana.id, batch.id, [{ colorId: black, size: "M", quantity: 1 }]),
      "ORDER_LOCKED",
    );
    await expectOrderError(orders.markPaid(admin.id, orderId), "INVALID_STATE");
  });

  it("só desfaz o pagamento com motivo, e guarda o motivo no histórico", async () => {
    const { admin, batch, orderId } = await setupWithOrder();

    await orders.markPaid(admin.id, orderId);

    await expectOrderError(orders.undoPayment(admin.id, orderId, "  "), "REASON_REQUIRED");
    expect((await orders.listManagedOrders(admin.id, batch.id))[0].paymentStatus).toBe("PAID");

    await orders.undoPayment(admin.id, orderId, " Marquei a pessoa errada ");

    const [managed] = await orders.listManagedOrders(admin.id, batch.id);

    expect(managed.paymentStatus).toBe("PENDING");
    expect(managed.history[0]).toMatchObject({
      kind: "UNDONE",
      authorName: "Chefe Lima",
      reason: "Marquei a pessoa errada",
    });
    await expectOrderError(orders.undoPayment(admin.id, orderId, "De novo"), "INVALID_STATE");
  });

  it("mantém Pago quando o administrador troca cor ou tamanho sem mudar o total", async () => {
    const { admin, batch, cream, orderId } = await setupWithOrder();

    await orders.markPaid(admin.id, orderId);

    const result = await orders.adminSaveOrder(admin.id, orderId, [
      { colorId: cream, size: "G", quantity: 2 },
    ]);
    const [managed] = await orders.listManagedOrders(admin.id, batch.id);

    expect(result.resetsPayment).toBe(false);
    expect(managed).toMatchObject({ paymentStatus: "PAID", totalCents: 16000 });
    expect(managed.items).toEqual([{ colorId: cream, colorName: "Creme", size: "G", quantity: 2 }]);
  });

  it("devolve a Pendente quando o administrador muda o total de um pedido pago", async () => {
    const { admin, batch, black, orderId } = await setupWithOrder();

    await orders.markPaid(admin.id, orderId);

    const result = await orders.adminSaveOrder(admin.id, orderId, [
      { colorId: black, size: "M", quantity: 3 },
    ]);
    const [managed] = await orders.listManagedOrders(admin.id, batch.id);

    expect(result.resetsPayment).toBe(true);
    expect(managed).toMatchObject({ paymentStatus: "PENDING", totalCents: 24000 });
    expect(managed.history[0].kind).toBe("RESET_BY_EDIT");
  });

  it("não deixa esvaziar um pedido pago", async () => {
    const { admin, batch, orderId } = await setupWithOrder();

    await orders.markPaid(admin.id, orderId);

    await expectOrderError(orders.adminSaveOrder(admin.id, orderId, []), "INVALID_INPUT");
    expect((await orders.listManagedOrders(admin.id, batch.id))[0]).toMatchObject({
      paymentStatus: "PAID",
      pieces: 2,
    });
  });

  it("deixa o administrador editar e marcar como pago com a campanha fechada", async () => {
    const { admin, batch, black, orderId } = await setupWithOrder();

    await db.batch.update({ where: { id: batch.id }, data: { status: "CLOSED" } });
    await orders.adminSaveOrder(admin.id, orderId, [{ colorId: black, size: "G", quantity: 1 }]);
    await orders.markPaid(admin.id, orderId);

    expect((await orders.listManagedOrders(admin.id, batch.id))[0]).toMatchObject({
      paymentStatus: "PAID",
      pieces: 1,
    });
  });

  it("não deixa rider marcar, desfazer, editar pedido alheio nem ver o histórico", async () => {
    const { admin, ana, batch, black, orderId } = await setupWithOrder();
    const bia = await createParticipant(admin.id, "bia@exemplo.com", "Bia Luz");
    const items = [{ colorId: black, size: "M", quantity: 1 }];

    await expectOrderError(orders.markPaid(ana.id, orderId), "FORBIDDEN");
    await expectOrderError(orders.adminSaveOrder(bia.id, orderId, items), "FORBIDDEN");
    await expectOrderError(orders.listManagedOrders(bia.id, batch.id), "FORBIDDEN");

    await orders.markPaid(admin.id, orderId);

    await expectOrderError(orders.undoPayment(ana.id, orderId, "Não paguei"), "FORBIDDEN");
    expect((await orders.listOrders(bia.id, batch.id))[0]).not.toHaveProperty("history");
  });
});

describe("fechar, reabrir e cancelar", () => {
  async function setupWithOrder() {
    const context = await setup();
    const items = [{ colorId: context.black, size: "M", quantity: 2 }];

    await orders.saveOrder(context.ana.id, context.batch.id, items);

    const [order] = await orders.listOrders(context.ana.id, context.batch.id);

    return { ...context, items, orderId: order.id };
  }

  it("fechar tira a campanha do Início, mantém os pedidos e trava o rider", async () => {
    const { admin, ana, batch, items } = await setupWithOrder();

    await batches.closeBatch(admin.id, batch.id);

    expect(await batches.listActive(ana.id)).toEqual([]);
    expect(await orders.listOrders(ana.id, batch.id)).toHaveLength(1);
    await expectOrderError(orders.saveOrder(ana.id, batch.id, items), "BATCH_NOT_OPEN");
    await expectOrderError(orders.deleteOrder(ana.id, batch.id), "BATCH_NOT_OPEN");
  });

  it("reabrir devolve a campanha ao Início e a edição dos pendentes", async () => {
    const { admin, ana, batch, black } = await setupWithOrder();

    await batches.closeBatch(admin.id, batch.id);
    await batches.reopenBatch(admin.id, batch.id);
    await orders.saveOrder(ana.id, batch.id, [{ colorId: black, size: "G", quantity: 1 }]);

    expect(await batches.listActive(ana.id)).toHaveLength(1);
    expect((await orders.listOrders(ana.id, batch.id))[0].pieces).toBe(1);
  });

  it("só aceita as transições previstas e só de administrador", async () => {
    const { admin, ana, batch } = await setupWithOrder();
    const expectBatchError = (action: Promise<unknown>, code: string) =>
      expect(action).rejects.toMatchObject({ name: "BatchError", code });

    await expectBatchError(batches.reopenBatch(admin.id, batch.id), "INVALID_STATE");
    await expectBatchError(batches.closeBatch(ana.id, batch.id), "FORBIDDEN");
    await expectBatchError(batches.cancelBatch(ana.id, batch.id), "FORBIDDEN");

    await batches.closeBatch(admin.id, batch.id);

    await expectBatchError(batches.closeBatch(admin.id, batch.id), "INVALID_STATE");

    await batches.cancelBatch(admin.id, batch.id);

    await expectBatchError(batches.reopenBatch(admin.id, batch.id), "INVALID_STATE");
    await expectBatchError(batches.cancelBatch(admin.id, "inexistente"), "NOT_FOUND");
  });

  it("cancelar a campanha preserva os pedidos como histórico e bloqueia tudo", async () => {
    const { admin, ana, batch, items, orderId } = await setupWithOrder();

    await batches.cancelBatch(admin.id, batch.id);

    expect(await batches.listActive(ana.id)).toEqual([]);
    expect((await batches.getBatch(ana.id, batch.id)).status).toBe("CANCELLED");
    expect(await orders.listOrders(ana.id, batch.id)).toHaveLength(1);
    await expectOrderError(orders.saveOrder(ana.id, batch.id, items), "BATCH_NOT_OPEN");
    await expectOrderError(orders.markPaid(admin.id, orderId), "BATCH_NOT_OPEN");
  });

  it("recusa cancelar campanha com pedido pago, mas deixa fechar", async () => {
    const { admin, batch, orderId } = await setupWithOrder();

    await orders.markPaid(admin.id, orderId);

    await expect(batches.cancelBatch(admin.id, batch.id)).rejects.toMatchObject({
      code: "HAS_PAID_ORDERS",
    });

    await batches.closeBatch(admin.id, batch.id);

    await expect(batches.cancelBatch(admin.id, batch.id)).rejects.toMatchObject({
      code: "HAS_PAID_ORDERS",
    });
    expect((await batches.getBatch(admin.id, batch.id)).status).toBe("CLOSED");
  });

  it("grava um único resultado quando pagar e cancelar a campanha chegam juntos", async () => {
    for (let round = 0; round < 5; round += 1) {
      await resetDatabase(db);

      const { admin, batch, orderId } = await setupWithOrder();

      await Promise.allSettled([
        orders.markPaid(admin.id, orderId),
        batches.cancelBatch(admin.id, batch.id),
      ]);

      const status = (await batches.getBatch(admin.id, batch.id)).status;
      const [order] = await orders.listManagedOrders(admin.id, batch.id);
      const isPaidInLiveBatch = order.paymentStatus === "PAID" && status === "OPEN";
      const isPendingInCancelledBatch = order.paymentStatus === "PENDING" && status === "CANCELLED";

      expect(isPaidInLiveBatch || isPendingInCancelledBatch).toBe(true);
    }
  });

  it("cancela pedido pendente, guarda quem cancelou e tira o pedido das contas do grupo", async () => {
    const { admin, ana, batch, orderId } = await setupWithOrder();
    const bia = await createParticipant(admin.id, "bia@exemplo.com", "Bia Luz");

    await orders.cancelOrder(admin.id, orderId);

    const [managed] = await orders.listManagedOrders(admin.id, batch.id);

    expect(managed.isCancelled).toBe(true);
    expect(managed.history[0]).toMatchObject({ kind: "CANCELLED", authorName: "Chefe Lima" });
    expect(await orders.listOrders(bia.id, batch.id)).toEqual([]);
    expect((await orders.listOrders(ana.id, batch.id))[0].isCancelled).toBe(true);
    expect((await orders.summarizeBatches(ana.id, [batch])).get(batch.id)).toEqual({
      orderCount: 0,
      people: [],
      pieceCount: 0,
      mine: null,
    });
    await expectOrderError(orders.cancelOrder(admin.id, orderId), "INVALID_STATE");
    await expectOrderError(orders.markPaid(admin.id, orderId), "INVALID_STATE");
  });

  it("recusa cancelar pedido pago e cancelamento por rider", async () => {
    const { admin, ana, batch, orderId } = await setupWithOrder();

    await expectOrderError(orders.cancelOrder(ana.id, orderId), "FORBIDDEN");

    await orders.markPaid(admin.id, orderId);

    await expectOrderError(orders.cancelOrder(admin.id, orderId), "ORDER_PAID");
    expect((await orders.listManagedOrders(admin.id, batch.id))[0].isCancelled).toBe(false);
  });

  it("deixa o titular pedir de novo depois de um cancelamento, com a campanha aberta", async () => {
    const { admin, ana, batch, black, orderId } = await setupWithOrder();

    await orders.cancelOrder(admin.id, orderId);
    await expectOrderError(orders.deleteOrder(ana.id, batch.id), "ORDER_LOCKED");
    await orders.saveOrder(ana.id, batch.id, [{ colorId: black, size: "G", quantity: 1 }]);

    const [managed] = await orders.listManagedOrders(admin.id, batch.id);

    expect(managed).toMatchObject({ isCancelled: false, pieces: 1, paymentStatus: "PENDING" });
    expect(managed.history.map((event) => event.kind)).toContain("CANCELLED");
  });
});

describe("totais de produção", () => {
  it("soma peças por cor e tamanho e separa pago de pendente, sem os cancelados", async () => {
    const { admin, ana, batch, black, cream } = await setup();
    const bia = await createParticipant(admin.id, "bia@exemplo.com", "Bia Luz");
    const caio = await createParticipant(admin.id, "caio@exemplo.com", "Caio Sá");

    await orders.saveOrder(ana.id, batch.id, [
      { colorId: black, size: "M", quantity: 2 },
      { colorId: cream, size: "G", quantity: 1 },
    ]);
    await orders.saveOrder(bia.id, batch.id, [{ colorId: black, size: "M", quantity: 1 }]);
    await orders.saveOrder(caio.id, batch.id, [{ colorId: black, size: "G", quantity: 5 }]);

    const managed = await orders.listManagedOrders(admin.id, batch.id);
    const idOf = (name: string) => managed.find((order) => order.participantName === name)!.id;

    await orders.markPaid(admin.id, idOf("Ana Reis"));
    await orders.cancelOrder(admin.id, idOf("Caio Sá"));

    expect(await orders.getProduction(admin.id, batch.id)).toEqual({
      sizes: ["M", "G"],
      rows: [
        { colorId: black, colorName: "Preta", quantities: [3, 0], total: 3 },
        { colorId: cream, colorName: "Creme", quantities: [0, 1], total: 1 },
      ],
      sizeTotals: [3, 1],
      totalPieces: 4,
      paidCents: 24000,
      pendingCents: 8000,
      totalCents: 32000,
    });
  });

  it("zera tudo numa campanha sem pedidos e não abre para rider", async () => {
    const { admin, ana, batch } = await setup();

    expect(await orders.getProduction(admin.id, batch.id)).toMatchObject({
      sizeTotals: [0, 0],
      totalPieces: 0,
      paidCents: 0,
      pendingCents: 0,
      totalCents: 0,
    });
    await expectOrderError(orders.getProduction(ana.id, batch.id), "FORBIDDEN");
    await expectOrderError(orders.getProduction(admin.id, "inexistente"), "NOT_FOUND");
  });
});

describe("relatório da campanha", () => {
  it("lista os pedidos em ordem alfabética com totais, sem telefone e sem cancelados", async () => {
    const { admin, ana, batch, black, cream } = await setup();
    const caio = await createParticipant(admin.id, "caio@exemplo.com", "Caio Sá");

    await orders.saveOrder(admin.id, batch.id, [{ colorId: cream, size: "G", quantity: 1 }]);
    await orders.saveOrder(ana.id, batch.id, [{ colorId: black, size: "M", quantity: 2 }]);
    await orders.saveOrder(caio.id, batch.id, [{ colorId: black, size: "G", quantity: 5 }]);

    const managed = await orders.listManagedOrders(admin.id, batch.id);
    const idOf = (name: string) => managed.find((order) => order.participantName === name)!.id;

    await orders.markPaid(admin.id, idOf("Ana Reis"));
    await orders.cancelOrder(admin.id, idOf("Caio Sá"));

    const report = await orders.getBatchReport(admin.id, batch.id);

    expect(report).toMatchObject({
      model: "Camiseta Mirante",
      status: "OPEN",
      unitPriceCents: 8000,
      coverPhotoKey: "preta.webp",
    });
    expect(report.orders).toEqual([
      {
        participantName: "Ana Reis",
        items: [{ colorName: "Preta", size: "M", quantity: 2 }],
        pieces: 2,
        totalCents: 16000,
        paymentStatus: "PAID",
      },
      {
        participantName: "Chefe Lima",
        items: [{ colorName: "Creme", size: "G", quantity: 1 }],
        pieces: 1,
        totalCents: 8000,
        paymentStatus: "PENDING",
      },
    ]);
    expect(report.production).toMatchObject({
      totalPieces: 3,
      paidCents: 16000,
      pendingCents: 8000,
      totalCents: 24000,
    });
    expect(JSON.stringify(report)).not.toContain("21988887777");
  });

  it("não é gerado para rider", async () => {
    const { ana, batch } = await setup();

    await expectOrderError(orders.getBatchReport(ana.id, batch.id), "FORBIDDEN");
  });
});

describe("resumo para o Início", () => {
  it("conta pedidos e peças do grupo e traz o pedido de quem está vendo", async () => {
    const { admin, ana, batch, black, cream } = await setup();
    const empty = await openShirtBatch(admin.id);

    await orders.saveOrder(ana.id, batch.id, [{ colorId: black, size: "M", quantity: 2 }]);
    await orders.saveOrder(admin.id, batch.id, [{ colorId: cream, size: "G", quantity: 3 }]);

    const summary = await orders.summarizeBatches(ana.id, [batch, empty]);

    expect(summary.get(batch.id)).toMatchObject({
      orderCount: 2,
      pieceCount: 5,
      mine: { pieces: 2, totalCents: 16000, paymentStatus: "PENDING" },
    });
    expect(summary.get(batch.id)?.people.map((person) => person.userId).toSorted()).toEqual(
      [ana.id, admin.id].toSorted(),
    );
    expect(summary.get(empty.id)).toEqual({ orderCount: 0, pieceCount: 0, people: [], mine: null });
  });
});

describe("trava de preço", () => {
  it("deixa corrigir o preço antes do primeiro pedido e trava depois", async () => {
    const { admin, ana, batch, black } = await setup();

    await batches.changeUnitPrice(admin.id, batch.id, "85,50");

    expect((await batches.getBatch(ana.id, batch.id)).unitPriceCents).toBe(8550);

    await orders.saveOrder(ana.id, batch.id, [{ colorId: black, size: "M", quantity: 1 }]);

    await expect(batches.changeUnitPrice(admin.id, batch.id, "90")).rejects.toMatchObject({
      name: "BatchError",
      code: "PRICE_LOCKED",
    });
    await expect(batches.changeUnitPrice(ana.id, batch.id, "90")).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect((await batches.getBatch(ana.id, batch.id)).unitPriceCents).toBe(8550);
  });
});
