import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { createAccessService } from "@/server/access";
import { decodePolyline6 } from "@/server/polyline";
import { formatRideDuration, parseRideTime } from "@/server/ride-options";
import { createRideService, RideError, type RideInput } from "@/server/rides";
import { connectTestDatabase, resetDatabase } from "@/server/test-database";

const db = connectTestDatabase();
const access = createAccessService(db, { adminEmails: ["chefe@exemplo.com"] });
// The rides in these tests leave on fixed dates; the clock stays before them unless a test
// brings its own.
const beforeAnyRide = () => new Date("2026-11-01T12:00:00Z");
const rides = createRideService(db, access, beforeAnyRide);

const bike = { whatsapp: "(21) 98888-7777", bikeModel: "Scrambler 900", engineSize: "900" };

const serra: RideInput = {
  route: "Serra de Petrópolis",
  description: "",
  date: "2026-11-22",
  meetingTime: "",
  departureTime: "07:00",
  returnTime: "16:30",
  mapUrl: "",
  photoKey: null,
  distanceKm: "142",
  surface: "PAVED",
  difficulty: "MODERATE",
  rideTime: "",
  tolls: "",
  tipIds: [],
  packingNote: "",
  planB: "",
  stops: [{ kind: "MEETING", name: "Posto BR da Washington Luís", place: "", time: "", note: "" }],
};

const stop = { kind: "FUEL", name: "Posto do Belvedere", place: "", time: "", note: "" };

async function createAdmin() {
  const admin = await db.user.create({ data: { email: "chefe@exemplo.com" } });

  await access.submitJoinRequest(admin.id, { ...bike, fullName: "Chefe Lima" });

  return admin;
}

async function createRequester(email: string, fullName: string) {
  const user = await db.user.create({ data: { email } });
  const request = await access.submitJoinRequest(user.id, { ...bike, fullName });

  return { user, request };
}

async function createParticipant(adminId: string, email: string, fullName: string) {
  const { user, request } = await createRequester(email, fullName);

  await access.decide(adminId, request.id, "approve");

  return user;
}

async function expectRideError(action: Promise<unknown>, code: RideError["code"]) {
  await expect(action).rejects.toMatchObject({ name: "RideError", code });
}

async function expectInvalid(action: Promise<unknown>, field: string) {
  await expect(action).rejects.toMatchObject({
    code: "INVALID_INPUT",
    fieldErrors: { [field]: expect.any(String) },
  });
}

beforeEach(async () => {
  await resetDatabase(db);
});

afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

describe("publicar passeio", () => {
  it("publica com os horários no fuso do Rio e mostra a quem é do grupo", async () => {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");

    await rides.publishRide(admin.id, { ...serra, mapUrl: " https://maps.app.goo.gl/abc " });

    const [ride] = await rides.listActive(ana.id);

    expect(ride).toMatchObject({
      route: "Serra de Petrópolis",
      meetingPoint: "Posto BR da Washington Luís",
      mapUrl: "https://maps.app.goo.gl/abc",
      photoKey: null,
      status: "OPEN",
      myAnswer: null,
      counts: { going: 0, notGoing: 0, noAnswer: 2 },
    });
    expect(ride.startsAt.toISOString()).toBe("2026-11-22T10:00:00.000Z");
    expect(ride.returnsAt.toISOString()).toBe("2026-11-22T19:30:00.000Z");
  });

  it("lista os passeios do mais próximo ao mais distante", async () => {
    const admin = await createAdmin();

    await rides.publishRide(admin.id, { ...serra, route: "Região dos Lagos", date: "2026-12-06" });
    await rides.publishRide(admin.id, serra);

    expect((await rides.listActive(admin.id)).map((ride) => ride.route)).toEqual([
      "Serra de Petrópolis",
      "Região dos Lagos",
    ]);
  });

  it("exige percurso, encontro, data, saída e retorno; mapa é opcional mas precisa ser um link", async () => {
    const admin = await createAdmin();

    await expectInvalid(rides.publishRide(admin.id, { ...serra, route: " " }), "route");
    await expectInvalid(rides.publishRide(admin.id, { ...serra, stops: [] }), "stops");
    await expectInvalid(rides.publishRide(admin.id, { ...serra, date: "" }), "date");
    await expectInvalid(rides.publishRide(admin.id, { ...serra, date: "2026-02-31x" }), "date");
    await expectInvalid(rides.publishRide(admin.id, { ...serra, departureTime: "" }), "departureTime");
    await expectInvalid(rides.publishRide(admin.id, { ...serra, returnTime: "" }), "returnTime");
    await expectInvalid(rides.publishRide(admin.id, { ...serra, returnTime: "06:00" }), "returnTime");
    await expectInvalid(rides.publishRide(admin.id, { ...serra, mapUrl: "mapa do posto" }), "mapUrl");
    expect(await rides.listActive(admin.id)).toEqual([]);
  });

  it("não deixa rider publicar nem ver a lista administrativa", async () => {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");

    await expectRideError(rides.publishRide(ana.id, serra), "FORBIDDEN");
    await expectRideError(rides.listAll(ana.id), "FORBIDDEN");
  });
});

