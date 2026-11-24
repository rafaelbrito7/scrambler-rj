"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { BatchError } from "@/server/batches";
import { batches } from "@/server/services";

// A rider asks for a closed garment back, or takes the request back. The page re-renders in
// place; a garment that stopped taking requests meanwhile simply shows its new state.
export async function changeComeback(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/");

  const wants = formData.get("change") === "pedir";

  try {
    await batches.setComeback(userId, String(formData.get("batchId") ?? ""), wants);
  } catch (error) {
    if (!(error instanceof BatchError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");
  }

  revalidatePath("/vestuario");
  revalidatePath("/painel/vestuario");
}
