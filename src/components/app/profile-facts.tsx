import { CakeIcon, CompassIcon, MapPinIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";

import { type Birthday, experienceLabel, formatBirthday, formatMemberSince, regionLabel } from "@/server/profile-options";

type ProfileFactsProps = {
  profile: {
    bio: string | null;
    region: string | null;
    experience: string | null;
    birthday: Birthday | null;
    memberSince: Date;
  };
};

// What the whole group sees about a person besides name and bikes. Empty facts leave no label
// behind; the time in the group always shows.
export function ProfileFacts({ profile }: ProfileFactsProps) {
  const region = regionLabel(profile.region);
  const experience = experienceLabel(profile.experience);
  const hasBio = profile.bio !== null;
  const hasRegion = region !== null;
  const hasExperience = experience !== null;
  const hasBirthday = profile.birthday !== null;

  return (
    <div className="mt-6">
      {hasBio && <p className="text-lg leading-relaxed">{profile.bio}</p>}

      <dl className={`flex flex-wrap gap-x-8 gap-y-4 ${hasBio ? "mt-5" : ""}`}>
        {hasRegion && (
          <div className="flex items-center gap-3">
            <MapPinIcon aria-hidden className="size-5 shrink-0 text-highlight" />
            <div>
              <dt className="label text-muted-foreground">Região</dt>
              <dd className="font-semibold">{region}</dd>
            </div>
          </div>
        )}
        {hasExperience && (
          <div className="flex items-center gap-3">
            <CompassIcon aria-hidden className="size-5 shrink-0 text-highlight" />
            <div>
              <dt className="label text-muted-foreground">Experiência</dt>
              <dd className="font-semibold">{experience}</dd>
            </div>
          </div>
        )}
        {hasBirthday && profile.birthday && (
          <div className="flex items-center gap-3">
            <CakeIcon aria-hidden className="size-5 shrink-0 text-highlight" />
            <div>
              <dt className="label text-muted-foreground">Aniversário</dt>
              <dd className="font-semibold">{formatBirthday(profile.birthday)}</dd>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3">
          <UsersThreeIcon aria-hidden className="size-5 shrink-0 text-highlight" />
          <div>
            <dt className="label text-muted-foreground">No grupo desde</dt>
            <dd className="font-semibold">{formatMemberSince(profile.memberSince)}</dd>
          </div>
        </div>
      </dl>
    </div>
  );
}
