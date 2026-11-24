import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { changeComeback } from "@/app/vestuario/actions";
import { AppShell } from "@/components/app/app-shell";
import { BatchCard } from "@/components/app/batch-card";
import { countLabel, formatMonthYear, formatPrice, peopleLabel } from "@/components/app/format";
import { PeopleStack } from "@/components/app/people-stack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CatalogEntry } from "@/server/batches";
import { access, batches, orders } from "@/server/services";
import { requireState } from "@/server/session";

export const metadata: Metadata = { title: "Vestuário | Scrambler RJ" };

function PastGarment({ entry, viewerId }: { entry: CatalogEntry; viewerId: string }) {
  const { batch, wanted } = entry;
  const href = `/vestuario/${batch.id}`;
  const hasAsked = wanted.mine;
  const cameBackBefore = entry.campaignCount > 1;

  return (
    <li className="flex flex-col rounded-sm bg-card">
      <Link href={href} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-sm">
          <Image
            src={`/fotos/${batch.colors[0].photoKey}`}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 640px) 18rem, 100vw"
            className="object-cover"
          />
        </div>
        <div className="px-5 pt-5">
          <h3 className="display text-2xl group-hover:underline group-hover:underline-offset-4">
            {batch.model}
          </h3>
          <p className="mt-2 text-sm text-cream-dim">
            Última campanha em {formatMonthYear(batch.openedAt)} · {formatPrice(batch.unitPriceCents)}
          </p>
          {cameBackBefore && (
            <p className="mt-1 text-sm text-cream-dim">
              Já teve {countLabel(entry.campaignCount, "campanha", "campanhas")}
            </p>
          )}
        </div>
      </Link>

      <div className="px-5 pt-2">
        <PeopleStack
          people={wanted.people}
          viewerId={viewerId}
          title="Quem quer de volta"
          label={peopleLabel(wanted.people.length, "quer de volta", "querem de volta", "Ninguém pediu a volta ainda")}
        />
      </div>

      <form action={changeComeback} className="mt-4 flex flex-1 flex-col justify-end gap-3 border-t border-border p-5">
        <input type="hidden" name="batchId" value={batch.id} />
        {hasAsked && (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <Badge variant="attention">Você pediu a volta</Badge>
            <Button type="submit" name="change" value="desfazer" variant="ghost" size="inline">
              Desfazer<span className="sr-only"> o pedido de volta de {batch.model}</span>
            </Button>
          </div>
        )}
        {!hasAsked && (
          <Button type="submit" name="change" value="pedir" variant="outline" className="w-full">
            Quero de volta<span className="sr-only">: {batch.model}</span>
          </Button>
        )}
      </form>
    </li>
  );
}

export default async function GarmentsPage() {
  const viewer = await requireState("approved");
  const [pendingCount, catalog] = await Promise.all([
    viewer.isAdmin ? access.countPending(viewer.userId) : 0,
    batches.listCatalog(viewer.userId),
  ]);
  const active = catalog.filter((entry) => !entry.canRequest).map((entry) => entry.batch);
  const past = catalog.filter((entry) => entry.canRequest);
  const statsByBatch = await orders.summarizeBatches(viewer.userId, active);
  const hasActive = active.length > 0;
  const hasPast = past.length > 0;
  const isEmpty = !hasActive && !hasPast;

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount}>
      <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Vestuário</h1>
      <p className="mt-3 max-w-[34rem] leading-relaxed text-cream-dim">
        Tudo o que o grupo já fez. Perdeu alguma peça? Peça a volta: quando juntar gente, os
        administradores abrem uma campanha nova.
      </p>

      <section aria-labelledby="active-title" className="mt-10">
        <h2 id="active-title" className="label text-foreground">
          Em campanha
        </h2>
        {hasActive && (
          <ul className="mt-4 grid gap-5 sm:grid-cols-2">
            {active.map((batch, index) => {
              const stats = statsByBatch.get(batch.id);

              if (!stats) return null;

              return (
                <BatchCard key={batch.id} batch={batch} stats={stats} viewerId={viewer.userId} isFirst={index === 0} />
              );
            })}
          </ul>
        )}
        {!hasActive && <p className="mt-3 text-cream-dim">Nenhuma campanha aberta agora.</p>}
      </section>

      {hasPast && (
        <section aria-labelledby="past-title" className="mt-12">
          <h2 id="past-title" className="label text-foreground">
            Já tivemos: {past.length}
          </h2>
          <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((entry) => (
              <PastGarment key={entry.batch.id} entry={entry} viewerId={viewer.userId} />
            ))}
          </ul>
        </section>
      )}
      {isEmpty && (
        <p className="mt-8 max-w-[34rem] leading-relaxed text-cream-dim">
          O grupo ainda não fez nenhuma peça. A primeira campanha aparece aqui.
        </p>
      )}
    </AppShell>
  );
}
