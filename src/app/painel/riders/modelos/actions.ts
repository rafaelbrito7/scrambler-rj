"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { BikeModelError } from "@/server/bike-model-list";
import { bikeModels } from "@/server/services";

const page = "/painel/riders/modelos";

async function currentAdminId() {
  const session = await auth();
  const adminId = session?.user?.id;

  if (!adminId) redirect("/");

  return adminId;
}

const problems = { INVALID_INPUT: "invalido", DUPLICATE: "repetido", NOT_FOUND: "mudou" };

async function run(change: (adminId: string) => Promise<unknown>, notice: string) {
  const adminId = await currentAdminId();
  let result = notice;

  try {
    await change(adminId);
  } catch (error) {
    if (!(error instanceof BikeModelError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");

    result = problems[error.code];
  }

  // Bike names show across the group's screens, and the list feeds the bike forms.
  revalidatePath("/", "layout");
  redirect(`${page}?aviso=${result}`);
}

function readModel(formData: FormData) {
  return { name: String(formData.get("name") ?? ""), engineSize: String(formData.get("engineSize") ?? "") };
}

export async function addBikeModel(formData: FormData) {
  await run((adminId) => bikeModels.addModel(adminId, readModel(formData)), "incluido");
}

export async function saveBikeModel(formData: FormData) {
  const modelId = String(formData.get("modelId") ?? "");

  await run((adminId) => bikeModels.updateModel(adminId, modelId, readModel(formData)), "salvo");
}

export async function changeBikeModel(formData: FormData) {
  const modelId = String(formData.get("modelId") ?? "");
  const change = String(formData.get("change") ?? "");

  if (change === "subir" || change === "descer") {
    await run((adminId) => bikeModels.moveModel(adminId, modelId, change === "subir" ? "up" : "down"), "movido");
  }

  const isKnownChange = change === "ativar" || change === "desativar";

  if (!isKnownChange) redirect(`${page}?aviso=mudou`);

  const isActivating = change === "ativar";

  await run(
    (adminId) => bikeModels.setModelActive(adminId, modelId, isActivating),
    isActivating ? "ativado" : "desativado",
  );
}
