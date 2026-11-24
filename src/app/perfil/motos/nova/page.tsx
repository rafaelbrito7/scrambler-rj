import type { Metadata } from "next";

import { BikeForm } from "@/app/perfil/motos/bike-form";
import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { access } from "@/server/services";
import { requireState } from "@/server/session";

export const metadata: Metadata = { title: "Adicionar moto | Scrambler RJ" };

export default async function NewBikePage() {
  const viewer = await requireState("approved");
  const pendingCount = viewer.isAdmin ? await access.countPending(viewer.userId) : 0;

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount}>
      <BackLink href="/perfil">Meu perfil</BackLink>
      <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Adicionar moto</h1>

      <BikeForm
        initial={{ model: "", engineSize: "", year: "", color: "", nickname: "", rangeKm: "" }}
        hasPhoto={false}
        submitLabel="Adicionar moto"
      />
    </AppShell>
  );
}
