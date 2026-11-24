import type { Metadata } from "next";
import Link from "next/link";

import { openBatch } from "@/app/painel/vestuario/actions";
import { toGarmentInitial } from "@/app/painel/templates/garment-initial";
import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { formatPrice } from "@/components/app/format";
import { GarmentForm } from "@/components/app/garment-form";
import { BatchError } from "@/server/batches";
import { access, batches, recipes } from "@/server/services";
import { requireAdmin } from "@/server/session";

export const metadata: Metadata = { title: "Abrir campanha | Scrambler RJ" };

type PageProps = {
  searchParams: Promise<{ template?: string; volta?: string }>;
};

// The closed campaign being brought back, when the link still points at one.
async function findSource(adminId: string, batchId: string | undefined) {
  if (!batchId) return undefined;

  try {
    const batch = await batches.getBatch(adminId, batchId);

    return batch.status === "CLOSED" ? batch : undefined;
  } catch (error) {
    if (error instanceof BatchError && error.code === "NOT_FOUND") return undefined;

    throw error;
  }
}

export default async function NewBatchPage({ searchParams }: PageProps) {
  const viewer = await requireAdmin();
  const { template, volta } = await searchParams;
  const [pendingCount, allRecipes, source] = await Promise.all([
    access.countPending(viewer.userId),
    recipes.listRecipes(viewer.userId),
    findSource(viewer.userId, volta),
  ]);
  const isRevival = source !== undefined;
  const recipe = isRevival ? undefined : allRecipes.find((candidate) => candidate.id === template);
  const isFromRecipe = recipe !== undefined;
  const isFromScratch = !isFromRecipe && !isRevival;
  const showsRecipeChoice = isFromScratch && allRecipes.length > 0;
  const copied = source ?? recipe;
  const fields: Record<string, string> = {
    ...(isFromRecipe ? { recipeId: recipe.id } : {}),
    ...(isRevival ? { revivedFromId: source.id } : {}),
  };

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount} area="painel">
      <BackLink href="/painel/vestuario">Vestuário</BackLink>
      <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Abrir campanha</h1>

      {isFromRecipe && (
        <p className="mt-4 max-w-[34rem] leading-relaxed text-cream-dim">
          Partindo do template {recipe.model}. O que você ajustar aqui vale só para esta campanha; o
          template continua como está.
        </p>
      )}
      {isRevival && (
        <p className="mt-4 max-w-[34rem] leading-relaxed text-cream-dim">
          Trazendo {source.model} de volta. A campanha nova começa igual à anterior e pode ser
          ajustada aqui; a anterior e os pedidos dela continuam como estão. Ao abrir, os pedidos de
          volta desta peça são dados como atendidos.
        </p>
      )}
      {isFromScratch && (
        <p className="mt-4 max-w-[34rem] leading-relaxed text-cream-dim">
          Uma campanha de vestuário é a encomenda de uma peça. Ao abrir, ela aparece no Início de todos os
          riders.
        </p>
      )}

      {showsRecipeChoice && (
        <section aria-labelledby="recipes-title" className="mt-8 max-w-2xl rounded-sm bg-card p-5">
          <h2 id="recipes-title" className="label text-foreground">
            Partir de um template
          </h2>
          <ul className="mt-2 divide-y divide-border">
            {allRecipes.map((candidate) => (
              <li key={candidate.id}>
                <Link
                  href={`/painel/vestuario/novo?template=${candidate.id}`}
                  className="flex min-h-12 items-center justify-between gap-4 py-2 hover:text-ember-hot"
                >
                  <span className="font-semibold">{candidate.model}</span>
                  <span className="shrink-0 text-sm text-cream-dim">
                    {formatPrice(candidate.unitPriceCents)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <GarmentForm
        key={copied?.id ?? "novo"}
        action={openBatch}
        initial={copied ? toGarmentInitial(copied) : undefined}
        fields={fields}
        submitLabel="Abrir campanha"
        pendingLabel="Abrindo…"
        failureMessage="A campanha não foi aberta. Corrija os campos marcados e escolha de novo as fotos novas."
      />
    </AppShell>
  );
}
