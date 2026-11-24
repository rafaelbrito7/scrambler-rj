import type { Metadata } from "next";

import { AppShell } from "@/components/app/app-shell";
import { DoneRideCard, RideCard } from "@/components/app/ride-card";
import { access, gallery, rides } from "@/server/services";
import { requireState } from "@/server/session";

export const metadata: Metadata = { title: "Passeios | Scrambler RJ" };

export default async function RidesPage() {
  const viewer = await requireState("approved");
  const [pendingCount, calendar, photoCounts] = await Promise.all([
    viewer.isAdmin ? access.countPending(viewer.userId) : 0,
    rides.listCalendar(viewer.userId),
    gallery.countPublishedByRide(viewer.userId),
  ]);
  const hasUpcoming = calendar.upcoming.length > 0;
  const hasDone = calendar.done.length > 0;

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount}>
      <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Passeios</h1>
      <p className="mt-3 max-w-[34rem] leading-relaxed text-cream-dim">
        O que vem pela frente e a estrada que o grupo já rodou junto.
      </p>

      <section aria-labelledby="upcoming-title" className="mt-10">
        <h2 id="upcoming-title" className="label text-foreground">
          Em campanha
        </h2>
        {hasUpcoming && (
          <ul className="mt-4 grid gap-5">
            {calendar.upcoming.map((ride, index) => (
              <RideCard key={ride.id} ride={ride} viewerId={viewer.userId} isFirst={index === 0} />
            ))}
          </ul>
        )}
        {!hasUpcoming && <p className="mt-3 text-cream-dim">Nenhum passeio marcado agora.</p>}
      </section>

      <section aria-labelledby="done-title" className="mt-12">
        <h2 id="done-title" className="label text-foreground">
          Realizados: {calendar.done.length}
        </h2>
        {hasDone && (
          <ul className="mt-4 grid gap-5 sm:grid-cols-2">
            {calendar.done.map((ride) => (
              <DoneRideCard
                key={ride.id}
                ride={ride}
                viewerId={viewer.userId}
                photoCount={photoCounts.get(ride.id) ?? 0}
              />
            ))}
          </ul>
        )}
        {!hasDone && (
          <p className="mt-3 max-w-[34rem] leading-relaxed text-cream-dim">
            Nenhum passeio realizado ainda. Depois do primeiro, ele fica aqui com as fotos e quem foi.
          </p>
        )}
      </section>
    </AppShell>
  );
}
