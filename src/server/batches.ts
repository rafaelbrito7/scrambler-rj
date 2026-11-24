import type { AccessService } from "@/server/access";
import { lockBatch } from "@/server/batch-lock";
import type { Database } from "@/server/db";
import type { PersonCard } from "@/server/display-name";
import { loadPersonCards } from "@/server/person-cards";

export type BatchColorInput = {
  name: string;
  photoKey: string | null;
};

export type BatchInput = {
  model: string;
  unitPrice: string;
  sizes: string[];
  colors: BatchColorInput[];
};

export type BatchField = "model" | "unitPrice" | "sizes" | "colors";

export type BatchFieldErrors = Partial<Record<BatchField, string>>;

type BatchErrorCode =
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_INPUT"
  | "PRICE_LOCKED"
  | "INVALID_STATE"
  | "HAS_PAID_ORDERS"
  | "NOT_REQUESTABLE";

export class BatchError extends Error {
  readonly name = "BatchError";

  constructor(
    readonly code: BatchErrorCode,
    readonly fieldErrors: BatchFieldErrors = {},
  ) {
    super(code);
  }
}

export type BatchSummary = {
  id: string;
  model: string;
  unitPriceCents: number;
  sizes: string[];
  status: "OPEN" | "CLOSED" | "CANCELLED";
  openedAt: Date;
  colors: { id: string; name: string; photoKey: string }[];
};

// A garment the group has had: the latest campaign of its line. A campaign opened from another
// continues that one's line, so each garment shows once however many times it came back.
export type CatalogEntry = {
  batch: BatchSummary;
  campaignCount: number;
  // Only a closed garment can be asked back; an open one is simply on offer.
  canRequest: boolean;
  wanted: { people: PersonCard[]; mine: boolean };
};

export const MAX_BATCH_COLORS = 8;

const MAX_PRICE_CENTS = 10_000_00;

