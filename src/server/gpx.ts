// Reads the GPX an administrator exported from a device or app. Pure, no XML library: a GPX
// file is a list of points with latitude and longitude as attributes, which is all the ride
// needs from it. Every track and segment in the file is read as one continuous road.

// [longitude, latitude], the order maps draw in.
export type TrackLine = [number, number][];

export type GpxReading =
  | { ok: true; line: TrackLine; km: number }
  | { ok: false; reason: "MALFORMED" | "EMPTY" };

export const MAX_GPX_BYTES = 5 * 1024 * 1024;

export const MAX_TRACK_POINTS = 5000;

const EARTH_RADIUS_KM = 6371;

function radians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

// Length of the line over the ground, in kilometres.
export function lineKm(line: TrackLine) {
  let total = 0;

  for (let index = 1; index < line.length; index += 1) {
    const [lonA, latA] = line[index - 1];
    const [lonB, latB] = line[index];
    const half =
      Math.sin(radians(latB - latA) / 2) ** 2 +
      Math.cos(radians(latA)) * Math.cos(radians(latB)) * Math.sin(radians(lonB - lonA) / 2) ** 2;

    total += 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(half));
  }

  return total;
}

function pointsOf(gpx: string, tag: "trkpt" | "rtept"): TrackLine | null {
  const line: TrackLine = [];

  // Some exporters prefix every tag with a namespace: <gpx:trkpt>.
  for (const [, attributes] of gpx.matchAll(new RegExp(`<(?:[\\w-]+:)?${tag}\\b([^>]*)>`, "g"))) {
    const lat = /\blat\s*=\s*["']([^"']*)["']/.exec(attributes)?.[1];
    const lon = /\blon\s*=\s*["']([^"']*)["']/.exec(attributes)?.[1];
    const point: [number, number] = [Number(lon), Number(lat)];
    const isOnEarth =
      lat !== undefined &&
      lon !== undefined &&
      lat.trim() !== "" &&
      lon.trim() !== "" &&
      Math.abs(point[1]) <= 90 &&
      Math.abs(point[0]) <= 180;

    if (!isOnEarth) return null;

    line.push(point);
  }

  return line;
}

export function readGpx(file: string): GpxReading {
  const gpx = file.replace(/<!--[\s\S]*?-->/g, "");

  if (!/<(?:[\w-]+:)?gpx\b/i.test(gpx)) return { ok: false, reason: "MALFORMED" };

  // A recorded track is the road actually ridden; a planned route is the fallback.
  const track = pointsOf(gpx, "trkpt");
  const route = track !== null && track.length === 0 ? pointsOf(gpx, "rtept") : track;

  if (route === null) return { ok: false, reason: "MALFORMED" };
  if (route.length < 2) return { ok: false, reason: "EMPTY" };

  return { ok: true, line: route, km: Math.max(1, Math.round(lineKm(route))) };
}

// Squared distance, in degrees, from a point to the stretch between two others.
function squaredDistanceToStretch(point: [number, number], from: [number, number], to: [number, number]) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = dx * dx + dy * dy;
  const along =
    length === 0 ? 0 : Math.min(1, Math.max(0, ((point[0] - from[0]) * dx + (point[1] - from[1]) * dy) / length));
  const x = from[0] + along * dx - point[0];
  const y = from[1] + along * dy - point[1];

  return x * x + y * y;
}

// Keeps the points that give the line its shape: every point farther than the tolerance from
// the straight stretch around it stays (Douglas-Peucker, without recursion, since a recorded
// track can be tens of thousands of points long).
function keepShape(line: TrackLine, tolerance: number) {
  const keeps = new Uint8Array(line.length);
  const pending: [number, number][] = [[0, line.length - 1]];

  keeps[0] = 1;
  keeps[line.length - 1] = 1;

  while (pending.length > 0) {
    const [first, last] = pending.pop() as [number, number];
    let farthest = -1;
    let distance = tolerance * tolerance;

    for (let index = first + 1; index < last; index += 1) {
      const candidate = squaredDistanceToStretch(line[index], line[first], line[last]);

      if (candidate > distance) {
        farthest = index;
        distance = candidate;
      }
    }

    if (farthest === -1) continue;

    keeps[farthest] = 1;
    pending.push([first, farthest], [farthest, last]);
  }

  return line.filter((_point, index) => keeps[index] === 1);
}

// About one metre, in degrees: below what a map shows at any zoom a ride is looked at.
const FINEST_TOLERANCE = 0.00001;

// Brings a track down to what the map needs. The tolerance starts at a metre and doubles only
// while the line is still too long, so a track is never coarser than its length requires.
export function simplifyLine(line: TrackLine, maxPoints = MAX_TRACK_POINTS): TrackLine {
  let simplified = line;

  for (let tolerance = FINEST_TOLERANCE; simplified.length > maxPoints; tolerance *= 2) {
    simplified = keepShape(line, tolerance);
  }

  return simplified;
}
