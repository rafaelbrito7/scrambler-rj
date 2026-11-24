import { getOrigin } from "@/server/origin";
import { buildRideCalendar } from "@/server/ride-calendar";
import { RideError } from "@/server/rides";
import { rides } from "@/server/services";
import { getViewer } from "@/server/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const viewer = await getViewer();

  if (viewer?.state !== "approved") return new Response(null, { status: 404 });

  const { id } = await params;

  try {
    const ride = await rides.getRide(viewer.userId, id);

    if (ride.status === "CANCELLED") return new Response(null, { status: 404 });

    return new Response(buildRideCalendar(ride, await getOrigin(), new Date()), {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="passeio-scrambler-rj.ics"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof RideError) return new Response(null, { status: 404 });

    throw error;
  }
}
