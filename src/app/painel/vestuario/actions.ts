"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { type GarmentFormState, readGarmentForm } from "@/app/painel/vestuario/garment-form-data";
import { auth } from "@/auth";
import { BatchError } from "@/server/batches";
import { access, batches, recipes } from "@/server/services";

async function currentAdminId() {
  const session = await auth();
  const adminId = session?.user?.id;

  if (!adminId || !(await access.getAccess(adminId)).isAdmin) redirect("/");

  return adminId;
}

async function photoKeysOf(adminId: string, recipeId: string) {
  if (!recipeId) return new Set<string>();

  try {
    const recipe = await recipes.getRecipe(adminId, recipeId);

    return new Set(recipe.colors.map((color) => color.photoKey));
  } catch (error) {
    if (error instanceof BatchError) return new Set<string>();

    throw error;
  }
}

async function batchPhotoKeysOf(adminId: string, batchId: string | null) {
  if (batchId === null) return new Set<string>();

  try {
    const batch = await batches.getBatch(adminId, batchId);

    return new Set(batch.colors.map((color) => color.photoKey));
  } catch (error) {
    if (error instanceof BatchError) return new Set<string>();

    throw error;
  }
}

export async function openBatch(
  previous: GarmentFormState,
  formData: FormData,
): Promise<GarmentFormState> {
  const attempt = previous.attempt + 1;
  const adminId = await currentAdminId();
  const revivedFromId = String(formData.get("revivedFromId") ?? "") || null;
  // Opening from a recipe or from the campaign being brought back may reuse those photos
  // instead of uploading them again.
  const reusableKeys = new Set([
    ...(await photoKeysOf(adminId, String(formData.get("recipeId") ?? ""))),
    ...(await batchPhotoKeysOf(adminId, revivedFromId)),
  ]);
  const form = await readGarmentForm(formData, attempt, reusableKeys);

  if (!form.ok) return form.state;

  try {
    await batches.openBatch(adminId, { ...form.values, colors: form.colors }, revivedFromId);
  } catch (error) {
    await form.discardUploads();

    if (!(error instanceof BatchError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");
    // The campaign being brought back was reopened, cancelled or removed meanwhile.
    if (error.code === "NOT_FOUND" || error.code === "INVALID_STATE") {
      redirect("/painel/vestuario?aviso=volta-mudou");
    }

    return { values: form.values, fieldErrors: error.fieldErrors, attempt };
  }

  revalidatePath("/inicio");
  revalidatePath("/vestuario");
  revalidatePath("/painel/vestuario");
  redirect("/painel/vestuario?aviso=aberto");
}

export async function saveRecipe(
  previous: GarmentFormState,
  formData: FormData,
): Promise<GarmentFormState> {
  const attempt = previous.attempt + 1;
  const adminId = await currentAdminId();
  const recipeId = String(formData.get("recipeId") ?? "");
  const isEditing = recipeId !== "";
  const form = await readGarmentForm(formData, attempt, await photoKeysOf(adminId, recipeId));

  if (!form.ok) return form.state;

  const input = { ...form.values, colors: form.colors };

  try {
    if (isEditing) await recipes.updateRecipe(adminId, recipeId, input);
    else await recipes.createRecipe(adminId, input);
  } catch (error) {
    await form.discardUploads();

    if (!(error instanceof BatchError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");
    if (error.code === "NOT_FOUND") redirect("/painel/templates");

    return { values: form.values, fieldErrors: error.fieldErrors, attempt };
  }

  revalidatePath("/painel/templates");
  redirect(`/painel/templates?aviso=${isEditing ? "atualizada" : "salva"}`);
}
