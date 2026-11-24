"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { isAcceptedPhotoType, MAX_PHOTO_BYTES } from "@/server/photo-storage";
import type { StopInput } from "@/server/ride-options";
import { MAX_GPX_BYTES } from "@/server/gpx";
import { GPX_TOO_LARGE_MESSAGE, RideError, type RideFieldErrors, type TrackChange } from "@/server/rides";
import { access, photos, rides } from "@/server/services";

export type RideFormValues = {
  route: string;
  description: string;
  date: string;
  meetingTime: string;
  departureTime: string;
  returnTime: string;
  mapUrl: string;
  distanceKm: string;
  surface: string;
  difficulty: string;
  rideTime: string;
  tolls: string;
  tipIds: string[];
  packingNote: string;
  planB: string;
  stops: StopInput[];
};

export type RideFormState = {
  values: RideFormValues;
  fieldErrors: RideFieldErrors & { photo?: string };
  attempt: number;
};

function readStops(formData: FormData): StopInput[] {
  try {
    const parsed: unknown = JSON.parse(String(formData.get("stops") ?? "[]"));

    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: Record<string, unknown>) => ({
      kind: String(item?.kind ?? ""),
      name: String(item?.name ?? ""),
      place: String(item?.place ?? ""),
      time: String(item?.time ?? ""),
      note: String(item?.note ?? ""),
      lat: String(item?.lat ?? ""),
      lon: String(item?.lon ?? ""),
    }));
  } catch {
    return [];
  }
}

// Publishes a new ride, or saves an existing one when the form carries its id.
export async function saveRide(
  previous: RideFormState,
  formData: FormData,
): Promise<RideFormState> {
  const attempt = previous.attempt + 1;
  const session = await auth();
  const adminId = session?.user?.id;

  if (!adminId || !(await access.getAccess(adminId)).isAdmin) redirect("/");

  const rideId = String(formData.get("rideId") ?? "");
  const isEditing = rideId !== "";
  const read = (name: string) => String(formData.get(name) ?? "");
  const values: RideFormValues = {
    route: read("route"),
    description: read("description"),
    date: read("date"),
    meetingTime: read("meetingTime"),
    departureTime: read("departureTime"),
    returnTime: read("returnTime"),
    mapUrl: read("mapUrl"),
    distanceKm: read("distanceKm"),
    surface: read("surface"),
    difficulty: read("difficulty"),
    rideTime: read("rideTime"),
    tolls: read("tolls"),
    tipIds: formData.getAll("tipIds").map(String),
    packingNote: read("packingNote"),
    planB: read("planB"),
    stops: readStops(formData),
  };
  const entry = formData.get("photo");
  const file = entry instanceof File && entry.size > 0 ? entry : null;
  const isRejectedPhoto =
    file !== null && (!isAcceptedPhotoType(file.type) || file.size > MAX_PHOTO_BYTES);

  if (isRejectedPhoto) {
    return {
      values,
      fieldErrors: { photo: "Use uma foto JPG, PNG ou WebP de até 5 MB." },
      attempt,
    };
  }

  const gpxEntry = formData.get("gpx");
  const gpxFile = gpxEntry instanceof File && gpxEntry.size > 0 ? gpxEntry : null;

  // Refused before reading: the limit is on the file, whatever it holds.
  if (gpxFile !== null && gpxFile.size > MAX_GPX_BYTES) {
    return {
      values,
      fieldErrors: { gpx: GPX_TOO_LARGE_MESSAGE },
      attempt,
    };
  }

  const wantsTrackRemoved = formData.get("removeTrack") === "on";
  let track: TrackChange = wantsTrackRemoved ? { kind: "remove" } : { kind: "keep" };

  // A new file wins over the box that removes the old one.
  if (gpxFile !== null) track = { kind: "replace", gpx: await gpxFile.text() };

  let photoKey: string | null = null;
  let savedId = rideId;

  try {
    if (file) {
      photoKey = await photos.save({
        bytes: new Uint8Array(await file.arrayBuffer()),
        contentType: file.type,
      });
    }

    if (isEditing) {
      const { replacedPhotoKey } = await rides.updateRide(adminId, rideId, { ...values, photoKey, track });

      if (replacedPhotoKey) await photos.remove(replacedPhotoKey);
    } else {
      savedId = (await rides.publishRide(adminId, { ...values, photoKey, track })).id;
    }
  } catch (error) {
    if (photoKey) await photos.remove(photoKey);

    if (!(error instanceof RideError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");
    if (error.code !== "INVALID_INPUT") redirect(`/passeios/${rideId}?aviso=mudou`);

    return { values, fieldErrors: error.fieldErrors, attempt };
  }

  revalidatePath("/inicio");
  revalidatePath("/painel/passeios");
  revalidatePath(`/passeios/${savedId}`);

  if (isEditing) redirect(`/passeios/${savedId}?aviso=salvo`);

  redirect("/painel/passeios?aviso=publicado");
}

const rideTransitions = {
  encerrar: { run: rides.closeRide, notice: "encerrado" },
  reabrir: { run: rides.reopenRide, notice: "reaberto" },
  cancelar: { run: rides.cancelRide, notice: "cancelado" },
};

export async function changeRideStatus(formData: FormData) {
  const session = await auth();
  const adminId = session?.user?.id;

  if (!adminId) redirect("/");

  const rideId = String(formData.get("rideId") ?? "");
  const transition =
    rideTransitions[String(formData.get("transition")) as keyof typeof rideTransitions];

  if (!transition) redirect(`/passeios/${rideId}`);

  let notice = transition.notice;

  try {
    await transition.run(adminId, rideId);
  } catch (error) {
    if (!(error instanceof RideError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");

    notice = "mudou";
  }

  revalidatePath("/inicio");
  revalidatePath("/painel/passeios");
  revalidatePath(`/passeios/${rideId}`);
  redirect(`/passeios/${rideId}?aviso=${notice}`);
}

const attendanceChanges: Record<string, boolean | null> = { tirar: false, incluir: true, desfazer: null };

export async function changeAttendance(formData: FormData) {
  const session = await auth();
  const adminId = session?.user?.id;

  if (!adminId) redirect("/");

  const rideId = String(formData.get("rideId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const change = String(formData.get("change") ?? "");
  let notice = "presenca";

  if (!(change in attendanceChanges)) redirect(`/passeios/${rideId}`);

  try {
    await rides.setAttendance(adminId, rideId, userId, attendanceChanges[change]);
  } catch (error) {
    if (!(error instanceof RideError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");

    notice = "mudou";
  }

  revalidatePath("/", "layout");
  redirect(`/passeios/${rideId}?aviso=${notice}#presenca`);
}