describe("responder presença", () => {
  async function setup() {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");
    const bia = await createParticipant(admin.id, "bia@exemplo.com", "Bia Luz");
    const { id: rideId } = await rides.publishRide(admin.id, serra);

    return { admin, ana, bia, rideId };
  }

  it("monta as três listas com uma única resposta por pessoa, mesmo ao trocar ou repetir", async () => {
    const { admin, ana, bia, rideId } = await setup();

    await rides.respond(ana.id, rideId, "GOING");
    await rides.respond(ana.id, rideId, "GOING");
    await rides.respond(bia.id, rideId, "GOING");
    await rides.respond(bia.id, rideId, "NOT_GOING");

    const ride = await rides.getRide(admin.id, rideId);

    expect(ride.going).toEqual(["Ana Reis"]);
    expect(ride.notGoing).toEqual(["Bia Luz"]);
    expect(ride.noAnswer).toEqual(["Chefe Lima"]);
    expect(ride.counts).toEqual({ going: 1, notGoing: 1, noAnswer: 1 });
    expect(ride.myAnswer).toBeNull();
    expect((await rides.getRide(bia.id, rideId)).myAnswer).toBe("NOT_GOING");
    expect(await db.rideResponse.count()).toBe(2);
  });

  it("não duplica a resposta quando duas chegam ao mesmo tempo", async () => {
    const { ana, rideId } = await setup();

    await Promise.all([
      rides.respond(ana.id, rideId, "GOING"),
      rides.respond(ana.id, rideId, "NOT_GOING"),
      rides.respond(ana.id, rideId, "GOING"),
    ]);

    expect(await db.rideResponse.count()).toBe(1);
  });

  it("recusa resposta em passeio que não está aberto ou não existe", async () => {
    const { ana, rideId } = await setup();

    await rides.respond(ana.id, rideId, "GOING");
    await db.ride.update({ where: { id: rideId }, data: { status: "CLOSED" } });

    await expectRideError(rides.respond(ana.id, rideId, "NOT_GOING"), "RIDE_NOT_OPEN");
    await expectRideError(rides.respond(ana.id, "inexistente", "GOING"), "NOT_FOUND");
    expect((await rides.getRide(ana.id, rideId)).myAnswer).toBe("GOING");
    expect(await rides.listActive(ana.id)).toEqual([]);
  });

  it("esconde os passeios de quem não foi aprovado e ignora sua resposta", async () => {
    const { admin, rideId } = await setup();
    const { user: pending } = await createRequester("espera@exemplo.com", "Caio Sá");

    await expectRideError(rides.listActive(pending.id), "FORBIDDEN");
    await expectRideError(rides.getRide(pending.id, rideId), "FORBIDDEN");
    await expectRideError(rides.respond(pending.id, rideId, "GOING"), "FORBIDDEN");
    expect((await rides.getRide(admin.id, rideId)).noAnswer).not.toContain("Caio Sá");
  });

  it("tira das listas quem deixou de estar aprovado", async () => {
    const { admin, ana, rideId } = await setup();

    await rides.respond(ana.id, rideId, "GOING");
    await db.joinRequest.update({ where: { userId: ana.id }, data: { status: "BLOCKED" } });

    const ride = await rides.getRide(admin.id, rideId);

    expect(ride.going).toEqual([]);
    expect(ride.counts).toEqual({ going: 0, notGoing: 0, noAnswer: 2 });
  });
});

