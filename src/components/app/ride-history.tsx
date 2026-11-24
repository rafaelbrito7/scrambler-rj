import { FireIcon, PathIcon, TrophyIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { PhotoGrid } from "@/app/passeios/[id]/photo-grid";
import { countLabel, formatPastDay } from "@/components/app/format";
import type { RideHistory as History } from "@/server/profiles";

type RideHistoryProps = { history: History; name: string; isOwn: boolean };

// A person's road with the group: how many rides, the badge ahead, the run of months, the
// latest rides and the photos they brought back.
export function RideHistory({ history, name, isOwn }: RideHistoryProps) {
  const { count, level, streak } = history;
  const hasRidden = count > 0;
  const next = level?.next ?? null;
  const hasNext = next !== null;
  const showsStreak = streak.current >= 2;
  const showsBest = streak.best >= 2 && streak.best > streak.current;
  const hasRecent = history.recent.length > 0;
  const hasPhotos = history.photos.length > 0;
  const emptyText = isOwn
    ? "Você ainda não fez passeio com o grupo. O primeiro rende o selo Primeira saída."
    : "Ainda não fez passeio com o grupo.";
  const photos = history.photos.map((photo) => ({ id: photo.id, photoKey: photo.photoKey, authorName: name }));

  return (
    <section aria-labelledby="history-title" className="mt-12">
      <h2 id="history-title" className="label text-foreground">
        Estrada com o grupo
      </h2>

      {!hasRidden && <p className="mt-3 text-cream-dim">{emptyText}</p>}
      {hasRidden && (
        <>
          <dl className="mt-4 flex flex-wrap gap-2">
            <div className="min-w-32 grow basis-0 rounded-sm bg-card p-4">
              <PathIcon aria-hidden className="size-5 text-highlight" />
              <dt className="label mt-3 text-muted-foreground">Passeios feitos</dt>
              <dd className="display mt-1 text-4xl">{count}</dd>
            </div>
            {showsStreak && (
              <div className="min-w-32 grow basis-0 rounded-sm bg-card p-4">
                <FireIcon aria-hidden className="size-5 text-highlight" />
                <dt className="label mt-3 text-muted-foreground">Sequência</dt>
                <dd className="mt-1 text-lg leading-tight font-semibold">
                  <span className="display text-4xl">{streak.current}</span> meses seguidos
                </dd>
              </div>
            )}
            {showsBest && (
              <div className="min-w-32 grow basis-0 rounded-sm bg-card p-4">
                <TrophyIcon aria-hidden className="size-5 text-highlight" />
                <dt className="label mt-3 text-muted-foreground">Recorde</dt>
                <dd className="mt-1 text-lg leading-tight font-semibold">
                  <span className="display text-4xl">{streak.best}</span> meses seguidos
                </dd>
              </div>
            )}
          </dl>
          {hasNext && (
            <p className="mt-3 text-sm text-cream-dim">
              {next.remaining === 1 ? "Falta" : "Faltam"} {countLabel(next.remaining, "passeio", "passeios")} para o
              selo {next.name}.
            </p>
          )}
        </>
      )}

      {hasRecent && (
        <>
          <h3 className="label mt-8 text-muted-foreground">Passeios recentes</h3>
          <ul className="mt-2 divide-y divide-border border-y border-border">
            {history.recent.map((ride) => (
              <li key={ride.id}>
                <Link
                  href={`/passeios/${ride.id}`}
                  className="group flex min-h-12 items-center justify-between gap-4 py-2"
                >
                  <span className="min-w-0 truncate font-semibold group-hover:text-highlight">{ride.route}</span>
                  <span className="shrink-0 text-sm text-cream-dim">{formatPastDay(ride.startsAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {hasPhotos && (
        <>
          <h3 className="label mt-8 mb-3 text-muted-foreground">Fotos nos passeios</h3>
          <PhotoGrid photos={photos} />
        </>
      )}
    </section>
  );
}
