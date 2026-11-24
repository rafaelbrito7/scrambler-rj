import type { Prisma } from "@/generated/prisma/client";

type BatchStatus = "OPEN" | "CLOSED" | "CANCELLED";

// Serialises everything that depends on a batch's state (ordering, paying, closing, cancelling)
// so two requests arriving together cannot both pass a check the other one invalidates.
export async function lockBatch(
  tx: Prisma.TransactionClient,
  batchId: string,
): Promise<BatchStatus | null> {
  const rows = await tx.$queryRaw<{ status: BatchStatus }[]>`
    SELECT "status"::text AS "status" FROM "Batch" WHERE "id" = ${batchId} FOR UPDATE
  `;

  return rows[0]?.status ?? null;
}