describe("encerrar, reabrir e cancelar passeio", () => {
  async function setup() {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");
    const { id: rideId } = await rides.publishRide(admin.id, serra);

    await rides.respond(ana.id, rideId, "GOING");

    return { admin, ana, rideId };
  }

  it("encerrar congela as respostas e tira o passeio do Início", async () => {
    const { admin, ana, rideId } = await setup();

    await rides.closeRide(admin.id, rideId);

    await expectRideError(rides.respond(ana.id, rideId, "NOT_GOING"), "RIDE_NOT_OPEN");
    expect(await rides.listActive(ana.id)).toEqual([]);
    expect(await rides.getRide(ana.id, rideId)).toMatchObject({
      status: "CLOSED",
      myAnswer: "GOING",
      going: ["Ana Reis"],
    });
  });

  it("reabrir devolve o passeio ao Início e deixa trocar a resposta", async () => {
    const { admin, ana, rideId } = await setup();

    await rides.closeRide(admin.id, rideId);
    await rides.reopenRide(admin.id, rideId);
    await rides.respond(ana.id, rideId, "NOT_GOING");

    expect(await rides.listActive(ana.id)).toHaveLength(1);
    expect((await rides.getRide(ana.id, rideId)).myAnswer).toBe("NOT_GOING");
  });

  it("cancelar encerra de vez, preserva as respostas e não pode ser desfeito", async () => {
    const { admin, ana, rideId } = await setup();

    await rides.cancelRide(admin.id, rideId);

    await expectRideError(rides.respond(ana.id, rideId, "NOT_GOING"), "RIDE_NOT_OPEN");
    await expectRideError(rides.reopenRide(admin.id, rideId), "INVALID_STATE");
    await expectRideError(rides.closeRide(admin.id, rideId), "INVALID_STATE");
    expect(await rides.listActive(ana.id)).toEqual([]);
    expect(await rides.getRide(ana.id, rideId)).toMatchObject({
      status: "CANCELLED",
      going: ["Ana Reis"],
    });
  });

  it("só aceita as transições previstas e só de administrador", async () => {
    const { admin, ana, rideId } = await setup();

    await expectRideError(rides.reopenRide(admin.id, rideId), "INVALID_STATE");
    await expectRideError(rides.closeRide(ana.id, rideId), "FORBIDDEN");
    await expectRideError(rides.reopenRide(ana.id, rideId), "FORBIDDEN");
    await expectRideError(rides.cancelRide(ana.id, rideId), "FORBIDDEN");
    await expectRideError(rides.closeRide(admin.id, "inexistente"), "NOT_FOUND");
    expect((await rides.getRide(admin.id, rideId)).status).toBe("OPEN");
  });

  it("deixa o passeio num estado coerente quando encerrar e responder chegam juntos", async () => {
    const { admin, ana, rideId } = await setup();

    const [closing, answering] = await Promise.allSettled([
      rides.closeRide(admin.id, rideId),
      rides.respond(ana.id, rideId, "NOT_GOING"),
    ]);
    const ride = await rides.getRide(ana.id, rideId);

    expect(closing.status).toBe("fulfilled");
    expect(ride.status).toBe("CLOSED");
    // The answer either landed before the closing or was refused; it is never half applied.
    expect(ride.myAnswer).toBe(answering.status === "fulfilled" ? "NOT_GOING" : "GOING");
  });
});

describe("ficha da rota", () => {
  it("guarda distância, piso, dificuldade, tempo de rolé e pedágios, e os leva para a lista", async () => {
    const admin = await createAdmin();
    const { id } = await rides.publishRide(admin.id, { ...serra, rideTime: "3h20", tolls: "14,50" });
    const expected = { distanceKm: 142, surface: "PAVED", difficulty: "MODERATE", rideMinutes: 200, tollCents: 1450 };

    expect(await rides.getRide(admin.id, id)).toMatchObject(expected);
    expect((await rides.listActive(admin.id))[0]).toMatchObject(expected);
  });

  it("aceita a ficha só com o mínimo e recusa quando falta distância, piso ou dificuldade", async () => {
    const admin = await createAdmin();

    await expectInvalid(rides.publishRide(admin.id, { ...serra, distanceKm: "" }), "distanceKm");
    await expectInvalid(rides.publishRide(admin.id, { ...serra, distanceKm: "0" }), "distanceKm");
    await expectInvalid(rides.publishRide(admin.id, { ...serra, distanceKm: "142 km" }), "distanceKm");
    await expectInvalid(rides.publishRide(admin.id, { ...serra, surface: "" }), "surface");
    await expectInvalid(rides.publishRide(admin.id, { ...serra, difficulty: "HARD" }), "difficulty");
    await expectInvalid(rides.publishRide(admin.id, { ...serra, rideTime: "bastante" }), "rideTime");
    await expectInvalid(rides.publishRide(admin.id, { ...serra, tolls: "catorze" }), "tolls");

    const { id } = await rides.publishRide(admin.id, serra);

    expect(await rides.getRide(admin.id, id)).toMatchObject({ rideMinutes: null, tollCents: null });
  });

  it("deixa a ficha vazia num passeio antigo e a exige na primeira edição", async () => {
    const admin = await createAdmin();
    const old = await db.ride.create({
      data: {
        route: "Café em Itaipava",
        meetingPoint: "Posto BR",
        startsAt: new Date("2026-10-10T10:00:00Z"),
        returnsAt: new Date("2026-10-10T18:00:00Z"),
        createdById: admin.id,
      },
    });

    expect(await rides.getRide(admin.id, old.id)).toMatchObject({ distanceKm: null, surface: null, difficulty: null });
    await expectInvalid(rides.updateRide(admin.id, old.id, { ...serra, distanceKm: "" }), "distanceKm");

    await rides.updateRide(admin.id, old.id, serra);

    expect(await rides.getRide(admin.id, old.id)).toMatchObject({ distanceKm: 142 });
  });

  it.each([
    ["3h20", 200],
    ["3:20", 200],
    ["3h", 180],
    ["45min", 45],
    ["0h30", 30],
  ])("lê o tempo de rolé %s como %i minutos", (text, minutes) => {
    expect(parseRideTime(text)).toBe(minutes);
    expect(parseRideTime(formatRideDuration(minutes))).toBe(minutes);
  });

  it("recusa tempo de rolé sem sentido", () => {
    for (const text of ["3h75", "0h", "25h", "", "três horas"]) expect(parseRideTime(text)).toBeNull();
  });
});

