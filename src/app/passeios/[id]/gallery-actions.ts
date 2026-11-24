"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { GalleryError } from "@/server/gallery";
import { gallery } from "@/server/services";

const uploadMessages: Record<GalleryError["code"], string> = {
  FORBIDDEN: "Você não tem acesso a este passeio.",
  NOT_FOUND: "Este passeio não existe mais.",
  GALLERY_CLOSED: "A galeria deste passeio não está aberta.",
  DID_NOT_ATTEND: "Só quem fez o passeio envia fotos.",
  INVALID_PHOTO: "Use fotos JPG, PNG ou WebP de até 12 MB.",
  RIDER_LIMIT: "Você já enviou dez fotos deste passeio.",
  RIDE_LIMIT: "A galeria deste passeio está cheia.",
};

async function currentUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/");

  return userId;
}

// One photo per call, so a long batch from a phone never hits the request size limit and the
// person sees each one land.
export async function uploadRidePhoto(rideId: string, formData: FormData) {
  const userId = await currentUserId();
  const entry = formData.get("photo");

  if (!(entry instanceof File) || entry.size === 0) return { error: uploadMessages.INVALID_PHOTO };

  try {
    await gallery.addPhoto(userId, rideId, {
      bytes: new Uint8Array(await entry.arrayBuffer()),
      contentType: entry.type,
    });
  } catch (error) {
    if (!(error instanceof GalleryError)) throw error;

    return { error: uploadMessages[error.code] };
  }

  revalidatePath(`/passeios/${rideId}`);
  revalidatePath("/painel/passeios");

  return { error: null };
}

export async function changeRidePhoto(formData: FormData) {
  const userId = await currentUserId();
  const rideId = String(formData.get("rideId") ?? "");
  const photoId = String(formData.get("photoId") ?? "");
  const isApproving = formData.get("change") === "aprovar";
  let notice = isApproving ? "foto-aprovada" : "foto-apagada";

  try {
    if (isApproving) await gallery.approvePhoto(userId, photoId);
    else await gallery.removePhoto(userId, photoId);
  } catch (error) {
    if (!(error instanceof GalleryError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");

    notice = "mudou";
  }

  revalidatePath(`/passeios/${rideId}`);
  revalidatePath("/painel/passeios");
  redirect(`/passeios/${rideId}?aviso=${notice}#fotos`);
}
