import type { AccessService } from "@/server/access";
import type { Database } from "@/server/db";
import { groupName, type PersonCard } from "@/server/display-name";
import { parsePriceToCents } from "@/server/batches";
import { MAX_GPX_BYTES, readGpx, simplifyLine } from "@/server/gpx";
import { encodePolyline6 } from "@/server/polyline";
import {
  DIFFICULTIES,
  MAX_STOPS,
  PACKING_NOTE_MAX_LENGTH,
  PLAN_B_MAX_LENGTH,
  parseRideTime,
  type RideTipItem,
  TIP_ICONS,
  TIP_TEXT_MAX_LENGTH,
  SURFACES,
  RIDE_DESCRIPTION_MAX_LENGTH,
  STOP_KINDS,
  STOP_NOTE_MAX_LENGTH,
  type StopInput,
} from "@/server/ride-options";

export type RideInput = {
  route: string;
  description: string;
  date: string;
  meetingTime: string;
  departureTime: string;
  returnTime: string;
  mapUrl: string;
  photoKey: string | null;
  distanceKm: string;
  surface: string;
  difficulty: string;
  rideTime: string;
  tolls: string;
  tipIds: string[];
  packingNote: string;
  planB: string;
  stops: StopInput[];
  // What to do with the road drawn from a GPX file. Absent means keep what the ride has.
  track?: TrackChange;
};

// A GPX file takes the place of the route the map calculates; removing it gives that back.
export type TrackChange = { kind: "keep" } | { kind: "remove" } | { kind: "replace"; gpx: string };

export type RideField =
  | "route"
  | "description"
  | "date"
  | "meetingTime"
  | "departureTime"
  | "returnTime"
  | "mapUrl"
  | "distanceKm"
  | "surface"
  | "difficulty"
  | "rideTime"
  | "tolls"
  | "tips"
  | "packingNote"
  | "planB"
  | "stops"
  | "gpx";

export type RideStop = {
  kind: string;
  name: string;
  place: string | null;
  time: string | null;
  note: string | null;
  lat: number | null;
  lon: number | null;
};

export type RideFieldErrors = Partial<Record<RideField, string>>;

type RideErrorCode =
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_INPUT"
  | "RIDE_NOT_OPEN"
  | "INVALID_STATE"
  | "RIDE_NOT_OVER";

export type TipInput = { text: string; icon: string };

export type ManagedTip = RideTipItem & { active: boolean };

export class RideError extends Error {
  readonly name = "RideError";

  constructor(
    readonly code: RideErrorCode,
    readonly fieldErrors: RideFieldErrors = {},
  ) {
    super(code);
  }
}

export type RideAnswer = "GOING" | "NOT_GOING";

export type RideSummary = {
  id: string;
  route: string;
  meetingPoint: string;
  startsAt: Date;
  returnsAt: Date;
  meetsAt: Date | null;
  // The route sheet. All null on a ride published before it existed.
  distanceKm: number | null;
  surface: string | null;
  difficulty: string | null;
  rideMinutes: number | null;
  tollCents: number | null;
  mapUrl: string | null;
  photoKey: string | null;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  counts: { going: number; notGoing: number; noAnswer: number };
  myAnswer: RideAnswer | null;
  // True once the ride has set off and was not cancelled: it counts as done.
  isOver: boolean;
  // The people behind each count, for the avatar rows. `attended` is null until the ride is over.
  cards: {
    going: PersonCard[];
    notGoing: PersonCard[];
    noAnswer: PersonCard[];
    attended: PersonCard[] | null;
  };
};

export type RidePerson = { userId: string; name: string };

// Someone on the list of who was on a ride. `corrected` marks an administrator's override.
export type AttendancePerson = RidePerson & { corrected: boolean };