describe("leve com você e plano B", () => {
  async function setup() {
    const admin = await createAdmin();
    const fuel = await rides.addTip(admin.id, { text: " Tanque cheio na saída ", icon: "fuel" });
    const rain = await rides.addTip(admin.id, { text: "Capa de chuva", icon: "rain" });
    const water = await rides.addTip(admin.id, { text: "Água", icon: "water" });

    return { admin, fuel, rain, water };
  }

  it("guarda as recomendações marcadas e as mostra na ordem da lista, com observação e plano B", async () => {
    const { admin, fuel, rain, water } = await setup();
    const { id } = await rides.publishRide(admin.id, {
      ...serra,
      tipIds: [water.id, fuel.id, water.id],
      packingNote: " Leve troco. ",
      planB: " Com chuva, café em Guapimirim. ",
    });
    const ride = await rides.getRide(admin.id, id);

    expect(ride.tips).toEqual([
      { id: fuel.id, text: "Tanque cheio na saída", icon: "fuel" },
      { id: water.id, text: "Água", icon: "water" },
    ]);
    expect(ride).toMatchObject({ packingNote: "Leve troco.", planB: "Com chuva, café em Guapimirim." });

    await rides.updateRide(admin.id, id, { ...serra, tipIds: [rain.id] });

    expect(await rides.getRide(admin.id, id)).toMatchObject({
      tips: [{ id: rain.id, text: "Capa de chuva", icon: "rain" }],
      packingNote: null,
      planB: null,
    });
  });

  it("recusa recomendação que não existe, observação e plano B longos", async () => {
    const { admin } = await setup();

    await expectInvalid(rides.publishRide(admin.id, { ...serra, tipIds: ["inexistente"] }), "tips");
    await expectInvalid(rides.publishRide(admin.id, { ...serra, packingNote: "x".repeat(201) }), "packingNote");
    await expectInvalid(rides.publishRide(admin.id, { ...serra, planB: "x".repeat(281) }), "planB");
    expect(await db.ride.count()).toBe(0);
  });

  it("tira a recomendação desativada da escolha de passeios novos, mas a mantém onde já estava", async () => {
    const { admin, fuel, rain } = await setup();
    const { id } = await rides.publishRide(admin.id, { ...serra, tipIds: [fuel.id, rain.id] });

    await rides.setTipActive(admin.id, rain.id, false);

    await expectInvalid(rides.publishRide(admin.id, { ...serra, tipIds: [rain.id] }), "tips");
    await rides.updateRide(admin.id, id, { ...serra, route: "Serra pela BR-040", tipIds: [fuel.id, rain.id] });

    expect((await rides.getRide(admin.id, id)).tips.map((tip) => tip.text)).toEqual([
      "Tanque cheio na saída",
      "Capa de chuva",
    ]);

    await rides.setTipActive(admin.id, rain.id, true);
    await rides.publishRide(admin.id, { ...serra, tipIds: [rain.id] });
  });

  it("deixa o administrador renomear, trocar o ícone e reordenar, e o passeio acompanha", async () => {
    const { admin, fuel, rain, water } = await setup();
    const { id } = await rides.publishRide(admin.id, { ...serra, tipIds: [fuel.id, water.id] });

    await rides.updateTip(admin.id, water.id, { text: "Água e lanche", icon: "food" });
    await rides.moveTip(admin.id, water.id, "up");
    await rides.moveTip(admin.id, water.id, "up");
    await rides.moveTip(admin.id, water.id, "up");

    expect((await rides.listTips(admin.id)).map((tip) => [tip.text, tip.icon, tip.active])).toEqual([
      ["Água e lanche", "food", true],
      ["Tanque cheio na saída", "fuel", true],
      ["Capa de chuva", "rain", true],
    ]);
    expect((await rides.getRide(admin.id, id)).tips.map((tip) => tip.text)).toEqual([
      "Água e lanche",
      "Tanque cheio na saída",
    ]);

    await rides.moveTip(admin.id, rain.id, "down");

    expect((await rides.listTips(admin.id)).at(-1)?.id).toBe(rain.id);
  });

  it("recusa recomendação vazia, longa ou com ícone fora do conjunto", async () => {
    const { admin, fuel } = await setup();

    await expectInvalid(rides.addTip(admin.id, { text: " ", icon: "fuel" }), "tips");
    await expectInvalid(rides.addTip(admin.id, { text: "x".repeat(61), icon: "fuel" }), "tips");
    await expectInvalid(rides.addTip(admin.id, { text: "Lanterna", icon: "foguete" }), "tips");
    await expectInvalid(rides.updateTip(admin.id, fuel.id, { text: "", icon: "fuel" }), "tips");
    await expectRideError(rides.updateTip(admin.id, "inexistente", { text: "Lanterna", icon: "tools" }), "NOT_FOUND");
    expect(await rides.listTips(admin.id)).toHaveLength(3);
  });

  it("não deixa rider ver nem mexer na lista de recomendações", async () => {
    const { admin, fuel } = await setup();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");
    const tip = { text: "Lanterna", icon: "tools" };

    await expectRideError(rides.listTips(ana.id), "FORBIDDEN");
    await expectRideError(rides.addTip(ana.id, tip), "FORBIDDEN");
    await expectRideError(rides.updateTip(ana.id, fuel.id, tip), "FORBIDDEN");
    await expectRideError(rides.setTipActive(ana.id, fuel.id, false), "FORBIDDEN");
    await expectRideError(rides.moveTip(ana.id, fuel.id, "down"), "FORBIDDEN");
  });
});

