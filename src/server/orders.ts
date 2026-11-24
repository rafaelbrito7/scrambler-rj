import type { AccessService } from "@/server/access";
import { lockBatch } from "@/server/batch-lock";
import type { Database } from "@/server/db";
import { groupName, type PersonCard, recordName } from "@/server/display-name";
import { loadPersonCards } from "@/server/person-cards";

export type OrderItemInput = {
  colorId: string;
  size: string;
  quantity: number;
};

type OrderErrorCode =
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BATCH_NOT_OPEN"
  | "ORDER_LOCKED"
  | "ORDER_PAID"
  | "INVALID_STATE"
  | "REASON_REQUIRED"
  | "INVALID_INPUT";

export class OrderError extends Error {
  readonly name = "OrderError";

  constructor(readonly code: OrderErrorCode) {
    super(code);
  }
}

export type PaymentStatus = "PENDING" | "PAID";

export type OrderSummary = {
  id: string;
  userId: string;
  participantName: string;
  isMine: boolean;
  items: { colorId: string; colorName: string; size: string; quantity: number }[];
  pieces: number;
  totalCents: number;
  paymentStatus: PaymentStatus;
  isCancelled: boolean;
};

export type PaymentEventSummary = {
  kind: "MARKED_PAID" | "UNDONE" | "RESET_BY_EDIT" | "CANCELLED";
  authorName: string;
  reason: string | null;
  createdAt: Date;
};

export type ManagedOrder = OrderSummary & { groupName: string; history: PaymentEventSummary[] };

export type BatchOrderStats = {
  orderCount: number;
  pieceCount: number;
  // Who ordered, for the avatar row.
  people: PersonCard[];
  mine: { pieces: number; totalCents: number; paymentStatus: PaymentStatus } | null;
};

export type ProductionSummary = {
  sizes: string[];
  rows: { colorId: string; colorName: string; quantities: number[]; total: number }[];
  sizeTotals: number[];
  totalPieces: number;
  paidCents: number;
  pendingCents: number;
  totalCents: number;
};

// Everything the shareable report carries. No phone numbers and no cancelled orders by design.
export type BatchReport = {
  model: string;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  unitPriceCents: number;
  coverPhotoKey: string | null;
  orders: {
    participantName: string;
    items: { colorName: string; size: string; quantity: number }[];
    pieces: number;
    totalCents: number;
    paymentStatus: PaymentStatus;
  }[];
  production: ProductionSummary;
};

export const MAX_ITEM_QUANTITY = 99;

