"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  auth,
  isGoogleConfigured,
  isTestLoginEnabled,
  signIn,
  signOut,
  TEST_LOGIN_PROVIDER,
  type TestAccountKind,
} from "@/auth";
import { AccessError, type JoinRequestField, type JoinRequestInput } from "@/server/access";
import { safeReturnPath } from "@/server/return-path";
import { access } from "@/server/services";

async function currentUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/");

  return userId;
}

async function signInAs(kind: TestAccountKind, redirectTo: string) {
  if (isGoogleConfigured) await signIn("google", { redirectTo });
  if (!isTestLoginEnabled) redirect("/");

  await signIn(TEST_LOGIN_PROVIDER, { kind, redirectTo });
}

export async function signInWithGoogle(formData: FormData) {
  const returnTo = safeReturnPath(String(formData.get("voltar") ?? ""));

  await signInAs("participant", returnTo ?? "/");
}

// Development only: the same entry, signed in as the test administrator. With Google
// configured there is one account per person and the role comes from that account.
export async function signInAsTestAdministrator(formData: FormData) {
  if (!isTestLoginEnabled) redirect("/");

  const returnTo = safeReturnPath(String(formData.get("voltar") ?? ""));

  await signIn(TEST_LOGIN_PROVIDER, { kind: "admin", redirectTo: returnTo ?? "/" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export type JoinRequestFormState = {
  values: JoinRequestInput;
  fieldErrors: Partial<Record<JoinRequestField, string>>;
  formError: string | null;
};

export async function submitJoinRequest(
  _previous: JoinRequestFormState,
  formData: FormData,
): Promise<JoinRequestFormState> {
  const userId = await currentUserId();
  const values: JoinRequestInput = {
    fullName: String(formData.get("fullName") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    bikeModel: String(formData.get("bikeModel") ?? ""),
    engineSize: String(formData.get("engineSize") ?? ""),
  };

  try {
    await access.submitJoinRequest(userId, values);
  } catch (error) {
    if (!(error instanceof AccessError)) throw error;

    if (error.code === "INVALID_INPUT") {
      return { values, fieldErrors: error.fieldErrors, formError: null };
    }

    if (error.code !== "ALREADY_REQUESTED") {
      return {
        values,
        fieldErrors: {},
        formError: "Não foi possível enviar o pedido. Saia e entre de novo.",
      };
    }
  }

  redirect("/");
}

export async function decideJoinRequest(formData: FormData) {
  const adminId = await currentUserId();
  const requestId = String(formData.get("requestId") ?? "");
  const decision = formData.get("decision") === "approve" ? "approve" : "reject";
  let notice = decision === "approve" ? "aprovado" : "reprovado";

  try {
    await access.decide(adminId, requestId, decision);
  } catch (error) {
    if (!(error instanceof AccessError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");

    notice = "ja-avaliado";
  }

  revalidatePath("/painel/avaliacoes");
  redirect(`/painel/avaliacoes?aviso=${notice}`);
}

export async function revertJoinRequestRejection(formData: FormData) {
  const adminId = await currentUserId();
  const requestId = String(formData.get("requestId") ?? "");
  let notice = "revertido";

  try {
    await access.revertRejection(adminId, requestId);
  } catch (error) {
    if (!(error instanceof AccessError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");

    notice = "ja-avaliado";
  }

  revalidatePath("/painel/avaliacoes");
  redirect(`/painel/avaliacoes?aviso=${notice}`);
}

const participantChanges = {
  bloquear: { run: access.block, notice: "bloqueado" },
  desbloquear: { run: access.unblock, notice: "desbloqueado" },
  promover: { run: access.promote, notice: "promovido" },
  rebaixar: { run: access.demote, notice: "rebaixado" },
};

export async function changeParticipantAccess(formData: FormData) {
  const adminId = await currentUserId();
  const requestId = String(formData.get("requestId") ?? "");
  const change = participantChanges[String(formData.get("change")) as keyof typeof participantChanges];

  if (!change) redirect("/painel/riders");

  let notice = change.notice;

  try {
    await change.run(adminId, requestId);
  } catch (error) {
    if (!(error instanceof AccessError)) throw error;
    if (error.code === "FORBIDDEN") redirect("/");

    notice = error.code === "LAST_ADMIN" ? "ultimo-admin" : "mudou";
  }

  revalidatePath("/painel/riders");
  redirect(`/painel/riders?aviso=${notice}`);
}
