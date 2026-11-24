import type { Metadata } from "next";

import { RideForm } from "@/app/painel/passeios/novo/ride-form";
import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { emptyRideForm } from "@/server/ride-options";
import { access, rides } from "@/server/services";
import { requireAdmin } from "@/server/session";

export const metadata: Metadata = { title: "Publicar passeio | Scrambler RJ" };

export default async function NewRidePage() {
  const viewer = await requireAdmin();
  const [pendingCount, tips] = await Promise.all([
    access.countPending(viewer.userId),
    rides.listTips(viewer.userId),
  ]);
  const offered = tips.filter((tip) => tip.active);

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount} area="painel">
      <BackLink href="/painel/passeios">Passeios</BackLink>
      <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Publicar passeio</h1>
      <p className="mt-4 max-w-[34rem] leading-relaxed text-cream-dim">
        Ao publicar, o passeio aparece no Início e cada rider responde se vai.
      </p>

      <RideForm initial={emptyRideForm} tips={offered} />
    </AppShell>
  );
}
