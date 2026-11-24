"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { orderErrorMessages } from "@/app/vestuario/order-messages";
import { auth } from "@/auth";
import { OrderError } from "@/server/orders";
import { orders } from "@/server/services";

export type OrderFormState = {
  error: string | null;
};

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
  redirect(`/vestuario/${batchId}?aviso=${notice}`);
}

export async function saveOrder(
  _previous: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const userId = await currentUserId();
  const batchId = String(formData.get("batchId") ?? "");

  try {
    await orders.saveOrder(userId, batchId, parseItems(formData.get("items")));
  } catch (error) {
    if (!(error instanceof OrderError)) throw error;

    return { error: orderErrorMessages[error.code] };
  }

  finish(batchId, "pedido-salvo");
}

export async function deleteOrder(
  _previous: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const userId = await currentUserId();
  const batchId = String(formData.get("batchId") ?? "");

  try {
    await orders.deleteOrder(userId, batchId);
  } catch (error) {
    if (!(error instanceof OrderError)) throw error;

    return { error: orderErrorMessages[error.code] };
  }

  finish(batchId, "pedido-excluido");
}
