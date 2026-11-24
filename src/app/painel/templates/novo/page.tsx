import type { Metadata } from "next";

import { saveRecipe } from "@/app/painel/vestuario/actions";
import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { GarmentForm } from "@/components/app/garment-form";
import { access } from "@/server/services";
import { requireAdmin } from "@/server/session";

export const metadata: Metadata = { title: "Novo template | Scrambler RJ" };

export default async function NewRecipePage() {
  const viewer = await requireAdmin();
  const pendingCount = await access.countPending(viewer.userId);

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount} area="painel">
      <BackLink href="/painel/templates">Templates</BackLink>
      <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Novo template</h1>

      <GarmentForm
        action={saveRecipe}
        submitLabel="Salvar template"
        pendingLabel="Salvando…"
        failureMessage="O template não foi salvo. Corrija os campos marcados e escolha de novo as fotos novas."
      />
    </AppShell>
  );
}
