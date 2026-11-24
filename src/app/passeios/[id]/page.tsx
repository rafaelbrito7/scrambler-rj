import type { Icon } from "@phosphor-icons/react";
import {
  BackpackIcon,
  CameraIcon,
  CloudRainIcon,
  CoffeeIcon,
  CoinsIcon,
  FlagCheckeredIcon,
  GasPumpIcon,
  GaugeIcon,
  HourglassIcon,
  HouseIcon,
  ImagesIcon,
  MapPinIcon,
  MapTrifoldIcon,
  PathIcon,
  RoadHorizonIcon,
  SignpostIcon,
  TimerIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { changeAttendance, changeRideStatus } from "@/app/painel/passeios/actions";
import { changeRidePhoto } from "@/app/passeios/[id]/gallery-actions";
import { GalleryUpload } from "@/app/passeios/[id]/gallery-upload";
import { PhotoGrid } from "@/app/passeios/[id]/photo-grid";
import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { ConfirmAction } from "@/components/app/confirm-action";
import { CopySummary } from "@/components/app/copy-summary";
import { RideStatusBadge } from "@/components/app/status-badge";
import { countLabel, formatPrice, formatRideDay, formatRideTime, peopleLabel } from "@/components/app/format";
import { PeopleStack } from "@/components/app/people-stack";
import { RideMap } from "@/components/app/ride-map";
import { TipIcon } from "@/components/app/tip-icon";
import { RideAnswer } from "@/components/app/ride-answer";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  difficultyLabel,
  formatRideDuration,
  formatStopTime,
  stopKindLabel,
  surfaceLabel,
} from "@/server/ride-options";
import { type AttendancePerson, RideError } from "@/server/rides";
import { type Gallery, GalleryError } from "@/server/gallery";
import { buildPointLinks, buildRouteLink } from "@/server/map-links";
import { getOrigin } from "@/server/origin";
import { access, gallery, rides } from "@/server/services";
import { requireParticipant } from "@/server/session";
import { buildRideShareText } from "@/server/share-text";

export const metadata: Metadata = { title: "Passeio | Scrambler RJ" };

const closedMessages = {
  CLOSED: "As confirmações deste passeio foram encerradas.",
  CANCELLED: "Este passeio foi cancelado.",
};

const notices: Record<string, string> = {
  encerrado: "Confirmações encerradas. O passeio saiu do Início e as respostas ficaram como estão.",
  reaberto: "Confirmações reabertas. O passeio voltou ao Início.",
  cancelado: "Passeio cancelado. As respostas ficaram como histórico.",
  mudou: "A situação do passeio já tinha mudado. Confira abaixo.",
  salvo: "Passeio atualizado.",
  presenca: "Presença atualizada.",
  "foto-aprovada": "Foto aprovada. Já aparece para o grupo.",
  "foto-apagada": "Foto apagada.",
};

const stopIcons: Record<string, Icon> = {
  MEETING: MapPinIcon,
  FUEL: GasPumpIcon,
  FOOD: CoffeeIcon,
  VIEWPOINT: CameraIcon,
  DESTINATION: FlagCheckeredIcon,
  RETURN: HouseIcon,
};

const answerLabels = { GOING: "Você vai", NOT_GOING: "Você não vai" };

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aviso?: string }>;
};

async function findRide(userId: string, rideId: string) {
  try {
    return await rides.getRide(userId, rideId);
  } catch (error) {
    if (error instanceof RideError && error.code === "NOT_FOUND") notFound();

    throw error;
  }
}

// A ride that is gone is reported once, by findRide; here it simply has no gallery.
async function findGallery(userId: string, rideId: string): Promise<Gallery> {
  try {
    return await gallery.getGallery(userId, rideId);
  } catch (error) {
    if (error instanceof GalleryError && error.code === "NOT_FOUND") {
      return { isOpen: false, canUpload: false, remaining: 0, approved: [], pending: [] };
    }

    throw error;
  }
}

type AttendanceListProps = {
  people: AttendancePerson[];
  rideId: string;
  viewerId: string;
  canCorrect: boolean;
  change: "tirar" | "incluir";
  changeLabel: string;
  emptyText: string;
};

