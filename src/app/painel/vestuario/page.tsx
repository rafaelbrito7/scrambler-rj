import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { formatDateTime, formatMonthYear, formatPrice, peopleLabel } from "@/components/app/format";
import { PeopleStack } from "@/components/app/people-stack";
import { BatchStatusBadge } from "@/components/app/status-badge";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { access, batches } from "@/server/services";
import { requireAdmin } from "@/server/session";

export const metadata: Metadata = { title: "Vestuário | Scrambler RJ" };

const notices: Record<string, string> = {
  aberto: "Campanha aberta. Ela já aparece no Início dos riders.",
  "volta-mudou": "Essa peça não pode mais ser trazida de volta: a campanha dela mudou de situação.",
};

type PageProps = {
  searchParams: Promise<{ aviso?: string }>;
};

export default async function BatchesPage({ searchParams }: PageProps) {
  const viewer = await requireAdmin();
  const [{ aviso }, pendingCount, allBatches, catalog] = await Promise.all([
    searchParams,
    access.countPending(viewer.userId),
    batches.listAll(viewer.userId),
    batches.listCatalog(viewer.userId),
  ]);
  const wantedBack = catalog.filter((entry) => entry.canRequest && entry.wanted.people.length > 0);
  const hasWantedBack = wantedBack.length > 0;
  const notice = aviso ? notices[aviso] : undefined;
  const hasNotice = notice !== undefined;
  const hasBatches = allBatches.length > 0;

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount} area="painel">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Vestuário</h1>
        <div className="grid gap-2 sm:flex sm:flex-row-reverse">
          <Link href="/painel/vestuario/novo" className={buttonVariants()}>
            Abrir campanha
          </Link>
          <Link href="/painel/templates" className={buttonVariants({ variant: "ghost" })}>
            Templates
          </Link>
        </div>
      </div>

      {hasNotice && (
        <Alert role="status" className="mt-5">
          {notice}
        </Alert>
      )}

      {hasWantedBack && (
        <section aria-labelledby="wanted-title" className="mt-8 rounded-sm bg-card p-5">
          <h2 id="wanted-title" className="label text-foreground">
            Pedidos de volta
          </h2>
          <p className="mt-2 max-w-[34rem] text-sm text-cream-dim">
            Peças de campanhas fechadas que os riders querem de novo, da mais pedida para a menos.
          </p>
          <ul className="mt-3 divide-y divide-border">
            {wantedBack.map(({ batch, wanted }) => (
              <li
                key={batch.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{batch.model}</p>
                  <p className="text-sm text-cream-dim">
                    Última campanha em {formatMonthYear(batch.openedAt)}
                  </p>
                  <PeopleStack
                    people={wanted.people}
                    viewerId={viewer.userId}
                    title="Quem quer de volta"
                    label={peopleLabel(wanted.people.length, "quer de volta", "querem de volta", "")}
                    naming="record"
                  />
                </div>
                <Link
                  href={`/painel/vestuario/novo?volta=${batch.id}`}
                  className={buttonVariants({ variant: "outline", className: "w-full shrink-0 sm:w-auto" })}
                >
                  Abrir nova campanha<span className="sr-only"> de {batch.model}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasBatches && (
        <ul className="mt-10 divide-y divide-cream/15 border-y border-cream/15">
          {allBatches.map((batch) => (
            <li
              key={batch.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">
                  {batch.model} · {formatPrice(batch.unitPriceCents)}
                </p>
                <p className="mt-0.5 text-sm text-cream-dim">
                  {batch.colors.map((color) => color.name).join(", ")} · {batch.sizes.join(", ")}
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <BatchStatusBadge status={batch.status} />
                  <span className="text-cream-dim">aberta em {formatDateTime(batch.openedAt)}</span>
                </p>
              </div>

              <Link
                href={`/painel/vestuario/${batch.id}`}
                className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
              >
                Pedidos<span className="sr-only"> de {batch.model}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {!hasBatches && (
        <p className="mt-10 max-w-[34rem] leading-relaxed text-cream-dim">
          Nenhuma campanha ainda. Abra a primeira para os riders começarem a pedir.
        </p>
      )}
    </AppShell>
  );
}
