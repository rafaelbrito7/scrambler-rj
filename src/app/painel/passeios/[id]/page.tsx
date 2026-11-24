import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RideForm } from "@/app/painel/passeios/novo/ride-form";
import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { formatRideDuration, rioDateInput, rioTimeInput } from "@/server/ride-options";
import { RideError } from "@/server/rides";
import { access, rides } from "@/server/services";
import { requireAdmin } from "@/server/session";

export const metadata: Metadata = { title: "Editar passeio | Scrambler RJ" };

type PageProps = { params: Promise<{ id: string }> };

async function findRide(adminId: string, rideId: string) {
  try {
    return await rides.getRide(adminId, rideId);
  } catch (error) {
    if (error instanceof RideError && error.code === "NOT_FOUND") notFound();

    throw error;
  }
}

export default async function EditRidePage({ params }: PageProps) {
  const viewer = await requireAdmin();
  const { id } = await params;
  const [ride, pendingCount, tips] = await Promise.all([
    findRide(viewer.userId, id),
    access.countPending(viewer.userId),
    rides.listTips(viewer.userId),
  ]);
  const chosen = ride.tips.map((tip) => tip.id);
  // A deactivated recommendation stays on offer for the ride that already uses it.
  const offered = tips.filter((tip) => tip.active || chosen.includes(tip.id));

  if (ride.status === "CANCELLED") notFound();

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount} area="painel">
      <BackLink href={`/passeios/${ride.id}`}>Passeio</BackLink>
      <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Editar passeio</h1>
      <p className="mt-4 max-w-[34rem] leading-relaxed text-cream-dim">
        As respostas de presença ficam como estão. Quem já respondeu não é avisado da mudança.
      </p>

      <RideForm
        rideId={ride.id}
        hasTrack={ride.track !== null}
        tips={offered}
        initial={{
          route: ride.route,
          description: ride.description ?? "",
          date: rioDateInput(ride.startsAt),
          meetingTime: ride.meetsAt ? rioTimeInput(ride.meetsAt) : "",
          departureTime: rioTimeInput(ride.startsAt),
          returnTime: rioTimeInput(ride.returnsAt),
          mapUrl: ride.mapUrl ?? "",
          distanceKm: ride.distanceKm ? String(ride.distanceKm) : "",
          surface: ride.surface ?? "",
          difficulty: ride.difficulty ?? "",
          rideTime: ride.rideMinutes ? formatRideDuration(ride.rideMinutes) : "",
          tolls: ride.tollCents ? (ride.tollCents / 100).toFixed(2).replace(".", ",") : "",
          tipIds: chosen,
          packingNote: ride.packingNote ?? "",
          planB: ride.planB ?? "",
          stops: ride.stops.map((stop) => ({
            kind: stop.kind,
            name: stop.name,
            place: stop.place ?? "",
            time: stop.time ?? "",
            note: stop.note ?? "",
            lat: stop.lat === null ? "" : String(stop.lat),
            lon: stop.lon === null ? "" : String(stop.lon),
          })),
        }}
      />
    </AppShell>
  );
}