function AttendanceList({ people, rideId, viewerId, canCorrect, change, changeLabel, emptyText }: AttendanceListProps) {
  const hasPeople = people.length > 0;

  if (!hasPeople) return <p className="text-cream-dim">{emptyText}</p>;

  return (
    <ul className="max-w-2xl divide-y divide-border border-y border-border">
      {people.map((person) => {
        const nextChange = person.corrected ? "desfazer" : change;
        const nextLabel = person.corrected ? "Desfazer" : changeLabel;

        return (
          <li key={person.userId} className="flex flex-wrap items-center justify-between gap-x-6 py-1">
            <span className="flex min-h-11 flex-wrap items-center gap-x-3">
              <Link
                href={person.userId === viewerId ? "/perfil" : `/grupo/${person.userId}`}
                className="underline decoration-border underline-offset-4 hover:text-highlight hover:decoration-primary"
              >
                {person.name}
              </Link>
              {canCorrect && person.corrected && <Badge variant="outline">Corrigido</Badge>}
            </span>
            {canCorrect && (
              <form action={changeAttendance}>
                <input type="hidden" name="rideId" value={rideId} />
                <input type="hidden" name="userId" value={person.userId} />
                <Button type="submit" name="change" value={nextChange} variant="ghost" size="inline">
                  {nextLabel}
                  <span className="sr-only"> {person.name}</span>
                </Button>
              </form>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default async function RidePage({ params, searchParams }: PageProps) {
  const [{ id }, { aviso }] = await Promise.all([params, searchParams]);
  const viewer = await requireParticipant(`/passeios/${id}`);
  const [ride, photoGallery, pendingCount] = await Promise.all([
    findRide(viewer.userId, id),
    findGallery(viewer.userId, id),
    viewer.isAdmin ? access.countPending(viewer.userId) : 0,
  ]);
  const isOpen = ride.status === "OPEN";
  const hasPhoto = ride.photoKey !== null;
  const hasMap = ride.mapUrl !== null;
  const hasAnswered = ride.myAnswer !== null;
  // Answers stop at the departure, even when nobody closed them.
  const canAnswer = isOpen && !ride.isOver;
  const showsFrozenAnswer = !canAnswer && hasAnswered;
  const lockedMessage = isOpen
    ? "Este passeio já saiu. As respostas ficaram como estavam."
    : closedMessages[ride.status === "CANCELLED" ? "CANCELLED" : "CLOSED"];
  const isClosed = ride.status === "CLOSED";
  const notice = aviso ? notices[aviso] : undefined;
  const hasNotice = notice !== undefined;
  const canManage = viewer.isAdmin && ride.status !== "CANCELLED";
  const shareText = buildRideShareText(ride, await getOrigin());
  const hasDescription = ride.description !== null;
  // From setting off to the planned return: the platform does not time the ride itself.
  const totalMinutes = Math.round((ride.returnsAt.getTime() - ride.startsAt.getTime()) / 60_000);
  const backHref = ride.isOver ? "/passeios" : "/inicio";
  const backLabel = ride.isOver ? "Passeios" : "Campanhas ativas";
  const showsAnswers = !ride.isOver;
  const attendedCards = ride.cards.attended ?? [];
  const sheet = [
    { label: "Distância", value: ride.distanceKm ? String(ride.distanceKm) : null, unit: "km", icon: PathIcon },
    { label: "Duração", value: totalMinutes > 0 ? formatRideDuration(totalMinutes) : null, unit: "", icon: HourglassIcon },
    { label: "Tempo de rolé", value: ride.rideMinutes ? formatRideDuration(ride.rideMinutes) : null, unit: "", icon: TimerIcon },
    { label: "Piso", value: surfaceLabel(ride.surface), unit: "", icon: RoadHorizonIcon },
    { label: "Dificuldade", value: difficultyLabel(ride.difficulty), unit: "", icon: GaugeIcon },
    { label: "Pedágios", value: ride.tollCents ? formatPrice(ride.tollCents) : null, unit: "", icon: CoinsIcon },
  ].filter((item) => item.value !== null);
  const hasSheet = sheet.length > 0;
  const hasTips = ride.tips.length > 0;
  const hasPackingNote = ride.packingNote !== null;
  const hasPacking = hasTips || hasPackingNote;
  const hasPlanB = ride.planB !== null;
  const mapPoints = ride.stops.flatMap((stop, index) =>
    stop.lat !== null && stop.lon !== null
      ? [{ lat: stop.lat, lon: stop.lon, number: index + 1, name: stop.name }]
      : [],
  );
  const hasMapPoints = mapPoints.length > 0;
  const showsMap = hasMapPoints || ride.track !== null;
  const routeLink = buildRouteLink(mapPoints);
  const hasRouteLink = routeLink !== null;
  const isRouteLinkPartial = routeLink?.isPartial ?? false;
  const canAddToCalendar = ride.status !== "CANCELLED";
  const hasPhotos = photoGallery.approved.length > 0;
  const hasPendingPhotos = photoGallery.pending.length > 0;
  const canSendPhotos = photoGallery.canUpload && photoGallery.remaining > 0;
  const isGalleryFullForViewer = photoGallery.canUpload && photoGallery.remaining === 0;
  const canDeletePublished = viewer.isAdmin && hasPhotos;
  const attendance = ride.attendance;
  const hasAttendance = attendance !== null;
  const canCorrect = viewer.isAdmin && hasAttendance;
  const meeting = ride.meetsAt ? `encontro ${formatRideTime(ride.meetsAt)} · ` : "";
  const whenLine = `${formatRideDay(ride.startsAt)} · ${meeting}saída ${formatRideTime(ride.startsAt)}`;

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount}>
      <BackLink href={backHref}>{backLabel}</BackLink>

      {hasNotice && (
        <Alert role="status" className="mb-6">
          {notice}
        </Alert>
      )}

      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="sm:col-start-1">
          {!isOpen && <RideStatusBadge status={ride.status} />}
          <h1 className={`display text-[clamp(2rem,6vw,2.75rem)] ${isOpen ? "" : "mt-3"}`}>
            {ride.route}
          </h1>
          <p className="mt-3 text-xl font-semibold text-highlight">{whenLine}</p>
          {hasDescription && (
            <p className="mt-4 leading-relaxed whitespace-pre-line">{ride.description}</p>
          )}
          <p className="mt-4 text-cream-dim">
            Retorno previsto às {formatRideTime(ride.returnsAt)}.
          </p>

          {hasSheet && (
            <dl className="mt-6 flex flex-wrap gap-2">
              {sheet.map(({ label, value, unit, icon: SheetIcon }) => (
                <div key={label} className="min-w-32 grow basis-0 rounded-sm bg-card p-3">
                  <SheetIcon aria-hidden className="size-5 text-highlight" />
                  <dt className="label mt-3 text-muted-foreground">{label}</dt>
                  <dd className="mt-0.5 text-lg leading-tight font-semibold">
                    {value}
                    {unit !== "" && <span className="ml-1 text-sm font-normal text-cream-dim">{unit}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <aside className="grid content-start gap-5 sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:self-start">
          <div className="rounded-sm bg-card p-5">
            {canAnswer && (
              <RideAnswer
                key={ride.myAnswer ?? "none"}
                rideId={ride.id}
                route={ride.route}
                answer={ride.myAnswer}
              />
            )}
            {!canAnswer && <p className="leading-relaxed text-cream-dim">{lockedMessage}</p>}
            {showsFrozenAnswer && (
              <p className="mt-2 font-semibold">
                {answerLabels[ride.myAnswer ?? "NOT_GOING"]}
              </p>
            )}
          </div>

          {hasPhoto && (
            <div className="relative aspect-video overflow-hidden rounded-sm bg-card">
              <Image
                src={`/fotos/${ride.photoKey}`}
                alt=""
                fill
                unoptimized
                priority
                sizes="(min-width: 640px) 22rem, 100vw"
                className="object-cover"
              />
            </div>
          )}

          {showsMap && (
            <section aria-labelledby="map-title">
              <h2 id="map-title" className="mb-4 flex items-center gap-3 border-b border-border pb-3">
                <MapTrifoldIcon aria-hidden weight="fill" className="size-5 text-highlight" />
                <span className="label text-foreground">Mapa da rota</span>
              </h2>
              <RideMap points={mapPoints} track={ride.track} />
              {hasRouteLink && (
                <a
                  href={routeLink.url}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "outline", className: "mt-4 w-full" })}
                >
                  Abrir no Google Maps
                </a>
              )}
              {isRouteLinkPartial && (
                <p className="mt-2 text-sm text-cream-dim">
                  O link leva parte do roteiro: o Google Maps aceita o encontro, o destino e até nove
                  paradas no caminho.
                </p>
              )}
            </section>
          )}

          {hasPlanB && (
            <p className="flex gap-3 rounded-sm border border-border p-4 text-sm leading-snug">
              <CloudRainIcon aria-hidden className="size-5 shrink-0 text-cream-dim" />
              <span>
                <span className="label block text-muted-foreground">Plano B para chuva</span>
                <span className="mt-1 block whitespace-pre-line">{ride.planB}</span>
              </span>
            </p>
          )}

          {canAddToCalendar && (
            <a
              href={`/passeios/${ride.id}/agenda`}
              className={buttonVariants({ variant: "outline", className: "w-full" })}
            >
              Adicionar à agenda
            </a>
          )}

          {hasMap && (
            <a
              href={ride.mapUrl ?? undefined}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", className: "w-full" })}
            >
              Abrir link do mapa
            </a>
          )}
        </aside>

        <section aria-labelledby="itinerary-title" className="sm:col-start-1">
          <h2 id="itinerary-title" className="mb-4 flex items-center gap-3 border-b border-border pb-3">
            <SignpostIcon aria-hidden weight="fill" className="size-5 text-highlight" />
            <span className="label text-foreground">
              Roteiro · {countLabel(ride.stops.length, "parada", "paradas")}
            </span>
          </h2>
          <ol className="grid">
            {ride.stops.map((stop, index) => {
              const StopIcon = stopIcons[stop.kind] ?? MapPinIcon;
              const isHighlighted = stop.kind === "MEETING" || stop.kind === "DESTINATION";
              const isLast = index === ride.stops.length - 1;
              const hasTime = stop.time !== null;
              const hasPlace = stop.place !== null;
              const hasNote = stop.note !== null;
              const pointLinks = stop.lat !== null && stop.lon !== null ? buildPointLinks({ lat: stop.lat, lon: stop.lon }) : null;
              const hasPointLinks = pointLinks !== null;

              return (
                <li key={index} className="grid grid-cols-[3.25rem_2.25rem_minmax(0,1fr)] gap-x-3">
                  <span className="pt-1.5 text-right font-semibold text-highlight tabular-nums">
                    {hasTime && formatStopTime(stop.time ?? "")}
                  </span>
                  <span className="flex flex-col items-center">
                    <span
                      className={`grid size-9 place-items-center rounded-full ${isHighlighted ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`}
                    >
                      <StopIcon
                        aria-hidden
                        weight={isHighlighted ? "fill" : "regular"}
                        className="size-[1.125rem]"
                      />
                    </span>
                    {!isLast && <span className="w-px grow bg-border" />}
                  </span>
                  <div className={isLast ? "pb-1" : "pb-6"}>
                    <p className="label pt-0.5 text-muted-foreground">
                      {index + 1} · {stopKindLabel(stop.kind)}
                    </p>
                    <p className="font-semibold">{stop.name}</p>
                    {hasPlace && <p className="text-sm text-cream-dim">{stop.place}</p>}
                    {hasNote && <p className="mt-1 text-sm">{stop.note}</p>}
                    {hasPointLinks && (
                      <p className="flex flex-wrap gap-x-6">
                        <a
                          href={pointLinks.maps}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonVariants({ variant: "ghost", size: "inline" })}
                        >
                          Abrir no mapa<span className="sr-only">: {stop.name}</span>
                        </a>
                        <a
                          href={pointLinks.waze}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonVariants({ variant: "ghost", size: "inline" })}
                        >
                          Abrir no Waze<span className="sr-only">: {stop.name}</span>
                        </a>
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {hasPacking && (
          <section aria-labelledby="packing-title" className="sm:col-start-1">
            <h2 id="packing-title" className="mb-4 flex items-center gap-3 border-b border-border pb-3">
              <BackpackIcon aria-hidden weight="fill" className="size-5 text-highlight" />
              <span className="label text-foreground">Leve com você</span>
            </h2>
            {hasTips && (
              <ul className="grid gap-2 sm:grid-cols-2">
                {ride.tips.map((tip) => (
                  <li key={tip.id} className="flex items-center gap-3 rounded-sm border border-border p-3">
                    <TipIcon name={tip.icon} className="size-6 shrink-0 text-cream-dim" />
                    <span className="text-sm leading-snug">{tip.text}</span>
                  </li>
                ))}
              </ul>
            )}
            {hasPackingNote && (
              <p className={`leading-relaxed ${hasTips ? "mt-4" : ""}`}>{ride.packingNote}</p>
            )}
          </section>
        )}
      </div>

      {hasAttendance && attendance && (
        <section id="presenca" aria-labelledby="attendance-title" className="mt-14 scroll-mt-6">
          <h2 id="attendance-title" className="mb-4 flex items-center gap-3 border-b border-border pb-3">
            <UsersThreeIcon aria-hidden weight="fill" className="size-5 text-highlight" />
            <span className="label text-foreground">Quem foi: {attendance.attended.length}</span>
          </h2>
          {canCorrect && (
            <p className="mb-4 max-w-[34rem] text-sm text-cream-dim">
              Conta quem respondeu que ia. Tire quem faltou e inclua quem apareceu sem responder: é
              isso que vale para o histórico de cada rider.
            </p>
          )}
          {!canCorrect && (
            <PeopleStack
              people={attendedCards}
              viewerId={viewer.userId}
              title="Quem foi"
              label={peopleLabel(attendedCards.length, "rider foi", "riders foram", "Ninguém foi a este passeio.")}
              max={8}
            />
          )}
          {canCorrect && (
            <AttendanceList
              people={attendance.attended}
              rideId={ride.id}
              viewerId={viewer.userId}
              canCorrect
              change="tirar"
              changeLabel="Tirar"
              emptyText="Ninguém foi a este passeio."
            />
          )}

          {canCorrect && (
            <>
              <h3 className="label mt-8 mb-2 text-muted-foreground">
                Não contam: {attendance.others.length}
              </h3>
              <AttendanceList
                people={attendance.others}
                rideId={ride.id}
                viewerId={viewer.userId}
                canCorrect
                change="incluir"
                changeLabel="Incluir"
                emptyText="Todo mundo do grupo foi."
              />
            </>
          )}
        </section>
      )}

      {photoGallery.isOpen && (
        <section id="fotos" aria-labelledby="gallery-title" className="mt-14 scroll-mt-6">
          <h2 id="gallery-title" className="mb-4 flex items-center gap-3 border-b border-border pb-3">
            <ImagesIcon aria-hidden weight="fill" className="size-5 text-highlight" />
            <span className="label text-foreground">Fotos do passeio: {photoGallery.approved.length}</span>
          </h2>

          {hasPhotos && <PhotoGrid photos={photoGallery.approved} />}
          {!hasPhotos && (
            <p className="text-cream-dim">
              Nenhuma foto publicada ainda. Quem fez o passeio pode enviar as suas.
            </p>
          )}

          {hasPendingPhotos && (
            <div className="mt-8 rounded-sm bg-card p-5">
              <h3 className="label text-foreground">
                {viewer.isAdmin ? "Esperando sua aprovação" : "Suas fotos esperando aprovação"}:{" "}
                {photoGallery.pending.length}
              </h3>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {photoGallery.pending.map((photo) => (
                  <li key={photo.id} className="flex gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element -- private photo served by the app, already sized */}
                    <img
                      src={`/fotos/${photo.photoKey}`}
                      alt={`Foto enviada por ${photo.authorName}`}
                      loading="lazy"
                      className="size-24 shrink-0 rounded-sm object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-cream-dim">Enviada por {photo.authorName}</p>
                      <form action={changeRidePhoto} className="mt-1 flex flex-wrap items-center gap-x-5">
                        <input type="hidden" name="rideId" value={ride.id} />
                        <input type="hidden" name="photoId" value={photo.id} />
                        {viewer.isAdmin && (
                          <Button type="submit" name="change" value="aprovar" variant="ghost" size="inline">
                            Aprovar
                          </Button>
                        )}
                        <Button type="submit" name="change" value="apagar" variant="ghost" size="inline">
                          {viewer.isAdmin ? "Recusar" : "Apagar"}
                        </Button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {canSendPhotos && <GalleryUpload rideId={ride.id} remaining={photoGallery.remaining} />}
          {isGalleryFullForViewer && (
            <p className="mt-6 text-sm text-cream-dim">
              Você chegou ao limite de fotos deste passeio.
            </p>
          )}

          {canDeletePublished && (
            <ul className="mt-8 grid max-w-2xl divide-y divide-border border-y border-border">
              {photoGallery.approved.map((photo, index) => (
                <li key={photo.id} className="flex items-center justify-between gap-4 py-1">
                  <span className="text-sm">
                    Foto {index + 1}, de {photo.authorName}
                  </span>
                  <ConfirmAction
                    label={
                      <>
                        Apagar<span className="sr-only"> a foto {index + 1}</span>
                      </>
                    }
                    question="Apagar esta foto da galeria? Não dá para desfazer."
                    confirmLabel="Sim, apagar"
                    keepLabel="Manter foto"
                    action={changeRidePhoto}
                    fields={{ rideId: ride.id, photoId: photo.id, change: "apagar" }}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {showsAnswers && (
        <section aria-labelledby="answers-title" className="mt-14">
          <h2 id="answers-title" className="mb-4 flex items-center gap-3 border-b border-border pb-3">
            <UsersThreeIcon aria-hidden weight="fill" className="size-5 text-highlight" />
            <span className="label text-foreground">Respostas do grupo</span>
          </h2>
          <div className="grid gap-x-10 gap-y-2 sm:grid-cols-3">
            <PeopleStack
              people={ride.cards.going}
              viewerId={viewer.userId}
              title="Quem vai"
              label={peopleLabel(ride.counts.going, "vai", "vão", "Ninguém confirmou ainda.")}
            />
            <PeopleStack
              people={ride.cards.notGoing}
              viewerId={viewer.userId}
              title="Quem não vai"
              label={peopleLabel(ride.counts.notGoing, "não vai", "não vão", "Ninguém recusou.")}
            />
            <PeopleStack
              people={ride.cards.noAnswer}
              viewerId={viewer.userId}
              title="Sem resposta"
              label={peopleLabel(ride.counts.noAnswer, "sem resposta", "sem resposta", "Todo mundo respondeu.")}
            />
          </div>
        </section>
      )}

      {canManage && (
        <section aria-labelledby="manage-title" className="mt-14 rounded-sm bg-card p-5">
          <h2 id="manage-title" className="label text-foreground">
            Gerenciar passeio
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
            {canAnswer && <CopySummary text={shareText} />}
            <Link
              href={`/painel/passeios/${ride.id}`}
              className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
            >
              Editar passeio
            </Link>
            {isOpen && (
              <form action={changeRideStatus} className="w-full sm:w-auto">
                <input type="hidden" name="rideId" value={ride.id} />
                <input type="hidden" name="transition" value="encerrar" />
                <Button type="submit" variant="outline" className="w-full">
                  Encerrar confirmações
                </Button>
              </form>
            )}
            {isClosed && (
              <form action={changeRideStatus} className="w-full sm:w-auto">
                <input type="hidden" name="rideId" value={ride.id} />
                <input type="hidden" name="transition" value="reabrir" />
                <Button type="submit" variant="outline" className="w-full">
                  Reabrir confirmações
                </Button>
              </form>
            )}
            <ConfirmAction
              label="Cancelar passeio"
              question="Cancelar este passeio? Ele sai do Início de vez e não pode ser reaberto. As respostas ficam como histórico."
              confirmLabel="Sim, cancelar passeio"
              keepLabel="Manter passeio"
              action={changeRideStatus}
              fields={{ rideId: ride.id, transition: "cancelar" }}
            />
          </div>
          <p className="mt-3 text-sm text-cream-dim">
            {isOpen
              ? "Encerrar congela as respostas e tira o passeio do Início. Dá para reabrir."
              : "Confirmações encerradas: ninguém troca a resposta até reabrir."}
          </p>
        </section>
      )}
    </AppShell>
  );
}