// Money stays in whole cents; the text is never routed through a float.
export function parsePriceToCents(text: string): number | null {
  const cleaned = text.replace(/R\$/i, "").replace(/\s/g, "");
  const match = /^(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/.exec(cleaned) ??
    /^(\d+)(?:\.(\d{1,2}))?$/.exec(cleaned);

  if (!match) return null;

  const reais = Number(match[1].replace(/\./g, ""));
  const cents = Number((match[2] ?? "").padEnd(2, "0"));

  return reais * 100 + cents;
}

export type ValidBatch = {
  model: string;
  unitPriceCents: number;
  sizes: string[];
  colors: { name: string; photoKey: string }[];
};

// A recipe and a batch describe the same garment, so both go through this check.
export function validateGarment(input: BatchInput): ValidBatch {
  const fieldErrors: BatchFieldErrors = {};
  const model = input.model.trim();
  const unitPriceCents = parsePriceToCents(input.unitPrice);
  const sizes = [...new Set(input.sizes.map((size) => size.trim()).filter(Boolean))];
  const colors = input.colors.map((color) => ({ ...color, name: color.name.trim() }));
  const colorNames = colors.map((color) => color.name.toLowerCase());

  if (model.length < 2) fieldErrors.model = "Informe o modelo da peça.";
  if (model.length > 60) fieldErrors.model = "Use no máximo 60 caracteres.";

  if (unitPriceCents === null || unitPriceCents <= 0) {
    fieldErrors.unitPrice = "Informe o preço em reais, por exemplo 80,00.";
  } else if (unitPriceCents > MAX_PRICE_CENTS) {
    fieldErrors.unitPrice = "Confira o preço: o valor está alto demais.";
  }

  if (sizes.length === 0) fieldErrors.sizes = "Escolha ao menos um tamanho.";

  if (colors.length === 0) {
    fieldErrors.colors = "Adicione ao menos uma cor com foto.";
  } else if (colors.length > MAX_BATCH_COLORS) {
    fieldErrors.colors = `Use no máximo ${MAX_BATCH_COLORS} cores.`;
  } else if (colors.some((color) => color.name.length === 0 || color.name.length > 30)) {
    fieldErrors.colors = "Dê um nome de até 30 caracteres a cada cor.";
  } else if (new Set(colorNames).size !== colorNames.length) {
    fieldErrors.colors = "Há cores com o mesmo nome.";
  } else if (colors.some((color) => !color.photoKey)) {
    fieldErrors.colors = "Toda cor precisa de uma foto.";
  }

  if (Object.keys(fieldErrors).length > 0 || unitPriceCents === null) {
    throw new BatchError("INVALID_INPUT", fieldErrors);
  }

  return {
    model,
    unitPriceCents,
    sizes,
    colors: colors.map((color) => ({ name: color.name, photoKey: color.photoKey ?? "" })),
  };
}

const batchInclude = {
  colors: { orderBy: { position: "asc" }, select: { id: true, name: true, photoKey: true } },
} as const;

export function createBatchService(db: Database, access: Pick<AccessService, "getAccess">) {
  async function assertApproved(userId: string) {
    const viewer = await access.getAccess(userId);

    if (viewer.state !== "approved") throw new BatchError("FORBIDDEN");
  }

  async function assertAdmin(userId: string) {
    const viewer = await access.getAccess(userId);

    if (!viewer.isAdmin) throw new BatchError("FORBIDDEN");
  }

  function summarize(batch: Awaited<ReturnType<typeof findBatches>>[number]): BatchSummary {
    return {
      id: batch.id,
      model: batch.model,
      unitPriceCents: batch.unitPriceCents,
      sizes: batch.sizes,
      status: batch.status,
      openedAt: batch.openedAt,
      colors: batch.colors,
    };
  }

  function findBatches(isOpenOnly: boolean) {
    return db.batch.findMany({
      where: isOpenOnly ? { status: "OPEN" } : undefined,
      orderBy: [{ openedAt: "desc" }, { id: "desc" }],
      include: batchInclude,
    });
  }

  // With `revivedFromId` the new campaign brings a closed one back: it continues that
  // garment's line and answers everyone who had asked for it, so their requests are erased.
  async function openBatch(
    adminId: string,
    input: BatchInput,
    revivedFromId: string | null = null,
  ): Promise<BatchSummary> {
    await assertAdmin(adminId);

    const valid = validateGarment(input);

    const batch = await db.$transaction(async (tx) => {
      if (revivedFromId !== null) {
        const status = await lockBatch(tx, revivedFromId);

        if (!status) throw new BatchError("NOT_FOUND");
        if (status !== "CLOSED") throw new BatchError("INVALID_STATE");

        await tx.batchComeback.deleteMany({ where: { batchId: revivedFromId } });
      }

      return tx.batch.create({
        data: {
          model: valid.model,
          unitPriceCents: valid.unitPriceCents,
          sizes: valid.sizes,
          createdById: adminId,
          revivedFromId,
          colors: {
            create: valid.colors.map((color, position) => ({ ...color, position })),
          },
        },
        include: batchInclude,
      });
    });

    return summarize(batch);
  }

  // Every garment the group has had, cancelled campaigns aside: the ones on offer first, then
  // the closed ones, the most wanted back ahead.
  async function listCatalog(userId: string): Promise<CatalogEntry[]> {
    await assertApproved(userId);

    const [found, comebacks] = await Promise.all([
      db.batch.findMany({
        where: { status: { not: "CANCELLED" } },
        orderBy: [{ openedAt: "desc" }, { id: "desc" }],
        include: batchInclude,
      }),
      db.batchComeback.findMany({ select: { batchId: true, userId: true } }),
    ]);
    const cards = new Map(
      (await loadPersonCards(db, [...new Set(comebacks.map((entry) => entry.userId))])).map(
        (card) => [card.userId, card],
      ),
    );
    const byId = new Map(found.map((batch) => [batch.id, batch]));
    const continued = new Set(found.map((batch) => batch.revivedFromId).filter(Boolean));

    function campaignCount(batchId: string) {
      const seen = new Set<string>();
      let current = byId.get(batchId);

      while (current && !seen.has(current.id)) {
        seen.add(current.id);
        current = current.revivedFromId ? byId.get(current.revivedFromId) : undefined;
      }

      return seen.size;
    }

    return found
      .filter((batch) => !continued.has(batch.id))
      .map((batch) => {
        const askers = comebacks.filter((entry) => entry.batchId === batch.id);

        return {
          batch: summarize(batch),
          campaignCount: campaignCount(batch.id),
          canRequest: batch.status === "CLOSED",
          wanted: {
            people: [...cards.values()].filter((card) =>
              askers.some((entry) => entry.userId === card.userId),
            ),
            mine: askers.some((entry) => entry.userId === userId),
          },
        };
      })
      .toSorted(
        (a, b) =>
          Number(a.canRequest) - Number(b.canRequest) ||
          b.wanted.people.length - a.wanted.people.length,
      );
  }

  // A rider says they want a closed garment back, or takes that back. Only the latest
  // campaign of a garment takes requests: an earlier one already came back once.
  async function setComeback(userId: string, batchId: string, wants: boolean) {
    await assertApproved(userId);

    await db.$transaction(async (tx) => {
      const status = await lockBatch(tx, batchId);

      if (!status) throw new BatchError("NOT_FOUND");

      if (!wants) {
        await tx.batchComeback.deleteMany({ where: { batchId, userId } });

        return;
      }

      const continuations = await tx.batch.count({
        where: { revivedFromId: batchId, status: { not: "CANCELLED" } },
      });

      if (status !== "CLOSED" || continuations > 0) throw new BatchError("NOT_REQUESTABLE");

      await tx.batchComeback.upsert({
        where: { batchId_userId: { batchId, userId } },
        update: {},
        create: { batchId, userId },
      });
    });
  }

  async function listActive(userId: string) {
    await assertApproved(userId);

    return (await findBatches(true)).map(summarize);
  }

  async function listAll(adminId: string) {
    await assertAdmin(adminId);

    return (await findBatches(false)).map(summarize);
  }

  async function getBatch(userId: string, batchId: string) {
    await assertApproved(userId);

    const batch = await db.batch.findUnique({ where: { id: batchId }, include: batchInclude });

    if (!batch) throw new BatchError("NOT_FOUND");

    return summarize(batch);
  }

  async function changeUnitPrice(adminId: string, batchId: string, unitPrice: string) {
    await assertAdmin(adminId);

    const unitPriceCents = parsePriceToCents(unitPrice);

    if (unitPriceCents === null || unitPriceCents <= 0 || unitPriceCents > MAX_PRICE_CENTS) {
      throw new BatchError("INVALID_INPUT", {
        unitPrice: "Informe o preço em reais, por exemplo 80,00.",
      });
    }

    // The guard sits in the update itself so an order arriving at the same moment cannot slip past.
    const updated = await db.batch.updateMany({
      where: { id: batchId, orders: { none: {} } },
      data: { unitPriceCents },
    });

    if (updated.count === 0) {
      const exists = await db.batch.count({ where: { id: batchId } });

      throw new BatchError(exists ? "PRICE_LOCKED" : "NOT_FOUND");
    }
  }

  type Status = BatchSummary["status"];

  async function changeStatus(
    adminId: string,
    batchId: string,
    allowedFrom: Status[],
    to: Status,
  ) {
    await assertAdmin(adminId);

    await db.$transaction(async (tx) => {
      const status = await lockBatch(tx, batchId);

      if (!status) throw new BatchError("NOT_FOUND");
      if (!allowedFrom.includes(status)) throw new BatchError("INVALID_STATE");

      if (to === "CANCELLED") {
        const paidOrders = await tx.order.count({ where: { batchId, paymentStatus: "PAID" } });

        if (paidOrders > 0) throw new BatchError("HAS_PAID_ORDERS");
      }

      await tx.batch.update({ where: { id: batchId }, data: { status: to } });
    });
  }

  // Closing keeps every order and takes the batch off the participants' home.
  function closeBatch(adminId: string, batchId: string) {
    return changeStatus(adminId, batchId, ["OPEN"], "CLOSED");
  }

  function reopenBatch(adminId: string, batchId: string) {
    return changeStatus(adminId, batchId, ["CLOSED"], "OPEN");
  }

  // A batch with any paid order can be closed but never cancelled.
  function cancelBatch(adminId: string, batchId: string) {
    return changeStatus(adminId, batchId, ["OPEN", "CLOSED"], "CANCELLED");
  }

  return {
    openBatch,
    listCatalog,
    setComeback,
    listActive,
    listAll,
    getBatch,
    changeUnitPrice,
    closeBatch,
    reopenBatch,
    cancelBatch,
  };
}

export type BatchService = ReturnType<typeof createBatchService>;