function isDuplicateError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export function createOrderService(db: Database, access: Pick<AccessService, "getAccess">) {
  async function assertApproved(userId: string) {
    const viewer = await access.getAccess(userId);

    if (viewer.state !== "approved") throw new OrderError("FORBIDDEN");
  }

  async function assertAdmin(userId: string) {
    const viewer = await access.getAccess(userId);

    if (!viewer.isAdmin) throw new OrderError("FORBIDDEN");
  }

  async function findOpenBatch(batchId: string) {
    const batch = await db.batch.findUnique({
      where: { id: batchId },
      select: { status: true, sizes: true, colors: { select: { id: true } } },
    });

    if (!batch) throw new OrderError("NOT_FOUND");
    if (batch.status !== "OPEN") throw new OrderError("BATCH_NOT_OPEN");

    return batch;
  }

  function mergeItems(
    items: OrderItemInput[],
    batch: { sizes: string[]; colors: { id: string }[] },
  ): OrderItemInput[] {
    const colorIds = new Set(batch.colors.map((color) => color.id));
    const merged = new Map<string, OrderItemInput>();

    for (const item of items) {
      const isValidQuantity = Number.isInteger(item.quantity) && item.quantity > 0;
      const isOffered = colorIds.has(item.colorId) && batch.sizes.includes(item.size);

      if (!isValidQuantity || !isOffered) throw new OrderError("INVALID_INPUT");

      const key = `${item.colorId}:${item.size}`;
      const quantity = (merged.get(key)?.quantity ?? 0) + item.quantity;

      if (quantity > MAX_ITEM_QUANTITY) throw new OrderError("INVALID_INPUT");

      merged.set(key, { ...item, quantity });
    }

    if (merged.size === 0) throw new OrderError("INVALID_INPUT");

    return [...merged.values()];
  }

  async function saveOrder(userId: string, batchId: string, items: OrderItemInput[]) {
    await assertApproved(userId);

    const batch = await findOpenBatch(batchId);
    const merged = mergeItems(items, batch);

    try {
      await db.$transaction(async (tx) => {
        // Checked again under the lock: the batch may have closed after the page was loaded.
        if ((await lockBatch(tx, batchId)) !== "OPEN") throw new OrderError("BATCH_NOT_OPEN");

        const existing = await tx.order.findUnique({
          where: { batchId_userId: { batchId, userId } },
          select: { id: true, paymentStatus: true },
        });

        if (existing && existing.paymentStatus !== "PENDING") throw new OrderError("ORDER_LOCKED");

        const order = existing ?? (await tx.order.create({ data: { batchId, userId } }));

        await tx.orderItem.deleteMany({ where: { orderId: order.id } });
        await tx.orderItem.createMany({
          data: merged.map((item) => ({ ...item, orderId: order.id })),
        });
        await tx.order.update({
          where: { id: order.id },
          data: { updatedAt: new Date(), cancelledAt: null },
        });
      });
    } catch (error) {
      // Two tabs sending the first order at once: the unique key keeps one, so retry as an edit.
      if (isDuplicateError(error)) return saveOrder(userId, batchId, items);

      throw error;
    }
  }

  async function deleteOrder(userId: string, batchId: string) {
    await assertApproved(userId);
    await findOpenBatch(batchId);

    await db.$transaction(async (tx) => {
      if ((await lockBatch(tx, batchId)) !== "OPEN") throw new OrderError("BATCH_NOT_OPEN");

      const order = await tx.order.findUnique({
        where: { batchId_userId: { batchId, userId } },
        select: { id: true, paymentStatus: true, cancelledAt: true },
      });

      if (!order) throw new OrderError("NOT_FOUND");

      // A cancelled order stays as history; only a live pending one can be removed.
      const isLocked = order.paymentStatus !== "PENDING" || order.cancelledAt !== null;

      if (isLocked) throw new OrderError("ORDER_LOCKED");

      await tx.order.delete({ where: { id: order.id } });
    });
  }

  async function loadOrders(viewerId: string, batchId: string): Promise<ManagedOrder[]> {
    const batch = await db.batch.findUnique({
      where: { id: batchId },
      select: {
        unitPriceCents: true,
        sizes: true,
        orders: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { name: true, profile: { select: { fullName: true, nickname: true } } } },
            items: { include: { color: { select: { name: true, position: true } } } },
            events: {
              orderBy: { createdAt: "desc" },
              include: {
                author: { select: { name: true, profile: { select: { fullName: true, nickname: true } } } },
              },
            },
          },
        },
      },
    });

    if (!batch) throw new OrderError("NOT_FOUND");

    return batch.orders.map((order) => {
      const items = order.items
        .toSorted(
          (a, b) =>
            a.color.position - b.color.position ||
            batch.sizes.indexOf(a.size) - batch.sizes.indexOf(b.size),
        )
        .map((item) => ({
          colorId: item.colorId,
          colorName: item.color.name,
          size: item.size,
          quantity: item.quantity,
        }));
      const pieces = items.reduce((sum, item) => sum + item.quantity, 0);

      return {
        id: order.id,
        userId: order.userId,
        participantName: order.user.profile
          ? recordName(order.user.profile)
          : (order.user.name ?? "Rider"),
        groupName: order.user.profile
          ? groupName(order.user.profile)
          : (order.user.name ?? "Rider"),
        isMine: order.userId === viewerId,
        items,
        pieces,
        totalCents: pieces * batch.unitPriceCents,
        paymentStatus: order.paymentStatus,
        isCancelled: order.cancelledAt !== null,
        history: order.events.map((event) => ({
          kind: event.kind,
          authorName: event.author.profile?.fullName ?? event.author.name ?? "Administrador",
          reason: event.reason,
          createdAt: event.createdAt,
        })),
      };
    });
  }

  async function listOrders(userId: string, batchId: string): Promise<OrderSummary[]> {
    await assertApproved(userId);

    const visible = (await loadOrders(userId, batchId)).filter(
      (order) => !order.isCancelled || order.isMine,
    );

    return visible.map((order) => ({
      id: order.id,
      userId: order.userId,
      // Participants see each other by the name the group uses.
      participantName: order.groupName,
      isMine: order.isMine,
      items: order.items,
      pieces: order.pieces,
      totalCents: order.totalCents,
      paymentStatus: order.paymentStatus,
      isCancelled: order.isCancelled,
    }));
  }

  async function listManagedOrders(adminId: string, batchId: string): Promise<ManagedOrder[]> {
    await assertAdmin(adminId);

    return loadOrders(adminId, batchId);
  }

  async function findBatchIdOf(orderId: string) {
    const order = await db.order.findUnique({ where: { id: orderId }, select: { batchId: true } });

    if (!order) throw new OrderError("NOT_FOUND");

    return order.batchId;
  }

  async function markPaid(adminId: string, orderId: string) {
    await assertAdmin(adminId);

    const batchId = await findBatchIdOf(orderId);

    await db.$transaction(async (tx) => {
      // Paying and cancelling the batch take the same lock, so only one of them goes through.
      if ((await lockBatch(tx, batchId)) === "CANCELLED") throw new OrderError("BATCH_NOT_OPEN");

      const updated = await tx.order.updateMany({
        where: { id: orderId, paymentStatus: "PENDING", cancelledAt: null },
        data: { paymentStatus: "PAID" },
      });

      if (updated.count === 0) throw new OrderError("INVALID_STATE");

      await tx.paymentEvent.create({ data: { orderId, authorId: adminId, kind: "MARKED_PAID" } });
    });
  }

  async function cancelOrder(adminId: string, orderId: string) {
    await assertAdmin(adminId);

    const batchId = await findBatchIdOf(orderId);

    await db.$transaction(async (tx) => {
      await lockBatch(tx, batchId);

      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: { paymentStatus: true, cancelledAt: true },
      });

      if (!order) throw new OrderError("NOT_FOUND");
      if (order.paymentStatus === "PAID") throw new OrderError("ORDER_PAID");
      if (order.cancelledAt) throw new OrderError("INVALID_STATE");

      await tx.order.update({ where: { id: orderId }, data: { cancelledAt: new Date() } });
      await tx.paymentEvent.create({ data: { orderId, authorId: adminId, kind: "CANCELLED" } });
    });
  }

  async function undoPayment(adminId: string, orderId: string, reason: string) {
    await assertAdmin(adminId);

    const trimmedReason = reason.trim();

    if (trimmedReason.length < 3 || trimmedReason.length > 200) {
      throw new OrderError("REASON_REQUIRED");
    }

    await db.$transaction(async (tx) => {
      const updated = await tx.order.updateMany({
        where: { id: orderId, paymentStatus: "PAID" },
        data: { paymentStatus: "PENDING" },
      });

      if (updated.count === 0) {
        const exists = await tx.order.count({ where: { id: orderId } });

        throw new OrderError(exists ? "INVALID_STATE" : "NOT_FOUND");
      }

      await tx.paymentEvent.create({
        data: { orderId, authorId: adminId, kind: "UNDONE", reason: trimmedReason },
      });
    });
  }

  // An administrator may fix an order while the batch is open or closed. Keeping the total
  // keeps a paid order paid; changing it sends the order back to pending for a new check.
  async function adminSaveOrder(adminId: string, orderId: string, items: OrderItemInput[]) {
    await assertAdmin(adminId);

    const order = await db.order.findUnique({
      where: { id: orderId },
      select: {
        batch: { select: { status: true, sizes: true, colors: { select: { id: true } } } },
      },
    });

    if (!order) throw new OrderError("NOT_FOUND");
    if (order.batch.status === "CANCELLED") throw new OrderError("BATCH_NOT_OPEN");

    const merged = mergeItems(items, order.batch);
    const pieces = merged.reduce((sum, item) => sum + item.quantity, 0);

    return db.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          paymentStatus: true,
          cancelledAt: true,
          items: { select: { quantity: true } },
        },
      });

      if (!current) throw new OrderError("NOT_FOUND");
      if (current.cancelledAt) throw new OrderError("INVALID_STATE");

      const previousPieces = current.items.reduce((sum, item) => sum + item.quantity, 0);
      const resetsPayment = current.paymentStatus === "PAID" && previousPieces !== pieces;

      await tx.orderItem.deleteMany({ where: { orderId } });
      await tx.orderItem.createMany({ data: merged.map((item) => ({ ...item, orderId })) });
      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: resetsPayment ? "PENDING" : current.paymentStatus },
      });

      if (resetsPayment) {
        await tx.paymentEvent.create({
          data: { orderId, authorId: adminId, kind: "RESET_BY_EDIT" },
        });
      }

      return { resetsPayment };
    });
  }

  // What goes to the supplier and what is still owed. Cancelled orders are left out of everything.
  async function getProduction(adminId: string, batchId: string): Promise<ProductionSummary> {
    await assertAdmin(adminId);

    const batch = await db.batch.findUnique({
      where: { id: batchId },
      select: {
        unitPriceCents: true,
        sizes: true,
        colors: { orderBy: { position: "asc" }, select: { id: true, name: true } },
        orders: {
          where: { cancelledAt: null },
          select: {
            paymentStatus: true,
            items: { select: { colorId: true, size: true, quantity: true } },
          },
        },
      },
    });

    if (!batch) throw new OrderError("NOT_FOUND");

    const quantityByVariant = new Map<string, number>();
    let paidPieces = 0;
    let pendingPieces = 0;

    for (const order of batch.orders) {
      for (const item of order.items) {
        const key = `${item.colorId}:${item.size}`;

        quantityByVariant.set(key, (quantityByVariant.get(key) ?? 0) + item.quantity);

        if (order.paymentStatus === "PAID") paidPieces += item.quantity;
        else pendingPieces += item.quantity;
      }
    }

    const rows = batch.colors.map((color) => {
      const quantities = batch.sizes.map((size) => quantityByVariant.get(`${color.id}:${size}`) ?? 0);

      return {
        colorId: color.id,
        colorName: color.name,
        quantities,
        total: quantities.reduce((sum, quantity) => sum + quantity, 0),
      };
    });
    const sizeTotals = batch.sizes.map((_size, index) =>
      rows.reduce((sum, row) => sum + row.quantities[index], 0),
    );

    return {
      sizes: batch.sizes,
      rows,
      sizeTotals,
      totalPieces: paidPieces + pendingPieces,
      paidCents: paidPieces * batch.unitPriceCents,
      pendingCents: pendingPieces * batch.unitPriceCents,
      totalCents: (paidPieces + pendingPieces) * batch.unitPriceCents,
    };
  }

  async function getBatchReport(adminId: string, batchId: string): Promise<BatchReport> {
    await assertAdmin(adminId);

    const batch = await db.batch.findUnique({
      where: { id: batchId },
      select: {
        model: true,
        status: true,
        unitPriceCents: true,
        colors: { orderBy: { position: "asc" }, take: 1, select: { photoKey: true } },
      },
    });

    if (!batch) throw new OrderError("NOT_FOUND");

    const [orders, production] = await Promise.all([
      loadOrders(adminId, batchId),
      getProduction(adminId, batchId),
    ]);

    return {
      model: batch.model,
      status: batch.status,
      unitPriceCents: batch.unitPriceCents,
      coverPhotoKey: batch.colors[0]?.photoKey ?? null,
      orders: orders
        .filter((order) => !order.isCancelled)
        .toSorted((a, b) => a.participantName.localeCompare(b.participantName, "pt-BR"))
        .map((order) => ({
          participantName: order.participantName,
          items: order.items.map((item) => ({
            colorName: item.colorName,
            size: item.size,
            quantity: item.quantity,
          })),
          pieces: order.pieces,
          totalCents: order.totalCents,
          paymentStatus: order.paymentStatus,
        })),
      production,
    };
  }

  async function summarizeBatches(
    userId: string,
    batches: { id: string; unitPriceCents: number }[],
  ): Promise<Map<string, BatchOrderStats>> {
    await assertApproved(userId);

    const orders = await db.order.findMany({
      where: { batchId: { in: batches.map((batch) => batch.id) }, cancelledAt: null },
      select: {
        batchId: true,
        userId: true,
        paymentStatus: true,
        items: { select: { quantity: true } },
      },
    });
    const summary = new Map<string, BatchOrderStats>(
      batches.map((batch) => [batch.id, { orderCount: 0, pieceCount: 0, people: [], mine: null }]),
    );
    const cards = await loadPersonCards(db, [...new Set(orders.map((order) => order.userId))]);
    const batchesByUser = Map.groupBy(orders, (order) => order.userId);

    for (const card of cards) {
      for (const order of batchesByUser.get(card.userId) ?? []) {
        summary.get(order.batchId)?.people.push(card);
      }
    }
    const priceByBatch = new Map(batches.map((batch) => [batch.id, batch.unitPriceCents]));

    for (const order of orders) {
      const stats = summary.get(order.batchId);

      if (!stats) continue;

      const pieces = order.items.reduce((sum, item) => sum + item.quantity, 0);

      stats.orderCount += 1;
      stats.pieceCount += pieces;

      if (order.userId === userId) {
        stats.mine = {
          pieces,
          totalCents: pieces * (priceByBatch.get(order.batchId) ?? 0),
          paymentStatus: order.paymentStatus,
        };
      }
    }

    return summary;
  }

  return {
    saveOrder,
    deleteOrder,
    listOrders,
    listManagedOrders,
    markPaid,
    cancelOrder,
    undoPayment,
    adminSaveOrder,
    getProduction,
    getBatchReport,
    summarizeBatches,
  };
}

export type OrderService = ReturnType<typeof createOrderService>;
