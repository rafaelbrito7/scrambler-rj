"use client";

import Link from "next/link";
import { useRef } from "react";

import { Avatar } from "@/components/app/avatar";
import { profileHref } from "@/components/app/format";
import { InstagramLink } from "@/components/app/instagram-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { groupName, type PersonCard, recordName } from "@/server/display-name";

type PeopleStackProps = {
  people: PersonCard[];
  viewerId: string;
  // What the window is called: "Quem vai".
  title: string;
  // The count in words, always beside the faces: "4 vão".
  label: string;
  max?: number;
  // The panel names people as its records do: full name, nickname alongside.
  naming?: "group" | "record";
};

// Every count of people on the group's screens: overlapping faces with the count in words,
// opening a window with each person and the way to their profile.
export function PeopleStack({ people, viewerId, title, label, max = 5, naming = "group" }: PeopleStackProps) {
  const nameOf = naming === "record" ? recordName : groupName;
  const dialog = useRef<HTMLDialogElement>(null);
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  const hasPeople = people.length > 0;
  const hasExtra = extra > 0;

  if (!hasPeople) return <p className="flex min-h-11 items-center text-sm text-muted-foreground">{label}</p>;

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-haspopup="dialog"
        className="group flex min-h-11 max-w-full cursor-pointer items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring"
      >
        <span aria-hidden="true" className="flex shrink-0 items-center">
          {shown.map((person, index) => (
            <span
              key={person.userId}
              className={`rounded-full ring-2 ring-background ${index === 0 ? "" : "-ml-3"}`}
            >
              <Avatar person={person} size="sm" />
            </span>
          ))}
          {hasExtra && (
            <span className="label -ml-3 inline-flex size-10 items-center justify-center rounded-full bg-secondary text-xs text-foreground ring-2 ring-background">
              +{extra}
            </span>
          )}
        </span>
        <span className="text-sm font-semibold underline decoration-border underline-offset-4 group-hover:text-highlight group-hover:decoration-primary">
          {label}
          <span className="sr-only">: ver quem</span>
        </span>
      </button>

      <dialog
        ref={dialog}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
        aria-label={title}
        className="m-auto max-h-[86dvh] w-[min(92vw,30rem)] rounded-sm bg-card p-0 text-foreground backdrop:bg-black/80"
      >
        <div className="flex max-h-[86dvh] flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
            <h2 className="label text-foreground">
              {title}: {people.length}
            </h2>
            <Button type="button" variant="ghost" size="inline" onClick={() => dialog.current?.close()}>
              Fechar
            </Button>
          </div>
          <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto px-5">
            {people.map((person) => {
              const isSelf = person.userId === viewerId;
              const hasInstagram = person.instagram !== null;

              return (
                <li key={person.userId} className="flex items-center gap-4 py-3">
                  <Avatar person={person} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {nameOf(person)}
                      {isSelf && <span className="font-normal text-cream-dim"> (você)</span>}
                    </p>
                    {hasInstagram && <InstagramLink handle={person.instagram ?? ""} variant="quiet" />}
                  </div>
                  <Link
                    href={profileHref(person.userId, viewerId)}
                    className={buttonVariants({ variant: "ghost", size: "inline", className: "shrink-0" })}
                  >
                    Ver perfil<span className="sr-only"> de {groupName(person)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </dialog>
    </>
  );
}
