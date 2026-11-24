import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { describeRideCounts, formatRideDay, formatRideTime } from "@/components/app/format";
import { RideStatusBadge } from "@/components/app/status-badge";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { access, gallery, rides } from "@/server/services";
import { requireAdmin } from "@/server/session";

export const metadata: Metadata = { title: "Passeios | Scrambler RJ" };

const notices: Record<string, string> = {
  publicado: "Passeio publicado. Ele já aparece no Início dos riders.",
};

type PageProps = {
  searchParams: Promise<{ aviso?: string }>;
};

export default async function RidesPage({ searchParams }: PageProps) {
  const viewer = await requireAdmin();
  const [{ aviso }, pendingCount, allRides, pendingPhotos] = await Promise.all([
    searchParams,
    access.countPending(viewer.userId),
    rides.listAll(viewer.userId),
    gallery.countPendingByRide(viewer.userId),
  ]);
  const notice = aviso ? notices[aviso] : undefined;
  const hasNotice = notice !== undefined;
  const hasRides = allRides.length > 0;

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount} area="painel">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Passeios</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/painel/passeios/novo" className={buttonVariants()}>
            Publicar passeio
          </Link>
          <Link href="/painel/passeios/recomendacoes" className={buttonVariants({ variant: "ghost" })}>
            Recomendações
          </Link>
        </div>
      </div>

      {hasNotice && (
        <Alert role="status" className="mt-5">
          {notice}
        </Alert>
      )}

      {hasRides && (
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {allRides.map((ride) => {
            const waiting = pendingPhotos.get(ride.id) ?? 0;
            const hasPendingPhotos = waiting > 0;

            return (
            <li
              key={ride.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{ride.route}</p>
                <p className="mt-0.5 text-sm text-cream-dim">
                  {formatRideDay(ride.startsAt)} · saída {formatRideTime(ride.startsAt)} ·{" "}
                  {ride.meetingPoint}
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <RideStatusBadge status={ride.status} />
                  <span>{describeRideCounts(ride.counts)}</span>
                </p>
                {hasPendingPhotos && (
                  <p className="mt-2">
                    <Link
                      href={`/passeios/${ride.id}#fotos`}
                      className="inline-flex min-h-11 items-center gap-2 font-semibold text-highlight underline underline-offset-4"
                    >
                      <Badge variant="attention">{waiting}</Badge>
                      {waiting === 1 ? "foto esperando aprovação" : "fotos esperando aprovação"}
                    </Link>
                  </p>
                )}
              </div>

              <Link
                href={`/passeios/${ride.id}`}
                className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
              >
                {ride.status === "CANCELLED" ? "Ver passeio" : "Gerenciar"}
                <span className="sr-only"> {ride.route}</span>
              </Link>
            </li>
            );
          })}
        </ul>
      )}
      {!hasRides && (
        <p className="mt-10 max-w-[34rem] leading-relaxed text-cream-dim">
          Nenhum passeio ainda. Publique o primeiro para os riders confirmarem presença.
        </p>
      )}
    </AppShell>
  );
}
