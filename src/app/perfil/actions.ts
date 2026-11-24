"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  type BikeInput,
  type ModInput,
  type PersonalDataInput,
  type PhotoChange,
  ProfileError,
  type ProfileFieldErrors,
} from "@/server/profiles";
import { profiles } from "@/server/services";

export type ProfileFormState = {
  values: PersonalDataInput;
  fieldErrors: ProfileFieldErrors;
  attempt: number;
};

async function readPhotoChange(formData: FormData): Promise<PhotoChange> {
  const upload = formData.get("photo");
  const file = upload instanceof File && upload.size > 0 ? upload : null;

  if (file) {
    return {
      kind: "replace",
      photo: { bytes: new Uint8Array(await file.arrayBuffer()), contentType: file.type },
    };
  }

  return { kind: formData.get("removePhoto") === "1" ? "remove" : "keep" };
}

export async function savePersonalData(
  previous: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/");

  const read = (name: keyof PersonalDataInput) => String(formData.get(name) ?? "");
  const values: PersonalDataInput = {
    fullName: read("fullName"),
    nickname: read("nickname"),
    instagram: read("instagram"),
    region: read("region"),
    experience: read("experience"),
    bio: read("bio"),
    birthday: read("birthday"),
    whatsapp: read("whatsapp"),
    shirtSize: read("shirtSize"),
    emergencyName: read("emergencyName"),
    emergencyPhone: read("emergencyPhone"),
    bloodType: read("bloodType"),
    emergencyName2: read("emergencyName2"),
    emergencyPhone2: read("emergencyPhone2"),
    healthPlan: read("healthPlan"),
    healthPlanCard: read("healthPlanCard"),
    healthNotes: read("healthNotes"),
  };

  const photoChange = await readPhotoChange(formData);

  try {
    await profiles.updatePersonalData(userId, values, photoChange);
  } catch (error) {
    if (!(error instanceof ProfileError)) throw error;
    if (error.code !== "INVALID_INPUT") redirect("/");

    return { values, fieldErrors: error.fieldErrors, attempt: previous.attempt + 1 };
  }

  // The name shows up on every list, so everything is refreshed.
  revalidatePath("/", "layout");
  redirect("/perfil?aviso=salvo");
}

export type BikeFormState = {
  values: BikeInput;
  fieldErrors: ProfileFieldErrors;
  formError: string | null;
  attempt: number;
};

const bikeMessages: Partial<Record<ProfileError["code"], string>> = {
  BIKE_LIMIT: "Você já tem cinco motos no perfil. Remova uma para adicionar outra.",
  LAST_BIKE: "O perfil precisa de ao menos uma moto.",
  NOT_FOUND: "Essa moto não está mais no seu perfil.",
};

async function currentUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/");

  return userId;
}

export async function saveBike(
  previous: BikeFormState,
  formData: FormData,
): Promise<BikeFormState> {
  const userId = await currentUserId();
  const bikeId = String(formData.get("bikeId") ?? "");
  const isEditing = bikeId !== "";
  const read = (name: keyof BikeInput) => String(formData.get(name) ?? "");
  const values: BikeInput = {
    model: read("model"),
    engineSize: read("engineSize"),
    year: read("year"),
    color: read("color"),
    nickname: read("nickname"),
    rangeKm: read("rangeKm"),
  };
  const photoChange = await readPhotoChange(formData);

  try {
    if (isEditing) await profiles.updateBike(userId, bikeId, values, photoChange);
    else await profiles.addBike(userId, values, photoChange);
  } catch (error) {
    if (!(error instanceof ProfileError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");

    return {
      values,
      fieldErrors: error.fieldErrors,
      formError: bikeMessages[error.code] ?? null,
      attempt: previous.attempt + 1,
    };
  }

  revalidatePath("/", "layout");
  redirect(`/perfil?aviso=${isEditing ? "moto-salva" : "moto-adicionada"}`);
}

export async function changeBike(formData: FormData) {
  const userId = await currentUserId();
  const bikeId = String(formData.get("bikeId") ?? "");
  const isRemoving = formData.get("change") === "remover";
  let notice = isRemoving ? "moto-removida" : "moto-principal";

  try {
    if (isRemoving) await profiles.removeBike(userId, bikeId);
    else await profiles.setMainBike(userId, bikeId);
  } catch (error) {
    if (!(error instanceof ProfileError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");

    notice = error.code === "LAST_BIKE" ? "ultima-moto" : "moto-mudou";
  }

  revalidatePath("/", "layout");
  redirect(`/perfil?aviso=${notice}`);
}

export async function clearEmergencyData() {
  const userId = await currentUserId();

  try {
    await profiles.clearEmergencyData(userId);
  } catch (error) {
    if (!(error instanceof ProfileError)) throw error;

    redirect("/");
  }

  revalidatePath("/perfil");
  redirect("/perfil?aviso=emergencia-apagada");
}

export async function dismissProfileReminder() {
  const userId = await currentUserId();

  try {
    await profiles.dismissReminder(userId);
  } catch (error) {
    if (!(error instanceof ProfileError)) throw error;

    redirect("/");
  }

  revalidatePath("/inicio");
  redirect("/inicio");
}

export type ModFormState = {
  values: ModInput;
  fieldErrors: ProfileFieldErrors;
  formError: string | null;
  attempt: number;
};

export async function saveBikeMod(
  previous: ModFormState,
  formData: FormData,
): Promise<ModFormState> {
  const userId = await currentUserId();
  const bikeId = String(formData.get("bikeId") ?? "");
  const modId = String(formData.get("modId") ?? "");
  const isEditing = modId !== "";
  const values: ModInput = {
    category: String(formData.get("category") ?? ""),
    description: String(formData.get("description") ?? ""),
  };

  try {
    if (isEditing) await profiles.updateBikeMod(userId, modId, values);
    else await profiles.addBikeMod(userId, bikeId, values);
  } catch (error) {
    if (!(error instanceof ProfileError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");
    if (error.code === "NOT_FOUND") redirect("/perfil?aviso=moto-mudou");

    const isFull = error.code === "MOD_LIMIT";

    return {
      values,
      fieldErrors: error.fieldErrors,
      formError: isFull ? "Vinte itens é o limite por moto. Remova um para incluir outro." : null,
      attempt: previous.attempt + 1,
    };
  }

  revalidatePath("/", "layout");
  redirect(`/perfil/motos/${bikeId}?aviso=${isEditing ? "item-salvo" : "item-incluido"}#modificacoes`);
}

export async function removeBikeMod(formData: FormData) {
  const userId = await currentUserId();
  const bikeId = String(formData.get("bikeId") ?? "");
  const modId = String(formData.get("modId") ?? "");

  try {
    await profiles.removeBikeMod(userId, modId);
  } catch (error) {
    if (!(error instanceof ProfileError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");
  }

  revalidatePath("/", "layout");
  redirect(`/perfil/motos/${bikeId}?aviso=item-removido#modificacoes`);
}
