import type { Database } from "@/server/db";
import { groupName, type PersonCard } from "@/server/display-name";

type Reader = Pick<Database, "profile">;

// Cards for the people who are in the group right now, by the name the group uses. Anyone
// else among the ids is left out, as on the Riders screen.
export async function loadPersonCards(db: Reader, userIds?: string[]): Promise<PersonCard[]> {
  const profiles = await db.profile.findMany({
    where: {
      userId: userIds ? { in: userIds } : undefined,
      user: { joinRequest: { status: "APPROVED" } },
    },
    select: {
      userId: true,
      fullName: true,
      nickname: true,
      instagram: true,
      photoKey: true,
      user: { select: { image: true } },
    },
  });

  return profiles
    .map((profile) => ({
      userId: profile.userId,
      fullName: profile.fullName,
      nickname: profile.nickname,
      instagram: profile.instagram,
      photoKey: profile.photoKey,
      accountImage: profile.user.image,
    }))
    .toSorted((a, b) => groupName(a).localeCompare(groupName(b), "pt-BR"));
}
