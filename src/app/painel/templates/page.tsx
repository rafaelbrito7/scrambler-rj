import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { formatPrice } from "@/components/app/format";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { access, recipes } from "@/server/services";
import { requireAdmin } from "@/server/session";

export const metadata: Metadata = { title: "Templates | Scrambler RJ" };

const notices: Record<string, string> = {
  salva: "Template salvo. Dá para abrir uma campanha a partir dele.",
  atualizada: "Template atualizado. As campanhas já abertas não mudam.",
};

type PageProps = {
  searchParams: Promise<{ aviso?: string }>;
};

export default async function RecipesPage({ searchParams }: PageProps) {
  const viewer = await requireAdmin();
  const [{ aviso }, pendingCount, allRecipes] = await Promise.all([
    searchParams,
    access.countPending(viewer.userId),
    recipes.listRecipes(viewer.userId),
  ]);
  const notice = aviso ? notices[aviso] : undefined;
  const hasNotice = notice !== undefined;
  const hasRecipes = allRecipes.length > 0;

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount} area="painel">
      <BackLink href="/painel/vestuario">Vestuário</BackLink>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Templates</h1>
        <Link href="/painel/templates/novo" className={buttonVariants()}>
          Novo template
        </Link>
      </div>
      <p className="mt-4 max-w-[34rem] leading-relaxed text-cream-dim">
        O template guarda os dados de uma peça para reaproveitar. Cada campanha aberta a partir dele é
        uma cópia: mudar o template não mexe nas campanhas, e vice-versa.
      </p>

      {hasNotice && (
        <Alert role="status" className="mt-5">
          {notice}
        </Alert>
      )}

      {hasRecipes && (
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {allRecipes.map((recipe) => (
            <li
              key={recipe.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">
                  {recipe.model} · {formatPrice(recipe.unitPriceCents)}
                </p>
                <p className="mt-0.5 text-sm text-cream-dim">
                  {recipe.colors.map((color) => color.name).join(", ")} · {recipe.sizes.join(", ")}
                </p>
              </div>

              <div className="grid gap-2 sm:flex">
                <Link
                  href={`/painel/vestuario/novo?template=${recipe.id}`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Abrir campanha<span className="sr-only"> com o template {recipe.model}</span>
                </Link>
                <Link
                  href={`/painel/templates/${recipe.id}`}
                  className={buttonVariants({ variant: "ghost" })}
                >
                  Editar<span className="sr-only"> o template {recipe.model}</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!hasRecipes && (
        <p className="mt-8 max-w-[34rem] leading-relaxed text-cream-dim">
          Nenhum template ainda. Salve o primeiro para não redigitar a peça a cada campanha.
        </p>
      )}
    </AppShell>
  );
}
