import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { Access, AccessState } from "@/server/access";
import { access } from "@/server/services";

export type Viewer = Access & {
  userId: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export async function getViewer(): Promise<Viewer | null> {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) return null;

  const userId = user.id;

  return {
    userId,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
    ...(await access.getAccess(userId)),
  };
}

const homeByState: Record<AccessState, string> = {
  none: "/pedido",
  pending: "/situacao",
  rejected: "/situacao",
  blocked: "/situacao",
  approved: "/inicio",
};

export function homeFor(viewer: Viewer | null) {
  return viewer ? homeByState[viewer.state] : "/";
}

// Every signed-in page calls this, so a state change cuts access on the next request,
// including through a direct link.
export async function requireState(...allowed: AccessState[]): Promise<Viewer> {
  const viewer = await getViewer();

  if (!viewer || !allowed.includes(viewer.state)) redirect(homeFor(viewer));

  return viewer;
}

// For pages reached from a shared link: someone who is not signed in comes back here after
// entering, instead of landing on the home screen.
export async function requireParticipant(returnTo: string): Promise<Viewer> {
  const viewer = await getViewer();

  if (!viewer) redirect(`/?voltar=${encodeURIComponent(returnTo)}`);
  if (viewer.state !== "approved") redirect(homeFor(viewer));

  return viewer;
}

export async function requireAdmin(): Promise<Viewer> {
  const viewer = await requireState("approved");

  if (!viewer.isAdmin) redirect(homeFor(viewer));

  return viewer;
}
