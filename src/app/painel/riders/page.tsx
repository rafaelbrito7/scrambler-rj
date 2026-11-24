import type { Metadata } from "next";
import Link from "next/link";

import { changeParticipantAccess } from "@/app/actions";
import { AppShell } from "@/components/app/app-shell";
import { ConfirmAction } from "@/components/app/confirm-action";
import { formatDateTime, formatWhatsapp, whatsappLink } from "@/components/app/format";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import type { JoinRequestSummary } from "@/server/access";
import { access } from "@/server/services";
import { requireAdmin } from "@/server/session";

export const metadata: Metadata = { title: "Gestão de riders | Scrambler RJ" };

const notices: Record<string, string> = {
  bloqueado: "Rider bloqueado. O acesso foi cortado e o histórico ficou preservado.",
  desbloqueado: "Rider desbloqueado. O acesso voltou.",
  mudou: "A situação dessa pessoa já tinha mudado. Confira a lista.",
  promovido: "Agora é administrador, com os mesmos poderes dos outros.",
  rebaixado: "Deixou de ser administrador e continua no grupo como rider.",
  "ultimo-admin": "O grupo não pode ficar sem administrador ativo. Promova outra pessoa antes.",
};

function describeBlock(participant: JoinRequestSummary) {
  const decision = participant.lastDecision;

  if (!decision) return "Bloqueado";

  return `Bloqueado por ${decision.authorName} em ${formatDateTime(decision.createdAt)}`;
}

type PageProps = {
  searchParams: Promise<{ aviso?: string }>;
};

export default async function ParticipantsPage({ searchParams }: PageProps) {
  const viewer = await requireAdmin();
  const [{ aviso }, pendingCount, participants] = await Promise.all([
    searchParams,
    access.countPending(viewer.userId),
    access.listParticipants(viewer.userId),
  ]);
  const notice = aviso ? notices[aviso] : undefined;
  const hasNotice = notice !== undefined;
  const blockedCount = participants.filter((participant) => participant.status === "BLOCKED").length;
  const activeCount = participants.length - blockedCount;
  const activeAdminCount = participants.filter(
    (participant) => participant.isAdmin && participant.status === "APPROVED",
  ).length;

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount} area="painel">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Gestão de riders</h1>
          <p className="mt-3 text-cream-dim">
            {activeCount} {activeCount === 1 ? "rider" : "riders"} · {blockedCount} {blockedCount === 1 ? "bloqueado" : "bloqueados"}
          </p>
        </div>
        <Link href="/painel/riders/modelos" className={buttonVariants({ variant: "ghost" })}>
          Modelos de moto
        </Link>
      </div>

      {hasNotice && (
        <Alert role="status" className="mt-5">
          {notice}
        </Alert>
      )}

      <ul className="mt-8 grid gap-4">
        {participants.map((participant) => {
          const isBlocked = participant.status === "BLOCKED";
          const isActive = !isBlocked;
          const fields = { requestId: participant.id };
          const isOnlyAdmin = isActive && participant.isAdmin && activeAdminCount === 1;
          const canBlock = isActive && !isOnlyAdmin;
          const canPromote = isActive && !participant.isAdmin;
          const canDemote = isActive && participant.isAdmin && !isOnlyAdmin;

          return (
            <li key={participant.id} className="rounded-sm bg-card p-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <div>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold">
                    <Link
                      href={`/grupo/${participant.userId}`}
                      className="underline decoration-border underline-offset-4 hover:text-highlight hover:decoration-primary"
                    >
                      {participant.fullName}
                    </Link>
                    {participant.isAdmin && <Badge variant="outline">Administrador</Badge>}
                    {isBlocked && <Badge variant="destructive">Bloqueado</Badge>}
                  </p>
                  <p className="mt-0.5 text-sm text-cream-dim">
                    {participant.bikeModel}, {participant.engineSize} cilindradas
                  </p>
                </div>
                <a
                  href={whatsappLink(participant.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 underline decoration-primary decoration-2 underline-offset-[6px] hover:text-highlight"
                >
                  {formatWhatsapp(participant.whatsapp)}
                </a>
              </div>

              {isBlocked && <p className="mt-3 text-sm text-destructive">{describeBlock(participant)}</p>}

              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                {canPromote && (
                  <ConfirmAction
                    label={
                      <>
                        Tornar administrador<span className="sr-only"> {participant.fullName}</span>
                      </>
                    }
                    question={`Tornar ${participant.fullName} administrador? A pessoa passa a aprovar pedidos, gerenciar vestuário, passeios e riders.`}
                    confirmLabel="Sim, tornar administrador"
                    keepLabel="Deixar como está"
                    action={changeParticipantAccess}
                    fields={{ ...fields, change: "promover" }}
                  />
                )}
                {canDemote && (
                  <ConfirmAction
                    label={
                      <>
                        Tirar administração<span className="sr-only"> de {participant.fullName}</span>
                      </>
                    }
                    question={`Tirar a administração de ${participant.fullName}? A pessoa continua no grupo como rider.`}
                    confirmLabel="Sim, tirar administração"
                    keepLabel="Deixar como está"
                    action={changeParticipantAccess}
                    fields={{ ...fields, change: "rebaixar" }}
                  />
                )}
                {isOnlyAdmin && (
                  <p className="text-sm text-cream-dim">
                    Único administrador ativo: não pode ser bloqueado nem perder a administração.
                  </p>
                )}
                {canBlock && (
                  <ConfirmAction
                    label={
                      <>
                        Bloquear<span className="sr-only"> {participant.fullName}</span>
                      </>
                    }
                    question={`Bloquear ${participant.fullName}? A pessoa perde o acesso na hora. Pedidos, pagamentos e presenças continuam registrados.`}
                    confirmLabel="Sim, bloquear"
                    keepLabel="Manter acesso"
                    action={changeParticipantAccess}
                    fields={{ ...fields, change: "bloquear" }}
                  />
                )}
                {isBlocked && (
                  <form action={changeParticipantAccess} className="w-full sm:w-auto">
                    <input type="hidden" name="requestId" value={participant.id} />
                    <input type="hidden" name="change" value="desbloquear" />
                    <Button type="submit" variant="outline" className="w-full">
                      Desbloquear<span className="sr-only"> {participant.fullName}</span>
                    </Button>
                  </form>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
