"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { RideError } from "@/server/rides";
import { rides } from "@/server/services";

export type RideAnswerState = {
  error: string | null;
};

const messages: Record<RideError["code"], string> = {
  FORBIDDEN: "Você não tem acesso a este passeio.",
  NOT_FOUND: "Este passeio não existe mais.",
  RIDE_NOT_OPEN: "As confirmações deste passeio foram encerradas.",
  INVALID_INPUT: "Não deu pra salvar, tenta de novo.",
  INVALID_STATE: "A situação do passeio mudou. Recarregue a página.",
  RIDE_NOT_OVER: "O passeio ainda não saiu.",
};

export async function respondToRide(
  _previous: RideAnswerState,
  formData: FormData,
): Promise<RideAnswerState> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/");

  const rideId = String(formData.get("rideId") ?? "");
  const answer = formData.get("answer") === "GOING" ? "GOING" : "NOT_GOING";

  try {
    await rides.respond(userId, rideId, answer);
  } catch (error) {
    if (!(error instanceof RideError)) return { error: "Não deu pra salvar, tenta de novo." };

    return { error: messages[error.code] };
  }

  revalidatePath("/inicio");
  revalidatePath(`/passeios/${rideId}`);

  return { error: null };
}
