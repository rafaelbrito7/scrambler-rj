import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { saveRecipe } from "@/app/painel/vestuario/actions";
import { toGarmentInitial } from "@/app/painel/templates/garment-initial";
import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { GarmentForm } from "@/components/app/garment-form";
import { BatchError } from "@/server/batches";
import { access, recipes } from "@/server/services";
import { requireAdmin } from "@/server/session";

export const metadata: Metadata = { title: "Editar template | Scrambler RJ" };

type PageProps = {
  params: Promise<{ id: string }>;
};

async function findRecipe(adminId: string, recipeId: string) {
  try {
    return await recipes.getRecipe(adminId, recipeId);
  } catch (error) {
    if (error instanceof BatchError && error.code === "NOT_FOUND") notFound();

    throw error;
  }
}

export default async function EditRecipePage({ params }: PageProps) {
  const viewer = await requireAdmin();
  const { id } = await params;
  const [recipe, pendingCount] = await Promise.all([
    findRecipe(viewer.userId, id),
    access.countPending(viewer.userId),
  ]);

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount} area="painel">
      <BackLink href="/painel/templates">Templates</BackLink>
      <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Editar template</h1>
      <p className="mt-4 max-w-[34rem] leading-relaxed text-cream-dim">
        As mudanças valem para as próximas campanhas. As que já foram abertas ficam como estão.
      </p>

      <GarmentForm
        action={saveRecipe}
        initial={toGarmentInitial(recipe)}
        fields={{ recipeId: recipe.id }}
        submitLabel="Salvar template"
        pendingLabel="Salvando…"
        failureMessage="O template não foi salvo. Corrija os campos marcados e escolha de novo as fotos novas."
      />
    </AppShell>
  );
}
