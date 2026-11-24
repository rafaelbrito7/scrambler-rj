import { CakeIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { BikePhoto } from "@/components/app/bike-photo";
import { AppShell } from "@/components/app/app-shell";
import { Avatar } from "@/components/app/avatar";
import { Badge } from "@/components/ui/badge";
import { groupName } from "@/server/display-name";
import { access, profiles } from "@/server/services";
import { requireState } from "@/server/session";

export const metadata: Metadata = { title: "Riders | Scrambler RJ" };

export default async function GroupPage() {
  const viewer = await requireState("approved");
  const [members, birthdays, pendingCount] = await Promise.all([
    profiles.listGroup(viewer.userId),
    profiles.listBirthdays(viewer.userId),
    viewer.isAdmin ? access.countPending(viewer.userId) : 0,
  ]);

  const hasBirthdays = birthdays.people.length > 0;

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount}>
      <div className="max-w-2xl">
        <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Riders</h1>
        <p className="mt-3 text-cream-dim">
          {members.length} {members.length === 1 ? "rider" : "riders"} no Scrambler RJ
        </p>

        {hasBirthdays && (
          <section aria-labelledby="birthdays-title" className="mt-8 rounded-sm bg-card p-5">
            <h2 id="birthdays-title" className="flex items-center gap-3">
              <CakeIcon aria-hidden weight="fill" className="size-5 text-highlight" />
              <span className="label text-foreground">Aniversariantes de {birthdays.monthName}</span>
            </h2>
            <ul className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2">
              {birthdays.people.map((person) => {
                const href = person.userId === viewer.userId ? "/perfil" : `/grupo/${person.userId}`;

                return (
                  <li key={person.userId}>
                    <Link href={href} className="group flex min-h-12 items-center gap-3">
                      <span className="w-9 shrink-0 text-xl font-semibold text-highlight tabular-nums">
                        {person.day}
                      </span>
                      <Avatar person={person} size="sm" />
                      <span className="min-w-0 truncate font-semibold group-hover:text-highlight">
                        {groupName(person)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <ul className="mt-8 divide-y divide-border border-y border-border">
          {members.map((member) => {
            const isSelf = member.userId === viewer.userId;
            const href = isSelf ? "/perfil" : `/grupo/${member.userId}`;

            return (
              <li key={member.userId}>
                <Link href={href} className="group flex min-h-14 items-center gap-4 py-3">
                  <Avatar person={member} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold group-hover:text-highlight">
                      {groupName(member)}
                      {isSelf && <span className="font-normal text-cream-dim">(você)</span>}
                      {member.isAdmin && <Badge variant="outline">Administrador</Badge>}
                    </span>
                    <span className="mt-0.5 block text-sm text-cream-dim">{member.mainBike.model}</span>
                  </span>
                  {member.mainBike.photoKey !== null && (
                    <BikePhoto photoKey={member.mainBike.photoKey} className="w-16" sizes="4rem" />
                  )}
                  <span aria-hidden="true" className="text-cream-dim group-hover:text-highlight">
                    ›
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </AppShell>
  );
}
