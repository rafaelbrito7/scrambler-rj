import type { Metadata } from "next";
import Link from "next/link";

import { changeBike } from "@/app/perfil/actions";
import { ProfileFacts } from "@/components/app/profile-facts";
import { AppShell } from "@/components/app/app-shell";
import { BikeShowcase } from "@/components/app/bike-showcase";
import { ProfileHeader } from "@/components/app/profile-header";
import { RideHistory } from "@/components/app/ride-history";
import { ConfirmAction } from "@/components/app/confirm-action";
import { formatWhatsapp } from "@/components/app/format";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { groupName } from "@/server/display-name";
import { MAX_BIKES } from "@/server/profiles";
import { access, profiles } from "@/server/services";
import { requireState } from "@/server/session";

export const metadata: Metadata = { title: "Meu perfil | Scrambler RJ" };

const notices: Record<string, string> = {
  salvo: "Perfil salvo.",
  "moto-adicionada": "Moto adicionada.",
  "moto-salva": "Moto atualizada.",
  "moto-principal": "Moto principal trocada. É ela que aparece para o grupo.",
  "moto-removida": "Moto removida.",
  "ultima-moto": "O perfil precisa de ao menos uma moto, então essa não pode sair.",
  "moto-mudou": "Essa moto não está mais no seu perfil.",
  "emergencia-apagada": "Dados de emergência apagados.",
};

type PageProps = {
  searchParams: Promise<{ aviso?: string }>;
};

export default async function OwnProfilePage({ searchParams }: PageProps) {
  const viewer = await requireState("approved");
  const [{ aviso }, profile, history, pendingCount] = await Promise.all([
    searchParams,
    profiles.getOwnProfile(viewer.userId),
    profiles.getRideHistory(viewer.userId, viewer.userId),
    viewer.isAdmin ? access.countPending(viewer.userId) : 0,
  ]);
  const notice = aviso ? notices[aviso] : undefined;
  const hasNotice = notice !== undefined;
  const hasSize = profile.shirtSize !== null;
  const hasContact = profile.emergencyName !== null && profile.emergencyPhone !== null;
  const hasBloodType = profile.bloodType !== null;
  const hasSecondContact = profile.emergencyName2 !== null && profile.emergencyPhone2 !== null;
  const hasHealthPlan = profile.healthPlan !== null;
  const hasPlanCard = profile.healthPlanCard !== null;
  const hasHealthNotes = profile.healthNotes !== null;
  const hasEmergencyData =
    hasContact || hasBloodType || hasSecondContact || hasHealthPlan || hasHealthNotes;
  const canRemoveBikes = profile.bikes.length > 1;
  const canAddBike = profile.bikes.length < MAX_BIKES;

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount}>
      <div>
        {hasNotice && (
          <Alert role="status" className="mb-6">
            {notice}
          </Alert>
        )}

        <ProfileHeader person={profile} level={history.level} />

        <ProfileFacts profile={profile} />

        <Link href="/perfil/editar" className={buttonVariants({ variant: "outline", className: "mt-6 w-full sm:w-auto" })}>
          Editar perfil
        </Link>

        <RideHistory history={history} name={groupName(profile)} isOwn />

        <BikeShowcase
          bikes={profile.bikes}
          renderActions={(bike) => {
            const canBecomeMain = !bike.isMain;

            return (
              <>
                <Link href={`/perfil/motos/${bike.id}`} className={buttonVariants({ variant: "ghost", size: "inline" })}>
                  Editar<span className="sr-only"> {bike.model}</span>
                </Link>
                {canBecomeMain && (
                  <form action={changeBike}>
                    <input type="hidden" name="bikeId" value={bike.id} />
                    <input type="hidden" name="change" value="principal" />
                    <Button type="submit" variant="ghost" size="inline">
                      Tornar principal<span className="sr-only">: {bike.model}</span>
                    </Button>
                  </form>
                )}
                {canRemoveBikes && (
                  <ConfirmAction
                    label={
                      <>
                        Remover<span className="sr-only"> {bike.model}</span>
                      </>
                    }
                    question={`Remover ${bike.model} do seu perfil?`}
                    confirmLabel="Sim, remover"
                    keepLabel="Manter moto"
                    action={changeBike}
                    fields={{ bikeId: bike.id, change: "remover" }}
                  />
                )}
              </>
            );
          }}
        />

        {canAddBike && (
          <Link
            href="/perfil/motos/nova"
            className={buttonVariants({ variant: "outline", className: "mt-5 w-full sm:w-auto" })}
          >
            Adicionar moto
          </Link>
        )}
        {!canAddBike && (
          <p className="mt-4 text-sm text-cream-dim">
            Cinco motos é o limite do perfil. Remova uma para adicionar outra.
          </p>
        )}

        <section aria-labelledby="private-title" className="mt-12 max-w-2xl rounded-sm bg-card p-5">
          <h2 id="private-title" className="label text-foreground">
            Só você e os administradores veem
          </h2>
          <dl className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="label text-muted-foreground">WhatsApp</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">
                {formatWhatsapp(profile.whatsapp)}
              </dd>
            </div>
            <div>
              <dt className="label text-muted-foreground">Tamanho de roupa</dt>
              {hasSize && <dd className="mt-1 text-lg font-semibold">{profile.shirtSize}</dd>}
              {!hasSize && (
                <dd className="mt-1 text-cream-dim">
                  Ainda não informado. Guardar o tamanho agiliza o pedido nas campanhas de vestuário.
                </dd>
              )}
            </div>
          </dl>

          <h3 className="label mt-8 text-foreground">Em caso de emergência</h3>
          {hasEmergencyData && (
            <dl className="mt-3 grid gap-5 sm:grid-cols-2">
              {hasContact && (
                <div>
                  <dt className="label text-muted-foreground">Contato</dt>
                  <dd className="mt-1 font-semibold">{profile.emergencyName}</dd>
                  <dd className="mt-0.5 tabular-nums">
                    {formatWhatsapp(profile.emergencyPhone ?? "")}
                  </dd>
                </div>
              )}
              {hasBloodType && (
                <div>
                  <dt className="label text-muted-foreground">Tipo sanguíneo</dt>
                  <dd className="mt-1 text-lg font-semibold">{profile.bloodType}</dd>
                </div>
              )}
              {hasSecondContact && (
                <div>
                  <dt className="label text-muted-foreground">Segundo contato</dt>
                  <dd className="mt-1 font-semibold">{profile.emergencyName2}</dd>
                  <dd className="mt-0.5 tabular-nums">
                    {formatWhatsapp(profile.emergencyPhone2 ?? "")}
                  </dd>
                </div>
              )}
              {hasHealthPlan && (
                <div>
                  <dt className="label text-muted-foreground">Plano de saúde</dt>
                  <dd className="mt-1 font-semibold">{profile.healthPlan}</dd>
                  {hasPlanCard && (
                    <dd className="mt-0.5 tabular-nums">Carteirinha {profile.healthPlanCard}</dd>
                  )}
                </div>
              )}
              {hasHealthNotes && (
                <div className="sm:col-span-2">
                  <dt className="label text-muted-foreground">Alergias e condições de saúde</dt>
                  <dd className="mt-1 leading-relaxed whitespace-pre-line">{profile.healthNotes}</dd>
                </div>
              )}
            </dl>
          )}
          {!hasEmergencyData && (
            <p className="mt-2 text-cream-dim">
              Nada informado. Se quiser, diga em Editar perfil a quem avisar num imprevisto.
            </p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
