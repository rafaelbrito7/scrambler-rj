import type { Metadata } from "next";
import Link from "next/link";

import { dismissProfileReminder } from "@/app/perfil/actions";
import { AppShell } from "@/components/app/app-shell";
import { BatchCard } from "@/components/app/batch-card";
import { countLabel } from "@/components/app/format";
import { RideCard } from "@/components/app/ride-card";
import { buttonVariants } from "@/components/ui/button";
import type { BatchSummary } from "@/server/batches";
import type { BatchOrderStats } from "@/server/orders";
import { access, batches, orders, profiles, rides } from "@/server/services";
import { requireState } from "@/server/session";

export const metadata: Metadata = { title: "Início | Scrambler RJ" };

export default async function HomePage() {
  const viewer = await requireState("approved");
  const [pendingCount, activeBatches, activeRides, showsProfileReminder] = await Promise.all([
    viewer.isAdmin ? access.countPending(viewer.userId) : 0,
    batches.listActive(viewer.userId),
    rides.listActive(viewer.userId),
    profiles.shouldRemindToComplete(viewer.userId),
  ]);
  // Rides come by date; the ones still waiting on this person move ahead, keeping that order.
  const rideCards = activeRides.toSorted(
    (a, b) => Number(a.myAnswer !== null) - Number(b.myAnswer !== null),
  );
  const statsByBatch = await orders.summarizeBatches(viewer.userId, activeBatches);
  const cards = activeBatches
    .map((batch) => ({ batch, stats: statsByBatch.get(batch.id) }))
    .filter((card): card is { batch: BatchSummary; stats: BatchOrderStats } => Boolean(card.stats))
    .toSorted((a, b) => Number(a.stats.mine !== null) - Number(b.stats.mine !== null));
  const waitingCount =
    cards.filter((card) => card.stats.mine === null).length +
    rideCards.filter((ride) => ride.myAnswer === null).length;
  const hasRides = rideCards.length > 0;
  const hasBatches = cards.length > 0;
  const hasCampaigns = hasRides || hasBatches;
  const isWaiting = waitingCount > 0;

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount}>
      {showsProfileReminder && (
        <aside
          aria-label="Completar perfil"
          className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-sm bg-card px-5 py-3"
        >
          <p className="min-w-0 flex-1 basis-56">
            Seu perfil ainda está sem foto e sem tamanho de roupa.
          </p>
          <Link href="/perfil/editar" className={buttonVariants({ variant: "ghost", size: "inline" })}>
            Completar perfil
          </Link>
          <form action={dismissProfileReminder}>
            <button
              type="submit"
              className="label inline-flex min-h-11 cursor-pointer items-center text-cream-dim hover:text-cream"
            >
              Agora não
            </button>
          </form>
        </aside>
      )}

      <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Campanhas ativas</h1>

      {hasCampaigns && (
        <>
          {isWaiting && (
            <p className="mt-3 text-lg">
              Falta você em{" "}
              <strong className="font-semibold text-highlight">
                {countLabel(waitingCount, "campanha", "campanhas")}
              </strong>
            </p>
          )}
          {!isWaiting && <p className="mt-3 text-lg font-semibold">Tudo em dia</p>}

          {hasRides && (
            <section aria-labelledby="rides-title" className="mt-10">
              <h2 id="rides-title" className="label text-foreground">
                Passeios
              </h2>
              <ul className="mt-4 grid gap-5">
                {rideCards.map((ride, index) => (
                  <RideCard key={ride.id} ride={ride} viewerId={viewer.userId} isFirst={index === 0} />
                ))}
              </ul>
            </section>
          )}

          {hasBatches && (
            <section aria-labelledby="batches-title" className="mt-10">
              <h2 id="batches-title" className="label text-foreground">
                Vestuário
              </h2>
              <ul className="mt-4 grid gap-5 sm:grid-cols-2">
                {cards.map((card, index) => (
                  <BatchCard
                    key={card.batch.id}
                    batch={card.batch}
                    stats={card.stats}
                    viewerId={viewer.userId}
                    isFirst={index === 0 && !hasRides}
                  />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
      {!hasCampaigns && (
        <p className="mt-4 max-w-[34rem] leading-relaxed text-cream-dim">
          Nenhuma campanha aberta agora. Quando abrirem uma campanha de vestuário ou um passeio,
          ele aparece aqui. Enquanto isso, veja os{" "}
          <Link href="/passeios" className="text-highlight underline underline-offset-4 hover:text-foreground">
            passeios realizados
          </Link>{" "}
          e o{" "}
          <Link href="/vestuario" className="text-highlight underline underline-offset-4 hover:text-foreground">
            vestuário que já tivemos
          </Link>
          .
        </p>
      )}
    </AppShell>
  );
}
