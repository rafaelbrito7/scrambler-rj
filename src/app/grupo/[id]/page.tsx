import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ProfileFacts } from "@/components/app/profile-facts";
import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { BikeShowcase } from "@/components/app/bike-showcase";
import { ProfileHeader } from "@/components/app/profile-header";
import { RideHistory } from "@/components/app/ride-history";
import { formatWhatsapp, whatsappLink } from "@/components/app/format";
import { groupName } from "@/server/display-name";
import { ProfileError } from "@/server/profiles";
import { access, profiles } from "@/server/services";
import { requireState } from "@/server/session";

export const metadata: Metadata = { title: "Perfil | Scrambler RJ" };

type PageProps = {
  params: Promise<{ id: string }>;
};

// Administrators read the full record, which also exists for blocked people. Everyone else
// reads the group view, where a blocked person is simply not found.
async function findMember(viewer: { userId: string; isAdmin: boolean }, memberId: string) {
  try {
    if (viewer.isAdmin) return { record: await profiles.getMemberRecord(viewer.userId, memberId) };

    const member = await profiles.getMemberProfile(viewer.userId, memberId);

    return { member };
  } catch (error) {
    if (error instanceof ProfileError && error.code === "NOT_FOUND") notFound();

    throw error;
  }
}

const phoneLink =
  "inline-flex min-h-11 items-center text-lg font-semibold tabular-nums underline decoration-primary decoration-2 underline-offset-[6px] hover:text-highlight";

export default async function MemberProfilePage({ params }: PageProps) {
  const viewer = await requireState("approved");
  const { id } = await params;

  if (id === viewer.userId) redirect("/perfil");

  const [found, history, pendingCount] = await Promise.all([
    findMember(viewer, id),
    profiles.getRideHistory(viewer.userId, id),
    viewer.isAdmin ? access.countPending(viewer.userId) : 0,
  ]);
  const record = found.record;
  const member = record ?? found.member;

  if (!member) notFound();

  const isBlocked = record?.status === "BLOCKED";
  const hasRecord = record !== undefined;
  const hasContact = Boolean(record?.emergencyName && record.emergencyPhone);
  const hasBloodType = Boolean(record?.bloodType);
  const hasSecondContact = Boolean(record?.emergencyName2 && record.emergencyPhone2);
  const hasHealthPlan = Boolean(record?.healthPlan);
  const hasPlanCard = Boolean(record?.healthPlanCard);
  const hasHealthNotes = Boolean(record?.healthNotes);
  const hasSize = Boolean(record?.shirtSize);
  const backHref = hasRecord ? "/painel/riders" : "/grupo";
  const backLabel = hasRecord ? "Gestão de riders" : "Riders";

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount}>
      <div>
        <BackLink href={backHref}>{backLabel}</BackLink>

        <ProfileHeader person={member} level={history.level} isBlocked={isBlocked} />

        <ProfileFacts profile={member} />

        <RideHistory history={history} name={groupName(member)} isOwn={false} />

        <BikeShowcase bikes={member.bikes} />

        {hasRecord && (
          <section aria-labelledby="record-title" className="mt-12 max-w-2xl rounded-sm bg-card p-5">
            <h2 id="record-title" className="label text-foreground">
              Só administradores veem
            </h2>
            <dl className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="label text-muted-foreground">WhatsApp</dt>
                <dd className="mt-1">
                  <a
                    href={whatsappLink(record.whatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    className={phoneLink}
                  >
                    {formatWhatsapp(record.whatsapp)}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="label text-muted-foreground">Tamanho de roupa</dt>
                {hasSize && <dd className="mt-1 text-lg font-semibold">{record.shirtSize}</dd>}
                {!hasSize && <dd className="mt-1 text-cream-dim">Não informado</dd>}
              </div>
            </dl>

            <h3 className="label mt-8 text-foreground">Em caso de emergência</h3>
            <dl className="mt-3 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="label text-muted-foreground">Contato</dt>
                {hasContact && (
                  <>
                    <dd className="mt-1 font-semibold">{record.emergencyName}</dd>
                    <dd className="mt-1">
                      <a href={`tel:+55${record.emergencyPhone}`} className={phoneLink}>
                        Ligar para {formatWhatsapp(record.emergencyPhone ?? "")}
                      </a>
                    </dd>
                  </>
                )}
                {!hasContact && <dd className="mt-1 text-cream-dim">Não informado</dd>}
              </div>
              <div>
                <dt className="label text-muted-foreground">Tipo sanguíneo</dt>
                {hasBloodType && <dd className="mt-1 text-lg font-semibold">{record.bloodType}</dd>}
                {!hasBloodType && <dd className="mt-1 text-cream-dim">Não informado</dd>}
              </div>
              {hasSecondContact && (
                <div>
                  <dt className="label text-muted-foreground">Segundo contato</dt>
                  <dd className="mt-1 font-semibold">{record.emergencyName2}</dd>
                  <dd className="mt-1">
                    <a href={`tel:+55${record.emergencyPhone2}`} className={phoneLink}>
                      Ligar para {formatWhatsapp(record.emergencyPhone2 ?? "")}
                    </a>
                  </dd>
                </div>
              )}
              {hasHealthPlan && (
                <div>
                  <dt className="label text-muted-foreground">Plano de saúde</dt>
                  <dd className="mt-1 font-semibold">{record.healthPlan}</dd>
                  {hasPlanCard && (
                    <dd className="mt-0.5 tabular-nums">Carteirinha {record.healthPlanCard}</dd>
                  )}
                </div>
              )}
              {hasHealthNotes && (
                <div className="sm:col-span-2">
                  <dt className="label text-muted-foreground">Alergias e condições de saúde</dt>
                  <dd className="mt-1 leading-relaxed whitespace-pre-line">{record.healthNotes}</dd>
                </div>
              )}
            </dl>
          </section>
        )}
      </div>
    </AppShell>
  );
}
