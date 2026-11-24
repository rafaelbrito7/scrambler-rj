type Named = { fullName: string; nickname: string | null };

// On the group's own screens people go by the name the group uses.
export function groupName(person: Named) {
  return person.nickname ?? person.fullName;
}

// Two letters for the avatar when there is no photo: first and last word of the group name.
export function initialsOf(person: Named) {
  const words = groupName(person).trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? "") : "";

  return `${first}${last}`.toUpperCase();
}

type Pictured = Named & { photoKey: string | null; accountImage: string | null };

export type AvatarSource =
  | { kind: "photo"; url: string }
  | { kind: "account"; url: string }
  | { kind: "initials"; text: string };

// The photo the person sent comes first, then the one from their Google account, then initials.
export function avatarSource(person: Pictured): AvatarSource {
  if (person.photoKey) return { kind: "photo", url: `/fotos/${person.photoKey}` };
  if (person.accountImage) return { kind: "account", url: person.accountImage };

  return { kind: "initials", text: initialsOf(person) };
}

// Management records keep the full name, with the nickname alongside to tell people apart.
export function recordName(person: Named) {
  return person.nickname ? `${person.fullName} (${person.nickname})` : person.fullName;
}

// What any rider may see of another wherever people are counted: enough to recognise the
// person and reach their profile.
export type PersonCard = Pictured & { userId: string; instagram: string | null };