describe("roteiro em paradas", () => {
  const itinerary: RideInput = {
    ...serra,
    description: " Subida pela estrada velha. ",
    meetingTime: "06:30",
    stops: [
      { kind: "MEETING", name: " Posto Shell ", place: " Duque de Caxias ", time: "06:30", note: " Saída em ponto. " },
      { ...stop, time: "08:10" },
      { kind: "DESTINATION", name: "Almoço em Itaipava", place: "", time: "", note: "" },
    ],
  };

  it("guarda o roteiro em ordem, o encontro separado da saída e a descrição", async () => {
    const admin = await createAdmin();
    const { id } = await rides.publishRide(admin.id, itinerary);
    const ride = await rides.getRide(admin.id, id);

    expect(ride.description).toBe("Subida pela estrada velha.");
    expect(ride.meetsAt).toEqual(new Date("2026-11-22T09:30:00Z"));
    expect(ride.startsAt).toEqual(new Date("2026-11-22T10:00:00Z"));
    expect(ride.meetingPoint).toBe("Posto Shell, Duque de Caxias");
    expect(ride.stops).toEqual([
      { kind: "MEETING", name: "Posto Shell", place: "Duque de Caxias", time: "06:30", note: "Saída em ponto.", lat: null, lon: null },
      { kind: "FUEL", name: "Posto do Belvedere", place: null, time: "08:10", note: null, lat: null, lon: null },
      { kind: "DESTINATION", name: "Almoço em Itaipava", place: null, time: null, note: null, lat: null, lon: null },
    ]);
  });

  it("guarda o ponto que o administrador marcou no mapa e recusa ponto pela metade ou fora do planeta", async () => {
    const admin = await createAdmin();
    const meeting = { ...itinerary.stops[0], lat: "-22.7858", lon: "-43.3117" };
    const { id } = await rides.publishRide(admin.id, { ...itinerary, stops: [meeting, stop] });
    const [first, second] = (await rides.getRide(admin.id, id)).stops;

    expect(first).toMatchObject({ lat: -22.7858, lon: -43.3117 });
    expect(second).toMatchObject({ lat: null, lon: null });

    for (const pin of [{ lat: "-22.7", lon: "" }, { lat: "", lon: "-43.3" }, { lat: "91", lon: "0" }, { lat: "abc", lon: "1" }]) {
      await expectInvalid(rides.publishRide(admin.id, { ...itinerary, stops: [{ ...meeting, ...pin }] }), "stops");
    }
  });

  it("recusa roteiro vazio, longo demais, sem encontro no começo e parada malformada", async () => {
    const admin = await createAdmin();
    const meeting = itinerary.stops[0];
    const refused: RideInput["stops"][] = [
      [],
      [stop, meeting],
      [meeting, ...Array.from({ length: 20 }, () => stop)],
      [meeting, { ...stop, kind: "PICNIC" }],
      [meeting, { ...stop, name: " " }],
      [meeting, { ...stop, time: "25:00" }],
      [meeting, { ...stop, note: "x".repeat(141) }],
    ];

    for (const stops of refused) {
      await expectInvalid(rides.publishRide(admin.id, { ...itinerary, stops }), "stops");
    }

    await rides.publishRide(admin.id, {
      ...itinerary,
      stops: [meeting, ...Array.from({ length: 19 }, () => ({ ...stop, note: "x".repeat(140) }))],
    });
    expect(await db.ride.count()).toBe(1);
  });

  it("recusa encontro depois da saída e descrição longa, e aceita o passeio sem horário de encontro", async () => {
    const admin = await createAdmin();

    await expectInvalid(rides.publishRide(admin.id, { ...itinerary, meetingTime: "07:01" }), "meetingTime");
    await expectInvalid(rides.publishRide(admin.id, { ...itinerary, description: "x".repeat(501) }), "description");

    const { id } = await rides.publishRide(admin.id, { ...itinerary, meetingTime: "" });

    expect((await rides.getRide(admin.id, id)).meetsAt).toBeNull();
  });

  it("troca o roteiro inteiro ao editar, sem tocar nas respostas nem na foto", async () => {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");
    const { id } = await rides.publishRide(admin.id, { ...itinerary, photoKey: "serra.webp" });

    await rides.respond(ana.id, id, "GOING");

    const result = await rides.updateRide(admin.id, id, {
      ...itinerary,
      route: "Serra pela BR-040",
      stops: [itinerary.stops[0], { ...stop, name: "Mirante do Cristo", kind: "VIEWPOINT" }],
    });
    const ride = await rides.getRide(ana.id, id);

    expect(result.replacedPhotoKey).toBeNull();
    expect(ride).toMatchObject({ route: "Serra pela BR-040", photoKey: "serra.webp", myAnswer: "GOING" });
    expect(ride.stops.map((item) => item.name)).toEqual(["Posto Shell", "Mirante do Cristo"]);

    const replaced = await rides.updateRide(admin.id, id, { ...itinerary, photoKey: "nova.webp" });

    expect(replaced.replacedPhotoKey).toBe("serra.webp");
  });

  it("não grava nada quando a edição é recusada, e não edita passeio cancelado", async () => {
    const admin = await createAdmin();
    const { id } = await rides.publishRide(admin.id, itinerary);

    await expectInvalid(rides.updateRide(admin.id, id, { ...itinerary, route: "", stops: [itinerary.stops[0]] }), "route");

    expect((await rides.getRide(admin.id, id)).stops).toHaveLength(3);

    await rides.cancelRide(admin.id, id);

    await expectRideError(rides.updateRide(admin.id, id, itinerary), "INVALID_STATE");
    await expectRideError(rides.updateRide(admin.id, "inexistente", itinerary), "NOT_FOUND");
  });

  it("não deixa rider publicar nem editar", async () => {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");
    const { id } = await rides.publishRide(admin.id, itinerary);

    await expectRideError(rides.publishRide(ana.id, itinerary), "FORBIDDEN");
    await expectRideError(rides.updateRide(ana.id, id, itinerary), "FORBIDDEN");
  });

  it("mostra o ponto de encontro como única parada de um passeio publicado antes do roteiro", async () => {
    const admin = await createAdmin();
    const old = await db.ride.create({
      data: {
        route: "Café em Itaipava",
        meetingPoint: "Posto BR da Washington Luís",
        startsAt: new Date("2026-10-10T10:00:00Z"),
        returnsAt: new Date("2026-10-10T18:00:00Z"),
        createdById: admin.id,
      },
    });
    const ride = await rides.getRide(admin.id, old.id);

    expect(ride).toMatchObject({ description: null, meetsAt: null });
    expect(ride.stops).toEqual([
      { kind: "MEETING", name: "Posto BR da Washington Luís", place: null, time: null, note: null, lat: null, lon: null },
    ]);
  });
});

