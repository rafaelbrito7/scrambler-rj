import { ImagesIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

import { countLabel, formatPastDay, formatRideDay, formatRideTime, peopleLabel } from "@/components/app/format";
import { PeopleStack } from "@/components/app/people-stack";
import { RideAnswer } from "@/components/app/ride-answer";
import { RideStatusBadge } from "@/components/app/status-badge";
import { difficultyLabel, formatRideDuration } from "@/server/ride-options";
import type { RideSummary } from "@/server/rides";

type RideCardProps = { ride: RideSummary; viewerId: string; isFirst: boolean };

// A ride still ahead: when, where, who is going and the person's own answer, in place.
export function RideCard({ ride, viewerId, isFirst }: RideCardProps) {
  const href = `/passeios/${ride.id}`;
  const hasPhoto = ride.photoKey !== null;
  const isOpen = ride.status === "OPEN";
  const layout = hasPhoto ? "sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" : "";
  const sheetLine = [ride.distanceKm ? `${ride.distanceKm} km` : null, difficultyLabel(ride.difficulty)]
    .filter(Boolean)
    .join(" · ");
  const hasSheet = sheetLine !== "";
  const others = `${peopleLabel(ride.counts.notGoing, "não vai", "não vão", "0 não vão")} · ${ride.counts.noAnswer} sem resposta`;

  return (
    <li className={`overflow-hidden rounded-sm bg-card ${layout}`}>
      {hasPhoto && (
        <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-video sm:aspect-auto sm:min-h-full">
          <Image
            src={`/fotos/${ride.photoKey}`}
            alt=""
            fill
            unoptimized
            priority={isFirst}
            sizes="(min-width: 640px) 22rem, 100vw"
            className="object-cover"
          />
        </Link>
      )}

      <div className="flex flex-col">
        <Link href={href} className="group block px-5 pt-5">
          {!isOpen && (
            <span className="mb-3 block">
              <RideStatusBadge status={ride.status} />
            </span>
          )}
          <p className="label text-highlight">
            {formatRideDay(ride.startsAt)} · saída {formatRideTime(ride.startsAt)}
          </p>
          <h3 className="display mt-2 text-2xl group-hover:underline group-hover:underline-offset-4">
            {ride.route}
          </h3>
          <p className="mt-2">Encontro: {ride.meetingPoint}</p>
          {hasSheet && <p className="mt-1 font-semibold">{sheetLine}</p>}
        </Link>

        <div className="px-5 pt-3">
          <PeopleStack
            people={ride.cards.going}
            viewerId={viewerId}
            title="Quem vai"
            label={peopleLabel(ride.counts.going, "vai", "vão", "Ninguém confirmou ainda")}
          />
          <p className="text-sm text-muted-foreground">{others}</p>
        </div>

        {isOpen && (
          <div className="mt-5 flex-1 border-t border-border p-5">
            <RideAnswer key={ride.myAnswer ?? "none"} rideId={ride.id} route={ride.route} answer={ride.myAnswer} />
          </div>
        )}
        {!isOpen && <div className="pb-5" />}
      </div>
    </li>
  );
}

type DoneRideCardProps = { ride: RideSummary; viewerId: string; photoCount: number };

// A ride the group has done: the day, the road, how long it took and who was there.
export function DoneRideCard({ ride, viewerId, photoCount }: DoneRideCardProps) {
  const href = `/passeios/${ride.id}`;
  const hasPhoto = ride.photoKey !== null;
  const attended = ride.cards.attended ?? [];
  const minutes = Math.round((ride.returnsAt.getTime() - ride.startsAt.getTime()) / 60_000);
  const facts = [
    ride.distanceKm ? `${ride.distanceKm} km` : null,
    minutes > 0 ? `${formatRideDuration(minutes)} de passeio` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const hasFacts = facts !== "";
  const hasPhotos = photoCount > 0;

  return (
    <li className="flex flex-col overflow-hidden rounded-sm bg-card">
      <Link href={href} className="group block">
        {hasPhoto && (
          <div className="relative aspect-video">
            <Image
              src={`/fotos/${ride.photoKey}`}
              alt=""
              fill
              unoptimized
              sizes="(min-width: 640px) 26rem, 100vw"
              className="object-cover"
            />
          </div>
        )}
        <div className="px-5 pt-5">
          <p className="label text-muted-foreground">{formatPastDay(ride.startsAt)}</p>
          <h3 className="display mt-2 text-2xl group-hover:underline group-hover:underline-offset-4">
            {ride.route}
          </h3>
          {hasFacts && <p className="mt-2 font-semibold">{facts}</p>}
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-wrap items-end justify-between gap-x-6 gap-y-1 px-5 pb-4">
        <PeopleStack
          people={attended}
          viewerId={viewerId}
          title="Quem foi"
          label={peopleLabel(attended.length, "foi", "foram", "Ninguém foi")}
        />
        {hasPhotos && (
          <Link
            href={`${href}#fotos`}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline decoration-border underline-offset-4 hover:text-highlight hover:decoration-primary"
          >
            <ImagesIcon aria-hidden className="size-5 text-highlight" />
            {countLabel(photoCount, "foto", "fotos")}
          </Link>
        )}
      </div>
    </li>
  );
}
