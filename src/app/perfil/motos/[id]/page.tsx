import { WrenchIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { removeBikeMod } from "@/app/perfil/actions";
import { BikeForm } from "@/app/perfil/motos/bike-form";
import { ModForm } from "@/app/perfil/motos/[id]/mod-form";
import { BikePhoto } from "@/components/app/bike-photo";
import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { groupMods, MAX_MODS_PER_BIKE } from "@/server/bike-models";
import { access, profiles } from "@/server/services";
import { requireState } from "@/server/session";

export const metadata: Metadata = { title: "Editar moto | Scrambler RJ" };

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ item?: string; aviso?: string }>;
};

const notices: Record<string, string> = {
  "item-incluido": "Item incluído.",
  "item-salvo": "Item atualizado.",
  "item-removido": "Item removido.",
};

export default async function EditBikePage({ params, searchParams }: PageProps) {
  const viewer = await requireState("approved");
  const [{ id }, { item, aviso }, profile, pendingCount] = await Promise.all([
    params,
    searchParams,
    profiles.getOwnProfile(viewer.userId),
    viewer.isAdmin ? access.countPending(viewer.userId) : 0,
  ]);
  const bike = profile.bikes.find((candidate) => candidate.id === id);

  if (!bike) notFound();

  const groups = groupMods(bike.mods);
  const editing = bike.mods.find((mod) => mod.id === item);
  const isEditingItem = editing !== undefined;
  const hasMods = groups.length > 0;
  const canAddMod = bike.mods.length < MAX_MODS_PER_BIKE;
  const showsModForm = isEditingItem || canAddMod;
  const notice = aviso ? notices[aviso] : undefined;
  const hasNotice = notice !== undefined;

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount}>
      <BackLink href="/perfil">Meu perfil</BackLink>
      <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Editar moto</h1>

      <BikeForm
        bikeId={bike.id}
        initial={{
          model: bike.model,
          engineSize: String(bike.engineSize),
          year: bike.year ? String(bike.year) : "",
          color: bike.color ?? "",
          nickname: bike.nickname ?? "",
          rangeKm: bike.rangeKm ? String(bike.rangeKm) : "",
        }}
        hasPhoto={bike.photoKey !== null}
        currentPhoto={<BikePhoto photoKey={bike.photoKey} className="w-40" />}
        submitLabel="Salvar moto"
      />

      <section id="modificacoes" aria-labelledby="mods-title" className="mt-14 max-w-xl scroll-mt-6">
        <h2 id="mods-title" className="flex items-center gap-3 border-b border-border pb-3">
          <WrenchIcon aria-hidden weight="fill" className="size-5 text-highlight" />
          <span className="label text-foreground">Modificações e acessórios</span>
        </h2>

        {hasNotice && (
          <Alert role="status" className="mt-4">
            {notice}
          </Alert>
        )}

        {hasMods && (
          <div className="mt-4 grid gap-5">
            {groups.map((group) => (
              <div key={group.value}>
                <h3 className="label text-muted-foreground">{group.label}</h3>
                <ul className="mt-1 divide-y divide-border">
                  {group.items.map((mod) => (
                    <li key={mod.id} className="flex flex-wrap items-center justify-between gap-x-6 py-2">
                      <span className="min-w-0 font-semibold break-words">{mod.description}</span>
                      <span className="flex items-center gap-x-6">
                        <Link
                          href={`/perfil/motos/${bike.id}?item=${mod.id}#modificacoes`}
                          className={buttonVariants({ variant: "ghost", size: "inline" })}
                        >
                          Editar<span className="sr-only"> {mod.description}</span>
                        </Link>
                        <form action={removeBikeMod}>
                          <input type="hidden" name="bikeId" value={bike.id} />
                          <input type="hidden" name="modId" value={mod.id} />
                          <Button type="submit" variant="ghost" size="inline">
                            Remover<span className="sr-only"> {mod.description}</span>
                          </Button>
                        </form>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        {!hasMods && (
          <p className="mt-4 text-cream-dim">
            Nada ainda. Conte o que você instalou: escape, bagageiro, pneus. Todo o grupo vê.
          </p>
        )}

        {showsModForm && (
          <>
            <h3 className="label mt-8 text-foreground">{isEditingItem ? "Editar item" : "Incluir item"}</h3>
            <ModForm key={editing?.id ?? `novo-${bike.mods.length}`} bikeId={bike.id} editing={editing} />
          </>
        )}
        {!showsModForm && (
          <p className="mt-6 text-sm text-cream-dim">
            Vinte itens é o limite por moto. Remova um para incluir outro.
          </p>
        )}
      </section>
    </AppShell>
  );
}
