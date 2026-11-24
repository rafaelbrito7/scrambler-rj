"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { RideError } from "@/server/rides";
import { rides } from "@/server/services";

const page = "/painel/passeios/recomendacoes";

async function currentAdminId() {
  const session = await auth();
  const adminId = session?.user?.id;

  if (!adminId) redirect("/");

  return adminId;
}

async function run(change: (adminId: string) => Promise<unknown>, notice: string) {
  const adminId = await currentAdminId();
  let result = notice;

  try {
    await change(adminId);
  } catch (error) {
    if (!(error instanceof RideError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");

    result = error.code === "INVALID_INPUT" ? "invalida" : "mudou";
  }

  revalidatePath("/", "layout");
  redirect(`${page}?aviso=${result}`);
}

function readTip(formData: FormData) {
  return { text: String(formData.get("text") ?? ""), icon: String(formData.get("icon") ?? "") };
}

export async function addTip(formData: FormData) {
  await run((adminId) => rides.addTip(adminId, readTip(formData)), "incluida");
}

export async function saveTip(formData: FormData) {
  const tipId = String(formData.get("tipId") ?? "");

  await run((adminId) => rides.updateTip(adminId, tipId, readTip(formData)), "salva");
}

export async function changeTip(formData: FormData) {
  const tipId = String(formData.get("tipId") ?? "");
  const change = String(formData.get("change") ?? "");

  if (change === "subir" || change === "descer") {
    await run((adminId) => rides.moveTip(adminId, tipId, change === "subir" ? "up" : "down"), "movida");
  }

  const isActivating = change === "ativar";

  await run(
    (adminId) => rides.setTipActive(adminId, tipId, isActivating),
    isActivating ? "ativada" : "desativada",
  );
}