describe("correção de presença", () => {
  const beforeRide = new Date("2026-11-22T09:00:00Z");
  const afterRide = new Date("2026-11-22T12:00:00Z");
  let clock = afterRide;
  const timed = createRideService(db, access, () => clock);

  async function setup() {
    clock = beforeRide;

    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");
    const bia = await createParticipant(admin.id, "bia@exemplo.com", "Bia Souza");
    const caio = await createParticipant(admin.id, "caio@exemplo.com", "Caio Melo");
    const { id } = await timed.publishRide(admin.id, serra);

    await timed.respond(ana.id, id, "GOING");
    await timed.respond(bia.id, id, "NOT_GOING");

    return { admin, ana, bia, caio, id };
  }

  async function attended(viewerId: string, rideId: string) {
    return (await timed.getRide(viewerId, rideId)).attendance?.attended.map((person) => person.name);
  }

  it("depois da saída o passeio sai do Início e não aceita resposta, mesmo sem ter sido encerrado", async () => {
    const { ana, bia, id } = await setup();

    expect((await timed.listActive(ana.id)).map((ride) => ride.id)).toEqual([id]);

    clock = afterRide;

    expect(await timed.listActive(ana.id)).toEqual([]);
    await expectRideError(timed.respond(bia.id, id, "GOING"), "RIDE_NOT_OPEN");
    expect((await timed.getRide(ana.id, id)).status).toBe("OPEN");
    expect(await attended(ana.id, id)).toEqual(["Ana Reis"]);
  });

  it("separa o que vem pela frente do que já foi feito, com as pessoas de cada contagem", async () => {
    const { admin, ana, caio, id } = await setup();
    const cancelled = await timed.publishRide(admin.id, { ...serra, route: "Volta cancelada" });

    await timed.cancelRide(admin.id, cancelled.id);

    const before = await timed.listCalendar(caio.id);

    expect(before.upcoming.map((ride) => ride.id)).toEqual([id]);
    expect(before.done).toEqual([]);
    expect(before.upcoming[0].cards.going.map((person) => person.userId)).toEqual([ana.id]);
    expect(before.upcoming[0].cards.attended).toBeNull();

    clock = afterRide;
    await timed.setAttendance(admin.id, id, caio.id, true);

    const after = await timed.listCalendar(caio.id);

    expect(after.upcoming).toEqual([]);
    expect(after.done.map((ride) => ride.id)).toEqual([id]);
    expect(after.done[0].cards.attended?.map((person) => person.fullName)).toEqual(["Ana Reis", "Caio Melo"]);
  });

  it("não fala em presença antes da saída, e depois conta sozinho quem respondeu que ia", async () => {
    const { ana, bia, caio, id } = await setup();

    expect((await timed.getRide(ana.id, id)).attendance).toBeNull();
    expect(await timed.hasAttended(ana.id, id)).toBe(false);

    clock = afterRide;

    expect(await attended(caio.id, id)).toEqual(["Ana Reis"]);
    expect(await timed.hasAttended(ana.id, id)).toBe(true);
    expect(await timed.hasAttended(bia.id, id)).toBe(false);
    expect(await timed.hasAttended(caio.id, id)).toBe(false);
  });

  it("deixa o administrador tirar quem faltou, incluir quem foi sem responder, e desfazer", async () => {
    const { admin, ana, caio, id } = await setup();

    clock = afterRide;
    await timed.setAttendance(admin.id, id, ana.id, false);
    await timed.setAttendance(admin.id, id, caio.id, true);

    const { attendance } = await timed.getRide(admin.id, id);

    expect(attendance?.attended).toEqual([{ userId: caio.id, name: "Caio Melo", corrected: true }]);
    expect(attendance?.others.find((person) => person.userId === ana.id)).toMatchObject({ corrected: true });
    expect(await timed.hasAttended(ana.id, id)).toBe(false);
    expect(await timed.hasAttended(caio.id, id)).toBe(true);

    await timed.setAttendance(admin.id, id, ana.id, null);
    await timed.setAttendance(admin.id, id, caio.id, null);

    expect(await attended(admin.id, id)).toEqual(["Ana Reis"]);
  });

  it("guarda quem corrigiu e quando", async () => {
    const { admin, ana, id } = await setup();

    clock = afterRide;
    await timed.setAttendance(admin.id, id, ana.id, false);

    expect(await db.rideAttendance.findFirstOrThrow()).toMatchObject({
      rideId: id,
      userId: ana.id,
      counts: false,
      authorId: admin.id,
      createdAt: afterRide,
    });
  });

  it("só corrige depois da saída, em passeio não cancelado, de quem está no grupo, e só administrador", async () => {
    const { admin, ana, id } = await setup();
    const { user: waiting } = await createRequester("dani@exemplo.com", "Dani Luz");

    await expectRideError(timed.setAttendance(admin.id, id, ana.id, false), "RIDE_NOT_OVER");

    clock = afterRide;

    await expectRideError(timed.setAttendance(ana.id, id, ana.id, true), "FORBIDDEN");
    await expectRideError(timed.setAttendance(admin.id, id, waiting.id, true), "NOT_FOUND");
    await expectRideError(timed.setAttendance(admin.id, "inexistente", ana.id, true), "NOT_FOUND");

    await timed.cancelRide(admin.id, id);

    await expectRideError(timed.setAttendance(admin.id, id, ana.id, false), "INVALID_STATE");
    expect((await timed.getRide(admin.id, id)).attendance).toBeNull();
    expect(await timed.hasAttended(ana.id, id)).toBe(false);
  });

  it("tira da lista quem saiu do grupo depois do passeio", async () => {
    const { admin, ana, id } = await setup();
    const anaRequest = await db.joinRequest.findUniqueOrThrow({ where: { userId: ana.id } });

    clock = afterRide;
    await access.block(admin.id, anaRequest.id);

    expect(await attended(admin.id, id)).toEqual([]);
    expect(await timed.hasAttended(ana.id, id)).toBe(false);
  });
});