export type RideDetails = RideSummary & {
  description: string | null;
  // The road from the group's GPX file, as an encoded line, or null when the map calculates it.
  track: string | null;
  // What to bring, in the list's order, plus the organiser's own words.
  tips: RideTipItem[];
  packingNote: string | null;
  planB: string | null;
  // Who was there, once the ride has set off: the people who said they would go, as adjusted
  // by an administrator. Null before the ride and on a cancelled one.
  attendance: { attended: AttendancePerson[]; others: AttendancePerson[] } | null;
  // In order. A ride published before stops existed shows its meeting point as the only one.
  stops: RideStop[];
  going: string[];
  notGoing: string[];
  noAnswer: string[];
  // The same three lists with the person attached, so a name can lead to a profile.
  people: { going: RidePerson[]; notGoing: RidePerson[]; noAnswer: RidePerson[] };
};

// The group rides in Rio; Brazil has had no daylight saving time since 2019.
const RIO_OFFSET = "-03:00";

function toInstant(date: string, time: string) {
  const isWellFormed = /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(time);

  if (!isWellFormed) return null;

  const instant = new Date(`${date}T${time}:00${RIO_OFFSET}`);

  if (Number.isNaN(instant.getTime())) return null;

  // Rejects dates the calendar does not have, such as 31 February, which Date would roll over.
  const rioDate = new Date(instant.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return rioDate === date ? instant : null;
}

function isWebAddress(text: string) {
  try {
    return ["http:", "https:"].includes(new URL(text).protocol);
  } catch {
    return false;
  }
}

function validateStops(stops: StopInput[]) {
  if (stops.length === 0) return { error: "Inclua ao menos a parada de encontro." };
  if (stops.length > MAX_STOPS) return { error: `Use no máximo ${MAX_STOPS} paradas.` };

  const valid: RideStop[] = [];

  for (const [index, stop] of stops.entries()) {
    const label = `Parada ${index + 1}`;
    const name = stop.name.trim();
    const place = stop.place.trim();
    const time = stop.time.trim();
    const note = stop.note.trim();

    if (!STOP_KINDS.some((option) => option.value === stop.kind)) {
      return { error: `${label}: escolha o tipo.` };
    }

    if (index === 0 && stop.kind !== "MEETING") {
      return { error: "A primeira parada é sempre o encontro." };
    }

    if (name.length < 2) return { error: `${label}: informe o nome.` };
    if (name.length > 80) return { error: `${label}: use no máximo 80 caracteres no nome.` };
    if (place.length > 120) return { error: `${label}: use no máximo 120 caracteres no local.` };
    if (time && !toInstant("2024-01-01", time)) return { error: `${label}: informe o horário como 08:30.` };

    if (note.length > STOP_NOTE_MAX_LENGTH) {
      return { error: `${label}: use no máximo ${STOP_NOTE_MAX_LENGTH} caracteres na observação.` };
    }

    const latText = (stop.lat ?? "").trim();
    const lonText = (stop.lon ?? "").trim();
    const hasPin = latText !== "" || lonText !== "";
    const lat = hasPin ? Number(latText) : null;
    const lon = hasPin ? Number(lonText) : null;
    const isOnEarth =
      lat !== null && lon !== null && latText !== "" && lonText !== "" && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;

    if (hasPin && !isOnEarth) return { error: `${label}: marque o ponto no mapa de novo.` };

    valid.push({ kind: stop.kind, name, place: place || null, time: time || null, note: note || null, lat, lon });
  }

  return { stops: valid };
}

export const GPX_TOO_LARGE_MESSAGE = "O arquivo GPX passa de 5 MB. Exporte a rota com menos pontos.";

const gpxErrors = {
  MALFORMED: "Esse arquivo não é um GPX que dê para ler. Exporte de novo pelo aplicativo.",
  EMPTY: "O GPX não tem trilha nem rota com ao menos dois pontos.",
};

type TrackReading =
  | { kind: "unchanged" }
  | { kind: "refused"; message: string }
  | { kind: "read"; track: string; km: number };

// Read on the server, with nothing sent anywhere: the track and its length come from the file.
function readTrack(change: TrackChange): TrackReading {
  if (change.kind !== "replace") return { kind: "unchanged" };
  if (Buffer.byteLength(change.gpx) > MAX_GPX_BYTES) return { kind: "refused", message: GPX_TOO_LARGE_MESSAGE };

  const reading = readGpx(change.gpx);

  if (!reading.ok) return { kind: "refused", message: gpxErrors[reading.reason] };

  return { kind: "read", track: encodePolyline6(simplifyLine(reading.line)), km: reading.km };
}

function validate(input: RideInput) {
  const fieldErrors: RideFieldErrors = {};
  const trackChange = input.track ?? { kind: "keep" };
  const trackReading = readTrack(trackChange);
  const route = input.route.trim();
  const description = input.description.trim();
  const mapUrl = input.mapUrl.trim();
  const meetingTime = input.meetingTime.trim();
  const startsAt = toInstant(input.date, input.departureTime);
  const returnsAt = toInstant(input.date, input.returnTime);
  const meetsAt = meetingTime ? toInstant(input.date, meetingTime) : null;
  const checkedStops = validateStops(input.stops);

  if (route.length < 3) fieldErrors.route = "Informe o percurso.";
  if (route.length > 80) fieldErrors.route = "Use no máximo 80 caracteres.";

  if (description.length > RIDE_DESCRIPTION_MAX_LENGTH) {
    fieldErrors.description = `Use no máximo ${RIDE_DESCRIPTION_MAX_LENGTH} caracteres.`;
  }

  if (!toInstant(input.date, "12:00")) fieldErrors.date = "Informe a data do passeio.";
  if (!/^\d{2}:\d{2}$/.test(input.departureTime) || (input.date && !startsAt)) {
    fieldErrors.departureTime = "Informe o horário de saída.";
  }

  if (meetingTime && !/^\d{2}:\d{2}$/.test(meetingTime)) {
    fieldErrors.meetingTime = "Informe o horário de encontro, ou deixe em branco.";
  } else if (meetsAt && startsAt && meetsAt > startsAt) {
    fieldErrors.meetingTime = "O encontro não pode ser depois da saída.";
  }

  if (!/^\d{2}:\d{2}$/.test(input.returnTime) || (input.date && !returnsAt)) {
    fieldErrors.returnTime = "Informe a previsão de retorno.";
  } else if (startsAt && returnsAt && returnsAt <= startsAt) {
    fieldErrors.returnTime = "O retorno precisa ser depois da saída.";
  }

  if (mapUrl && !isWebAddress(mapUrl)) {
    fieldErrors.mapUrl = "Cole o link completo do mapa, começando com https://.";
  }

  const distanceText = input.distanceKm.trim();
  // With a new file the distance is the file's, whatever was typed.
  const typedKm = /^\d{1,4}$/.test(distanceText) ? Number(distanceText) : null;
  const distanceKm = trackReading.kind === "read" ? trackReading.km : typedKm;
  const rideTimeText = input.rideTime.trim();
  const rideMinutes = rideTimeText ? parseRideTime(rideTimeText) : null;
  const tollsText = input.tolls.trim();
  const tollCents = tollsText ? parsePriceToCents(tollsText) : null;

  if (distanceKm === null || distanceKm < 1) {
    fieldErrors.distanceKm = "Informe a distância total em quilômetros, só números.";
  }

  if (!SURFACES.some((option) => option.value === input.surface)) {
    fieldErrors.surface = "Escolha o tipo de piso.";
  }

  if (!DIFFICULTIES.some((option) => option.value === input.difficulty)) {
    fieldErrors.difficulty = "Escolha a dificuldade.";
  }

  if (rideTimeText && rideMinutes === null) {
    fieldErrors.rideTime = "Informe o tempo de moto como 3h20, ou deixe em branco.";
  }

  if (tollsText && tollCents === null) {
    fieldErrors.tolls = "Informe o valor dos pedágios em reais, por exemplo 14,50.";
  }

  const packingNote = input.packingNote.trim();
  const planB = input.planB.trim();

  if (packingNote.length > PACKING_NOTE_MAX_LENGTH) {
    fieldErrors.packingNote = `Use no máximo ${PACKING_NOTE_MAX_LENGTH} caracteres.`;
  }

  if (planB.length > PLAN_B_MAX_LENGTH) {
    fieldErrors.planB = `Use no máximo ${PLAN_B_MAX_LENGTH} caracteres.`;
  }

  if (checkedStops.error) fieldErrors.stops = checkedStops.error;
  if (trackReading.kind === "refused") fieldErrors.gpx = trackReading.message;

  const stops = checkedStops.stops;

  if (Object.keys(fieldErrors).length > 0 || !startsAt || !returnsAt || !stops) {
    throw new RideError("INVALID_INPUT", fieldErrors);
  }

  // Lists and the share text still read one line for where the ride starts.
  const meeting = stops[0];
  const meetingPoint = [meeting.name, meeting.place].filter(Boolean).join(", ").slice(0, 120);

  return {
    ride: {
      route,
      description: description || null,
      meetingPoint,
      startsAt,
      returnsAt,
      meetsAt,
      mapUrl: mapUrl || null,
      distanceKm,
      surface: input.surface,
      difficulty: input.difficulty,
      rideMinutes,
      tollCents,
      packingNote: packingNote || null,
      planB: planB || null,
    },
    tipIds: [...new Set(input.tipIds)],
    stops,
    // Undefined leaves the stored track alone.
    track: trackChange.kind === "remove" ? null : trackReading.kind === "read" ? trackReading.track : undefined,
  };
}

const rideInclude = {
  responses: { select: { userId: true, answer: true } },
  attendance: { select: { userId: true, counts: true } },
  stops: { orderBy: { position: "asc" } },
  tips: { select: { tip: { select: { id: true, text: true, icon: true, position: true } } } },
} as const;

export function createRideService(
  db: Database,
  access: Pick<AccessService, "getAccess">,
  now: () => Date = () => new Date(),
) {
  async function assertApproved(userId: string) {
    const viewer = await access.getAccess(userId);

    if (viewer.state !== "approved") throw new RideError("FORBIDDEN");
  }

  async function assertAdmin(userId: string) {
    const viewer = await access.getAccess(userId);

    if (!viewer.isAdmin) throw new RideError("FORBIDDEN");
  }

  // Only people who are in the group right now count: a blocked participant's old answer
  // drops out of the lists without being erased.
  async function listParticipants() {
    const requests = await db.joinRequest.findMany({
      where: { status: "APPROVED" },
      select: {
        userId: true,
        fullName: true,
        user: {
          select: {
            image: true,
            profile: { select: { fullName: true, nickname: true, instagram: true, photoKey: true } },
          },
        },
      },
    });

    return requests
      .map((request) => ({
        userId: request.userId,
        fullName: request.user.profile ? groupName(request.user.profile) : request.fullName,
        card: {
          userId: request.userId,
          fullName: request.user.profile?.fullName ?? request.fullName,
          nickname: request.user.profile?.nickname ?? null,
          instagram: request.user.profile?.instagram ?? null,
          photoKey: request.user.profile?.photoKey ?? null,
          accountImage: request.user.image,
        } satisfies PersonCard,
      }))
      .toSorted((a, b) => a.fullName.localeCompare(b.fullName, "pt-BR"));
  }

  type Status = RideSummary["status"];
  type Participants = Awaited<ReturnType<typeof listParticipants>>;
  type RideRecord = Awaited<ReturnType<typeof findRides>>[number];

  // Lists leave the track out: it is a long line only the ride's own page draws.
  function findRides(isOpenOnly: boolean) {
    return db.ride.findMany({
      where: isOpenOnly ? { status: "OPEN" } : undefined,
      orderBy: [{ startsAt: "asc" }, { id: "asc" }],
      include: rideInclude,
      omit: { track: true },
    });
  }

  function describe(
    ride: RideRecord,
    participants: Participants,
    viewerId: string,
    track: string | null = null,
  ): RideDetails {
    const answerByUser = new Map(ride.responses.map((response) => [response.userId, response.answer]));
    const peopleWith = (answer: RideAnswer | undefined): RidePerson[] =>
      participants
        .filter((participant) => answerByUser.get(participant.userId) === answer)
        .map((participant) => ({ userId: participant.userId, name: participant.fullName }));
    const people = {
      going: peopleWith("GOING"),
      notGoing: peopleWith("NOT_GOING"),
      noAnswer: peopleWith(undefined),
    };
    const cardsWith = (answer: RideAnswer | undefined) =>
      participants
        .filter((participant) => answerByUser.get(participant.userId) === answer)
        .map((participant) => participant.card);
    const going = people.going.map((person) => person.name);
    const notGoing = people.notGoing.map((person) => person.name);
    const noAnswer = people.noAnswer.map((person) => person.name);
    const overrides = new Map(ride.attendance.map((entry) => [entry.userId, entry.counts]));
    const isOver = ride.status !== "CANCELLED" && ride.startsAt <= now();
    const withPresence = participants.map((participant) => {
      const override = overrides.get(participant.userId);

      return {
        userId: participant.userId,
        name: participant.fullName,
        corrected: override !== undefined,
        counts: override ?? answerByUser.get(participant.userId) === "GOING",
        card: participant.card,
      };
    });
    const strip = ({ userId, name, corrected }: (typeof withPresence)[number]) => ({ userId, name, corrected });
    const attendance = isOver
      ? {
          attended: withPresence.filter((person) => person.counts).map(strip),
          others: withPresence.filter((person) => !person.counts).map(strip),
        }
      : null;
    const hasItinerary = ride.stops.length > 0;
    const stops: RideStop[] = hasItinerary
      ? ride.stops.map(({ kind, name, place, time, note, lat, lon }) => ({ kind, name, place, time, note, lat, lon }))
      : [{ kind: "MEETING", name: ride.meetingPoint, place: null, time: null, note: null, lat: null, lon: null }];

    return {
      id: ride.id,
      route: ride.route,
      meetingPoint: ride.meetingPoint,
      startsAt: ride.startsAt,
      returnsAt: ride.returnsAt,
      meetsAt: ride.meetsAt,
      distanceKm: ride.distanceKm,
      surface: ride.surface,
      difficulty: ride.difficulty,
      rideMinutes: ride.rideMinutes,
      tollCents: ride.tollCents,
      mapUrl: ride.mapUrl,
      photoKey: ride.photoKey,
      status: ride.status,
      counts: { going: going.length, notGoing: notGoing.length, noAnswer: noAnswer.length },
      myAnswer: answerByUser.get(viewerId) ?? null,
      isOver,
      cards: {
        going: cardsWith("GOING"),
        notGoing: cardsWith("NOT_GOING"),
        noAnswer: cardsWith(undefined),
        attended: isOver ? withPresence.filter((person) => person.counts).map((person) => person.card) : null,
      },
      description: ride.description,
      track,
      attendance,
      tips: ride.tips
        .map((choice) => choice.tip)
        .toSorted((a, b) => a.position - b.position)
        .map(({ id, text, icon }) => ({ id, text, icon })),
      packingNote: ride.packingNote,
      planB: ride.planB,
      stops,
      going,
      notGoing,
      noAnswer,
      people,
    };
  }

  function summarize(details: RideDetails): RideSummary {
    return {
      id: details.id,
      route: details.route,
      meetingPoint: details.meetingPoint,
      startsAt: details.startsAt,
      returnsAt: details.returnsAt,
      meetsAt: details.meetsAt,
      distanceKm: details.distanceKm,
      surface: details.surface,
      difficulty: details.difficulty,
      rideMinutes: details.rideMinutes,
      tollCents: details.tollCents,
      mapUrl: details.mapUrl,
      photoKey: details.photoKey,
      status: details.status,
      counts: details.counts,
      myAnswer: details.myAnswer,
      isOver: details.isOver,
      cards: details.cards,
    };
  }

  // A ride may only pick recommendations that are on offer, plus the ones it already had:
  // deactivating one must not break saving the rides that use it.
  async function assertTipsCanBeChosen(tipIds: string[], alreadyChosen: string[]) {
    if (tipIds.length === 0) return;

    const found = await db.rideTip.findMany({
      where: { id: { in: tipIds } },
      select: { id: true, active: true },
    });
    const allowed = new Set(
      found.filter((tip) => tip.active || alreadyChosen.includes(tip.id)).map((tip) => tip.id),
    );

    if (tipIds.some((id) => !allowed.has(id))) {
      throw new RideError("INVALID_INPUT", { tips: "Uma das recomendações não existe mais. Recarregue a página." });
    }
  }

  function validateTip(input: TipInput) {
    const text = input.text.trim();

    if (text.length < 2 || text.length > TIP_TEXT_MAX_LENGTH) {
      throw new RideError("INVALID_INPUT", { tips: `Escreva a recomendação em até ${TIP_TEXT_MAX_LENGTH} caracteres.` });
    }

    if (!TIP_ICONS.some((option) => option.value === input.icon)) {
      throw new RideError("INVALID_INPUT", { tips: "Escolha um ícone da lista." });
    }

    return { text, icon: input.icon };
  }

  // What the ride form offers. Riders never see this list on its own, only on a ride.
  async function listTips(adminId: string): Promise<ManagedTip[]> {
    await assertAdmin(adminId);

    return db.rideTip.findMany({
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: { id: true, text: true, icon: true, active: true },
    });
  }

  async function addTip(adminId: string, input: TipInput) {
    await assertAdmin(adminId);

    const data = validateTip(input);
    const last = await db.rideTip.aggregate({ _max: { position: true } });

    return db.rideTip.create({
      data: { ...data, position: (last._max.position ?? -1) + 1 },
      select: { id: true },
    });
  }

  async function updateTip(adminId: string, tipId: string, input: TipInput) {
    await assertAdmin(adminId);

    const updated = await db.rideTip.updateMany({ where: { id: tipId }, data: validateTip(input) });

    if (updated.count === 0) throw new RideError("NOT_FOUND");
  }

  async function setTipActive(adminId: string, tipId: string, active: boolean) {
    await assertAdmin(adminId);

    const updated = await db.rideTip.updateMany({ where: { id: tipId }, data: { active } });

    if (updated.count === 0) throw new RideError("NOT_FOUND");
  }

  // Swaps a recommendation with its neighbour, one place up or down.
  async function moveTip(adminId: string, tipId: string, direction: "up" | "down") {
    await assertAdmin(adminId);

    await db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(7202)`;

      const tips = await tx.rideTip.findMany({
        orderBy: [{ position: "asc" }, { id: "asc" }],
        select: { id: true },
      });
      const index = tips.findIndex((tip) => tip.id === tipId);
      const target = direction === "up" ? index - 1 : index + 1;

      if (index === -1) throw new RideError("NOT_FOUND");
      if (target < 0 || target >= tips.length) return;

      const ordered = tips.map((tip) => tip.id);

      [ordered[index], ordered[target]] = [ordered[target], ordered[index]];

      for (const [position, id] of ordered.entries()) {
        await tx.rideTip.update({ where: { id }, data: { position } });
      }
    });
  }

  function withPositions(stops: RideStop[]) {
    return stops.map((stop, position) => ({ ...stop, position }));
  }

  async function publishRide(adminId: string, input: RideInput) {
    await assertAdmin(adminId);

    const valid = validate(input);

    await assertTipsCanBeChosen(valid.tipIds, []);

    return db.ride.create({
      data: {
        ...valid.ride,
        track: valid.track ?? null,
        photoKey: input.photoKey,
        createdById: adminId,
        stops: { create: withPositions(valid.stops) },
        tips: { create: valid.tipIds.map((tipId) => ({ tipId })) },
      },
      select: { id: true },
    });
  }

  // Replaces the ride's details and its whole itinerary in one go. A null photo key keeps the
  // photo the ride already has. Returns the photo that is no longer used, if any.
  async function updateRide(adminId: string, rideId: string, input: RideInput) {
    await assertAdmin(adminId);

    const valid = validate(input);
    const kept = await db.rideTipChoice.findMany({ where: { rideId }, select: { tipId: true } });

    await assertTipsCanBeChosen(valid.tipIds, kept.map((choice) => choice.tipId));

    return db.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<
        { status: Status; photoKey: string | null; hasTrack: boolean; distanceKm: number | null }[]
      >`
        SELECT "status"::text AS "status", "photoKey", "track" IS NOT NULL AS "hasTrack", "distanceKm"
        FROM "Ride" WHERE "id" = ${rideId} FOR UPDATE
      `;

      if (rows.length === 0) throw new RideError("NOT_FOUND");
      if (rows[0].status === "CANCELLED") throw new RideError("INVALID_STATE");

      const isReplacingPhoto = input.photoKey !== null;
      // While the ride keeps its file, the distance stays the file's, whatever was typed.
      const keepsTrack = valid.track === undefined && rows[0].hasTrack;
      const distanceKm = keepsTrack ? rows[0].distanceKm : valid.ride.distanceKm;

      await tx.rideStop.deleteMany({ where: { rideId } });
      await tx.rideTipChoice.deleteMany({ where: { rideId } });
      await tx.ride.update({
        where: { id: rideId },
        data: {
          ...valid.ride,
          distanceKm,
          track: valid.track,
          photoKey: isReplacingPhoto ? input.photoKey : rows[0].photoKey,
          stops: { create: withPositions(valid.stops) },
          tips: { create: valid.tipIds.map((tipId) => ({ tipId })) },
        },
      });

      return { replacedPhotoKey: isReplacingPhoto ? rows[0].photoKey : null };
    });
  }

  async function list(viewerId: string, isOpenOnly: boolean) {
    const [rides, participants] = await Promise.all([findRides(isOpenOnly), listParticipants()]);

    return rides.map((ride) => summarize(describe(ride, participants, viewerId)));
  }

  // Rides still taking answers, the nearest first. Once a ride has set off it stops taking
  // them, whether or not an administrator closed it: it belongs to the rides done.
  async function listActive(userId: string): Promise<RideSummary[]> {
    await assertApproved(userId);

    return (await list(userId, true)).filter((ride) => !ride.isOver);
  }

  async function listAll(adminId: string): Promise<RideSummary[]> {
    await assertAdmin(adminId);

    return list(adminId, false);
  }

  // Everything the group has on its calendar or behind it, cancelled rides aside: what is
  // still ahead, the nearest first, and what was done, the latest first.
  async function listCalendar(userId: string) {
    await assertApproved(userId);

    const all = (await list(userId, false)).filter((ride) => ride.status !== "CANCELLED");

    return {
      upcoming: all.filter((ride) => !ride.isOver),
      done: all.filter((ride) => ride.isOver).toReversed(),
    };
  }

  async function getRide(userId: string, rideId: string): Promise<RideDetails> {
    await assertApproved(userId);

    const [ride, participants] = await Promise.all([
      db.ride.findUnique({ where: { id: rideId }, include: rideInclude }),
      listParticipants(),
    ]);

    if (!ride) throw new RideError("NOT_FOUND");

    return describe(ride, participants, userId, ride.track);
  }

  async function respond(userId: string, rideId: string, answer: RideAnswer) {
    await assertApproved(userId);

    const isKnownAnswer = answer === "GOING" || answer === "NOT_GOING";

    if (!isKnownAnswer) throw new RideError("INVALID_INPUT");

    await db.$transaction(async (tx) => {
      // The row lock makes an answer and a closing arriving together settle in one order.
      const rows = await tx.$queryRaw<{ status: string; startsAt: Date }[]>`
        SELECT "status"::text AS "status", "startsAt" FROM "Ride" WHERE "id" = ${rideId} FOR UPDATE
      `;

      if (rows.length === 0) throw new RideError("NOT_FOUND");
      if (rows[0].status !== "OPEN" || rows[0].startsAt <= now()) throw new RideError("RIDE_NOT_OPEN");

      await tx.rideResponse.upsert({
        where: { rideId_userId: { rideId, userId } },
        update: { answer },
        create: { rideId, userId, answer },
      });
    });
  }

  async function changeStatus(adminId: string, rideId: string, allowedFrom: Status[], to: Status) {
    await assertAdmin(adminId);

    await db.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<{ status: Status }[]>`
        SELECT "status"::text AS "status" FROM "Ride" WHERE "id" = ${rideId} FOR UPDATE
      `;

      if (rows.length === 0) throw new RideError("NOT_FOUND");
      if (!allowedFrom.includes(rows[0].status)) throw new RideError("INVALID_STATE");

      await tx.ride.update({ where: { id: rideId }, data: { status: to } });
    });
  }

  // After the ride has set off, an administrator says who was really there: `true` adds
  // someone who came without answering, `false` drops someone who said yes and did not come,
  // and `null` goes back to what the person answered.
  async function setAttendance(adminId: string, rideId: string, userId: string, counts: boolean | null) {
    await assertAdmin(adminId);

    const ride = await db.ride.findUnique({ where: { id: rideId }, select: { status: true, startsAt: true } });

    if (!ride) throw new RideError("NOT_FOUND");
    if (ride.status === "CANCELLED") throw new RideError("INVALID_STATE");
    if (ride.startsAt > now()) throw new RideError("RIDE_NOT_OVER");

    if (counts === null) {
      await db.rideAttendance.deleteMany({ where: { rideId, userId } });

      return;
    }

    const isInGroup = (await db.joinRequest.count({ where: { userId, status: "APPROVED" } })) === 1;

    if (!isInGroup) throw new RideError("NOT_FOUND");

    await db.rideAttendance.upsert({
      where: { rideId_userId: { rideId, userId } },
      update: { counts, authorId: adminId, createdAt: now() },
      create: { rideId, userId, counts, authorId: adminId, createdAt: now() },
    });
  }

  // Whether this person counts as having been on this ride. The gallery asks, and later the
  // history and the level badges.
  async function hasAttended(userId: string, rideId: string) {
    const ride = await db.ride.findUnique({
      where: { id: rideId },
      select: {
        status: true,
        startsAt: true,
        responses: { where: { userId }, select: { answer: true } },
        attendance: { where: { userId }, select: { counts: true } },
      },
    });

    if (!ride || ride.status === "CANCELLED" || ride.startsAt > now()) return false;

    const isInGroup = (await db.joinRequest.count({ where: { userId, status: "APPROVED" } })) === 1;

    if (!isInGroup) return false;

    return ride.attendance[0]?.counts ?? ride.responses[0]?.answer === "GOING";
  }

  // Closing freezes the answers as they are; nothing is erased.
  function closeRide(adminId: string, rideId: string) {
    return changeStatus(adminId, rideId, ["OPEN"], "CLOSED");
  }

  function reopenRide(adminId: string, rideId: string) {
    return changeStatus(adminId, rideId, ["CLOSED"], "OPEN");
  }

  function cancelRide(adminId: string, rideId: string) {
    return changeStatus(adminId, rideId, ["OPEN", "CLOSED"], "CANCELLED");
  }

  return {
    publishRide,
    updateRide,
    setAttendance,
    hasAttended,
    listTips,
    addTip,
    updateTip,
    setTipActive,
    moveTip,
    listActive,
    listAll,
    listCalendar,
    getRide,
    respond,
    closeRide,
    reopenRide,
    cancelRide,
  };
}

export type RideService = ReturnType<typeof createRideService>;
