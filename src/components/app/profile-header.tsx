import { RoadHorizonIcon } from "@phosphor-icons/react/dist/ssr";

import { Avatar } from "@/components/app/avatar";
import { InstagramLink } from "@/components/app/instagram-link";
import { Badge } from "@/components/ui/badge";
import { groupName } from "@/server/display-name";
import type { MemberProfile, RideHistory } from "@/server/profiles";

type ProfileHeaderProps = {
  person: Pick<MemberProfile, "fullName" | "nickname" | "photoKey" | "accountImage" | "instagram" | "isAdmin">;
  level: RideHistory["level"];
  isBlocked?: boolean;
};

// Who the person is, at the top of their profile: face, the name the group uses, what they
// are in the group and where to find them.
export function ProfileHeader({ person, level, isBlocked = false }: ProfileHeaderProps) {
  const hasNickname = person.nickname !== null;
  const hasInstagram = person.instagram !== null;
  const hasLevel = level !== null;

  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
      <Avatar person={person} size="xl" />
      <div className="min-w-0">
        <h1 className="display text-[clamp(2.25rem,7vw,3.25rem)]">{groupName(person)}</h1>
        {hasNickname && <p className="mt-2 text-lg text-cream-dim">{person.fullName}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-3">
          {isBlocked && <Badge variant="destructive">Bloqueado</Badge>}
          {person.isAdmin && <Badge variant="outline">Administrador</Badge>}
          {hasLevel && (
            <Badge variant="attention">
              <RoadHorizonIcon aria-hidden weight="fill" className="size-3.5" />
              {level.name}
            </Badge>
          )}
          {hasInstagram && <InstagramLink handle={person.instagram ?? ""} />}
        </div>
      </div>
    </header>
  );
}