describe("rota por GPX", () => {
  const gpx = (points: [number, number][]) =>
    `<gpx version="1.1"><trk><trkseg>${points
      .map(([lat, lon]) => `<trkpt lat="${lat}" lon="${lon}"/>`)
      .join("")}</trkseg></trk></gpx>`;
  // One degree of latitude: 111 km.
  const serraFile = gpx([[-22, -43], [-22.5, -43], [-23, -43]]);

  async function trackOf(viewerId: string, rideId: string) {
    const { track } = await rides.getRide(viewerId, rideId);

    return track === null ? null : decodePolyline6(track);
  }

  it("guarda o traçado do arquivo e tira a distância dele, mesmo sem distância digitada", async () => {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");
    const { id } = await rides.publishRide(admin.id, {
      ...serra,
      distanceKm: "",
      track: { kind: "replace", gpx: serraFile },
    });

    expect(await trackOf(ana.id, id)).toEqual([[-43, -22], [-43, -22.5], [-43, -23]]);
    expect((await rides.getRide(ana.id, id)).distanceKm).toBe(111);
    expect((await rides.getRide(ana.id, id)).rideMinutes).toBeNull();
  });

  it("recusa arquivo malformado, vazio ou grande demais sem publicar nem alterar o passeio", async () => {
    const admin = await createAdmin();

    await expectInvalid(rides.publishRide(admin.id, { ...serra, track: { kind: "replace", gpx: "não é gpx" } }), "gpx");
    await expectInvalid(rides.publishRide(admin.id, { ...serra, track: { kind: "replace", gpx: gpx([[-22, -43]]) } }), "gpx");
    expect(await rides.listAll(admin.id)).toEqual([]);

    const { id } = await rides.publishRide(admin.id, { ...serra, track: { kind: "replace", gpx: serraFile } });
    const tooBig = `${serraFile}<!--${"x".repeat(5 * 1024 * 1024)}-->`;

    await expectInvalid(
      rides.updateRide(admin.id, id, { ...serra, route: "Outro nome", track: { kind: "replace", gpx: tooBig } }),
      "gpx",
    );

    const kept = await rides.getRide(admin.id, id);

    expect(kept.route).toBe("Serra de Petrópolis");
    expect(decodePolyline6(kept.track ?? "")).toHaveLength(3);
  });

  it("mantém o traçado quando as paradas mudam, troca por outro arquivo e volta à rota calculada ao remover", async () => {
    const admin = await createAdmin();
    const { id } = await rides.publishRide(admin.id, { ...serra, track: { kind: "replace", gpx: serraFile } });

    // The typed distance (142) loses to the file's while the file is there.
    await rides.updateRide(admin.id, id, { ...serra, stops: [...serra.stops, stop] });

    expect(await trackOf(admin.id, id)).toHaveLength(3);
    expect((await rides.getRide(admin.id, id)).stops).toHaveLength(2);
    expect((await rides.getRide(admin.id, id)).distanceKm).toBe(111);

    await rides.updateRide(admin.id, id, {
      ...serra,
      track: { kind: "replace", gpx: gpx([[-22, -43], [-22.1, -43]]) },
    });

    expect(await trackOf(admin.id, id)).toEqual([[-43, -22], [-43, -22.1]]);
    expect((await rides.getRide(admin.id, id)).distanceKm).toBe(11);

    await rides.updateRide(admin.id, id, { ...serra, track: { kind: "remove" } });

    expect(await trackOf(admin.id, id)).toBeNull();
    expect((await rides.getRide(admin.id, id)).distanceKm).toBe(142);
  });

  it("passeio publicado sem arquivo não tem traçado guardado", async () => {
    const admin = await createAdmin();
    const { id } = await rides.publishRide(admin.id, serra);

    expect(await trackOf(admin.id, id)).toBeNull();
  });
});
