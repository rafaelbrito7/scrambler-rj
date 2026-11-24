import { gallery, photos } from "@/server/services";
import { getViewer } from "@/server/session";

type RouteContext = {
  params: Promise<{ key: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const viewer = await getViewer();

  if (viewer?.state !== "approved") return new Response(null, { status: 404 });

  const { key } = await params;

  if (!(await gallery.canSeeFile(viewer.userId, key))) return new Response(null, { status: 404 });

  const photo = await photos.read(key);

  if (!photo) return new Response(null, { status: 404 });

  return new Response(Buffer.from(photo.bytes), {
    headers: {
      "Content-Type": photo.contentType,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
