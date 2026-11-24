"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { OrderFormState } from "@/app/vestuario/[id]/actions";
import { orderErrorMessages } from "@/app/vestuario/order-messages";
import { auth } from "@/auth";
import { BatchError } from "@/server/batches";
import { OrderError } from "@/server/orders";
import { batches, orders } from "@/server/services";

const itemsSchema = z.array(
  z.object({ colorId: z.string(), size: z.string(), quantity: z.number() }),
);

async function currentUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/");

  return userId;
}

function parseItems(raw: FormDataEntryValue | null) {
  try {
    return itemsSchema.parse(JSON.parse(String(raw ?? "[]")));
  } catch {
    return [];
  }
}

function finish(batchId: string, notice: string): never {
  revalidatePath("/inicio");
  revalidatePath(`/vestuario/${batchId}`);
  revalidatePath(`/painel/vestuario/${batchId}`);
  redirect(`/painel/vestuario/${batchId}?aviso=${notice}`);
}

export async function markOrderPaid(formData: FormData) {
  const adminId = await currentUserId();
  const batchId = String(formData.get("batchId") ?? "");
  let notice = "pago";

  try {
    await orders.markPaid(adminId, String(formData.get("orderId") ?? ""));
  } catch (error) {
    if (!(error instanceof OrderError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");

    notice = "mudou";
  }

  finish(batchId, notice);
}

export async function cancelOrder(formData: FormData) {
  const adminId = await currentUserId();
  const batchId = String(formData.get("batchId") ?? "");
  let notice = "pedido-cancelado";

  try {
    await orders.cancelOrder(adminId, String(formData.get("orderId") ?? ""));
  } catch (error) {
    if (!(error instanceof OrderError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");

    notice = error.code === "ORDER_PAID" ? "pedido-pago" : "mudou";
  }

  finish(batchId, notice);
}

const batchTransitions = {
  fechar: { run: batches.closeBatch, notice: "fechado" },
  reabrir: { run: batches.reopenBatch, notice: "reaberto" },
  cancelar: { run: batches.cancelBatch, notice: "cancelado" },
};

export async function changeBatchStatus(formData: FormData) {
  const adminId = await currentUserId();
  const batchId = String(formData.get("batchId") ?? "");
  const transition = batchTransitions[String(formData.get("transition")) as keyof typeof batchTransitions];

  if (!transition) redirect(`/painel/vestuario/${batchId}`);

  let notice = transition.notice;

  try {
    await transition.run(adminId, batchId);
  } catch (error) {
    if (!(error instanceof BatchError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");

    notice = error.code === "HAS_PAID_ORDERS" ? "campanha-com-pago" : "campanha-mudou";
  }

  revalidatePath("/painel/vestuario");
  finish(batchId, notice);
}

export async function undoOrderPayment(
  _previous: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const adminId = await currentUserId();
  const batchId = String(formData.get("batchId") ?? "");

  try {
    await orders.undoPayment(
      adminId,
      String(formData.get("orderId") ?? ""),
      String(formData.get("reason") ?? ""),
    );
  } catch (error) {
    if (!(error instanceof OrderError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");

    return { error: orderErrorMessages[error.code] };
  }

  finish(batchId, "desfeito");
}

export async function saveOrderAsAdmin(
  _previous: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const adminId = await currentUserId();
  const batchId = String(formData.get("batchId") ?? "");
  let notice = "editado";

  try {
    const result = await orders.adminSaveOrder(
      adminId,
      String(formData.get("orderId") ?? ""),
      parseItems(formData.get("items")),
    );

    if (result.resetsPayment) notice = "editado-pendente";
  } catch (error) {
    if (!(error instanceof OrderError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");

    return { error: orderErrorMessages[error.code] };
  }

  finish(batchId, notice);
}
