import type { Metadata } from "next";

import { decideJoinRequest, revertJoinRequestRejection } from "@/app/actions";
import { RequestProfile } from "@/app/painel/avaliacoes/request-profile";
import { AppShell } from "@/components/app/app-shell";
import { formatDateTime } from "@/components/app/format";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { JoinRequestSummary } from "@/server/access";
import { access } from "@/server/services";
import { requireAdmin } from "@/server/session";

export const metadata: Metadata = { title: "Avaliações de perfil | Scrambler RJ" };

const notices: Record<string, string> = {
  aprovado: "Pedido aprovado. A pessoa já pode entrar.",
  reprovado: "Pedido reprovado.",
  revertido: "Reprovação revertida. A pessoa já pode entrar.",
  "ja-avaliado": "Esse pedido já tinha sido avaliado por outro administrador.",
};

const outcomeLabels = {
  APPROVED: "Aprovado",
  REJECTED: "Reprovado",
  REVERTED: "Aprovado após reverter a reprovação",
  BLOCKED: "Bloqueado",
  UNBLOCKED: "Desbloqueado",
  PROMOTED: "Tornado administrador",
  DEMOTED: "Deixou de ser administrador",
};

const situationLabels = {
  PENDING: "Em avaliação",
  APPROVED: "Rider",
  REJECTED: "Reprovado",
  BLOCKED: "Bloqueado",
};

const situationVariants = {
  PENDING: "attention",
  APPROVED: "default",
  REJECTED: "destructive",
  BLOCKED: "destructive",
} as const;

function describeOutcome(request: JoinRequestSummary) {
  const decision = request.lastDecision;

  if (!decision) return "";

  return `${outcomeLabels[decision.kind]} por ${decision.authorName} em ${formatDateTime(decision.createdAt)}`;
}

type PageProps = {
  searchParams: Promise<{ aviso?: string }>;
};

export default async function ProfileReviewsPage({ searchParams }: PageProps) {
  const viewer = await requireAdmin();
  const [{ aviso }, pending, decided] = await Promise.all([
    searchParams,
    access.listPending(viewer.userId),
    access.listDecided(viewer.userId),
  ]);
  const notice = aviso ? notices[aviso] : undefined;
  const hasNotice = notice !== undefined;
  const hasPending = pending.length > 0;
  const hasDecided = decided.length > 0;

  return (
    <AppShell viewer={viewer} pendingCount={pending.length} area="painel">
      <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Avaliações de perfil</h1>

      {hasNotice && (
        <Alert role="status" className="mt-5">
          {notice}
        </Alert>
      )}

      <section aria-labelledby="pending-title" className="mt-10">
        <h2 id="pending-title" className="label text-foreground">
          Em avaliação: {pending.length}
        </h2>

        {hasPending && (
          <ul className="mt-4 grid gap-4">
            {pending.map((request) => (
              <li key={request.id} className="rounded-[2px] bg-asphalt-raised p-5 sm:p-6">
                <RequestProfile request={request} />

                <form action={decideJoinRequest} className="mt-6 grid gap-2 sm:flex">
                  <input type="hidden" name="requestId" value={request.id} />
                  <Button type="submit" name="decision" value="approve">
                    Aprovar
                  </Button>
                  <Button type="submit" name="decision" value="reject" variant="outline">
                    Reprovar
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
        {!hasPending && (
          <p className="mt-4 leading-relaxed text-cream-dim">
            Nenhum pedido em avaliação.
          </p>
        )}
      </section>

      <section aria-labelledby="decided-title" className="mt-14">
        <h2 id="decided-title" className="label text-foreground">
          Já avaliados
        </h2>

        {hasDecided && (
          <ul className="mt-4 divide-y divide-cream/15 border-y border-cream/15">
            {decided.map((request) => {
              const isRejected = request.status === "REJECTED";

              return (
                <li
                  key={request.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold">
                      {request.fullName}
                      <Badge variant={situationVariants[request.status]}>
                        {situationLabels[request.status]}
                      </Badge>
                    </p>
                    <p className="mt-0.5 text-sm text-cream-dim">
                      {request.bikeModel}, {request.engineSize} cilindradas
                    </p>
                    <p className="mt-1 text-sm text-cream-dim">{describeOutcome(request)}</p>
                  </div>

                  {isRejected && (
                    <form action={revertJoinRequestRejection}>
                      <input type="hidden" name="requestId" value={request.id} />
                      <Button type="submit" variant="outline" className="w-full sm:w-auto">
                        Reverter reprovação
                      </Button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {!hasDecided && (
          <p className="mt-4 leading-relaxed text-cream-dim">
            Nenhum pedido avaliado ainda.
          </p>
        )}
      </section>
    </AppShell>
  );
}
