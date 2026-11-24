import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { createAccessService } from "@/server/access";
import { createBatchService } from "@/server/batches";
import { groupMods } from "@/server/bike-models";
import { avatarSource, initialsOf } from "@/server/display-name";
import { createOrderService } from "@/server/orders";
import { MAX_PHOTO_BYTES, type PhotoStorage, type StoredPhoto } from "@/server/photo-storage";
import { createProfileService, ProfileError } from "@/server/profiles";
import { createRideService } from "@/server/rides";
import { suggestSize } from "@/server/sizes";
import { connectTestDatabase, resetDatabase } from "@/server/test-database";

const db = connectTestDatabase();
const access = createAccessService(db, { adminEmails: ["chefe@exemplo.com"] });
// Stands in for the disk: remembers what is stored so the tests can see files come and go.
const storedPhotos = new Map<string, StoredPhoto>();
let photoCounter = 0;

const photoStorage: PhotoStorage = {
  async save(photo) {
    photoCounter += 1;

    const key = `foto-${photoCounter}.jpg`;

    storedPhotos.set(key, photo);

    return key;
  },
  async read(key) {
    return storedPhotos.get(key) ?? null;
  },
  async remove(key) {
    storedPhotos.delete(key);
  },
};

const profiles = createProfileService(db, access, photoStorage);
const batches = createBatchService(db, access);
const orders = createOrderService(db, access);
// The rides in these tests leave on fixed dates; the clock stays before them unless a test
// brings its own.
const beforeAnyRide = () => new Date("2026-11-01T12:00:00Z");
const rides = createRideService(db, access, beforeAnyRide);

const request = {
  fullName: "Ana Reis",
  whatsapp: "(21) 98888-7777",
  bikeModel: "Scrambler 900",
  engineSize: "900",
};

async function createAdmin() {
  const admin = await db.user.create({ data: { email: "chefe@exemplo.com" } });

  await access.submitJoinRequest(admin.id, { ...request, fullName: "Chefe Lima" });

  return admin;
}

async function createRequester(email: string, fullName: string) {
  const user = await db.user.create({ data: { email, image: "https://exemplo.com/foto.jpg" } });
  const joinRequest = await access.submitJoinRequest(user.id, { ...request, fullName });

  return { user, joinRequest };
}

async function createParticipant(adminId: string, email: string, fullName: string) {
  const { user, joinRequest } = await createRequester(email, fullName);

  await access.decide(adminId, joinRequest.id, "approve");

  return user;
}

async function expectProfileError(action: Promise<unknown>, code: ProfileError["code"]) {
  await expect(action).rejects.toMatchObject({ name: "ProfileError", code });
}

beforeEach(async () => {
  await resetDatabase(db);
  storedPhotos.clear();
});

afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

describe("perfil nasce do pedido de ingresso", () => {
  it("traz o nome, o WhatsApp e a moto informados no pedido, com a moto como principal", async () => {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");

    expect(await profiles.getOwnProfile(ana.id)).toEqual({
      userId: ana.id,
      fullName: "Ana Reis",
      nickname: null,
      instagram: null,
      region: null,
      experience: null,
      bio: null,
      birthday: null,
      memberSince: expect.any(Date),
      whatsapp: "21988887777",
      photoKey: null,
      accountImage: "https://exemplo.com/foto.jpg",
      shirtSize: null,
      emergencyName: null,
      emergencyPhone: null,
      bloodType: null,
      emergencyName2: null,
      emergencyPhone2: null,
      healthPlan: null,
      healthPlanCard: null,
      healthNotes: null,
      isAdmin: false,
      bikes: [
        {
          id: expect.any(String),
          model: "Scrambler 900",
          engineSize: 900,
          year: null,
          color: null,
          nickname: null,
          rangeKm: null,
          photoKey: null,
          mods: [],
          isMain: true,
        },
      ],
    });
    expect((await profiles.getOwnProfile(admin.id)).isAdmin).toBe(true);
  });

  it("cria o perfil já no envio do pedido, mas só mostra a quem foi aprovado", async () => {
    const admin = await createAdmin();
    const { user: pending, joinRequest } = await createRequester("espera@exemplo.com", "Caio Sá");
    const stranger = await db.user.create({ data: { email: "novo@exemplo.com" } });

    expect(await db.profile.count({ where: { userId: pending.id } })).toBe(1);
    await expectProfileError(profiles.getOwnProfile(pending.id), "FORBIDDEN");
    await expectProfileError(profiles.getOwnProfile(stranger.id), "FORBIDDEN");

    await access.decide(admin.id, joinRequest.id, "reject");

    await expectProfileError(profiles.getOwnProfile(pending.id), "FORBIDDEN");
  });

  it("deixa o pedido de ingresso como foi escrito quando o perfil muda", async () => {
    const admin = await createAdmin();
    const { user: caio } = await createRequester("caio@exemplo.com", "Caio Sá");

    await db.profile.update({ where: { userId: caio.id }, data: { fullName: "Caio de Sá Neto" } });

    const [pending] = await access.listPending(admin.id);

    expect(pending.fullName).toBe("Caio Sá");
  });
});

describe("o nome vem do perfil", () => {
  it("aparece atualizado nas listas de pedidos, de presença e de riders", async () => {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");
    const batch = await batches.openBatch(admin.id, {
      model: "Camiseta Mirante",
      unitPrice: "80",
      sizes: ["M"],
      colors: [{ name: "Preta", photoKey: "preta.webp" }],
    });
    const { id: rideId } = await rides.publishRide(admin.id, {
      route: "Serra de Petrópolis",
      description: "",
      meetingTime: "",
      stops: [{ kind: "MEETING", name: "Posto BR", place: "", time: "", note: "" }],
      distanceKm: "100",
      surface: "PAVED",
      difficulty: "EASY",
      rideTime: "",
      tolls: "",
      tipIds: [],
      packingNote: "",
      planB: "",
      date: "2026-11-22",
      departureTime: "07:00",
      returnTime: "16:00",
      mapUrl: "",
      photoKey: null,
    });

    await orders.saveOrder(ana.id, batch.id, [
      { colorId: batch.colors[0].id, size: "M", quantity: 1 },
    ]);
    await rides.respond(ana.id, rideId, "GOING");
    await db.profile.update({ where: { userId: ana.id }, data: { fullName: "Ana Paula Reis" } });

    expect((await orders.listOrders(admin.id, batch.id))[0].participantName).toBe("Ana Paula Reis");
    expect((await orders.getBatchReport(admin.id, batch.id)).orders[0].participantName).toBe(
      "Ana Paula Reis",
    );
    expect((await rides.getRide(admin.id, rideId)).going).toEqual(["Ana Paula Reis"]);
    expect((await access.listParticipants(admin.id)).map((person) => person.fullName)).toEqual([
      "Ana Paula Reis",
      "Chefe Lima",
    ]);
  });
});

describe("editar dados pessoais", () => {
  const current = {
    fullName: "Ana Reis",
    nickname: "",
    instagram: "",
    region: "",
    experience: "",
    bio: "",
    birthday: "",
    whatsapp: "(21) 98888-7777",
    shirtSize: "",
    emergencyName: "",
    emergencyPhone: "",
    bloodType: "",
    emergencyName2: "",
    emergencyPhone2: "",
    healthPlan: "",
    healthPlanCard: "",
    healthNotes: "",
  };

  async function setup() {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");

    return { admin, ana };
  }

  async function expectInvalid(action: Promise<unknown>, field: string) {
    await expect(action).rejects.toMatchObject({
      code: "INVALID_INPUT",
      fieldErrors: { [field]: expect.any(String) },
    });
  }

  it("grava nome, apelido, Instagram, WhatsApp e tamanho", async () => {
    const { ana } = await setup();

    await profiles.updatePersonalData(ana.id, {
      ...current,
      fullName: " Ana Paula Reis ",
      nickname: " Aninha ",
      instagram: "@Ana.Reis_",
      whatsapp: "21 97777-0000",
      shirtSize: "M",
    });

    expect(await profiles.getOwnProfile(ana.id)).toMatchObject({
      fullName: "Ana Paula Reis",
      nickname: "Aninha",
      instagram: "ana.reis_",
      whatsapp: "21977770000",
      shirtSize: "M",
    });
  });

  it.each([
    ["brutavares", "brutavares"],
    ["@brutavares", "brutavares"],
    ["https://www.instagram.com/brutavares/", "brutavares"],
    ["instagram.com/Bru.Tavares?igsh=abc", "bru.tavares"],
  ])("reduz o Instagram %s ao usuário %s", async (typed, stored) => {
    const { ana } = await setup();

    await profiles.updatePersonalData(ana.id, { ...current, instagram: typed });

    expect((await profiles.getOwnProfile(ana.id)).instagram).toBe(stored);
  });

  it("remove apelido, Instagram e tamanho quando os campos voltam vazios", async () => {
    const { ana } = await setup();

    await profiles.updatePersonalData(ana.id, {
      ...current,
      nickname: "Aninha",
      instagram: "ana",
      shirtSize: "G",
    });
    await profiles.updatePersonalData(ana.id, current);

    expect(await profiles.getOwnProfile(ana.id)).toMatchObject({
      nickname: null,
      instagram: null,
      shirtSize: null,
    });
  });

  it("recusa nome vazio, WhatsApp curto, Instagram fora do formato, apelido longo e tamanho inexistente", async () => {
    const { ana } = await setup();

    await expectInvalid(profiles.updatePersonalData(ana.id, { ...current, fullName: " " }), "fullName");
    await expectInvalid(profiles.updatePersonalData(ana.id, { ...current, whatsapp: "9999" }), "whatsapp");
    await expectInvalid(
      profiles.updatePersonalData(ana.id, { ...current, instagram: "meu perfil!" }),
      "instagram",
    );
    await expectInvalid(
      profiles.updatePersonalData(ana.id, { ...current, nickname: "x".repeat(31) }),
      "nickname",
    );
    await expectInvalid(profiles.updatePersonalData(ana.id, { ...current, shirtSize: "XXL" }), "shirtSize");
    expect((await profiles.getOwnProfile(ana.id)).fullName).toBe("Ana Reis");
  });

  it("não deixa quem não está aprovado editar", async () => {
    await setup();

    const { user: pending } = await createRequester("espera@exemplo.com", "Caio Sá");

    await expectProfileError(profiles.updatePersonalData(pending.id, current), "FORBIDDEN");
  });

  it("mostra o apelido nas telas do grupo e o nome com apelido nos registros de gestão", async () => {
    const { admin, ana } = await setup();
    const batch = await batches.openBatch(admin.id, {
      model: "Camiseta Mirante",
      unitPrice: "80",
      sizes: ["M"],
      colors: [{ name: "Preta", photoKey: "preta.webp" }],
    });
    const { id: rideId } = await rides.publishRide(admin.id, {
      route: "Serra de Petrópolis",
      description: "",
      meetingTime: "",
      stops: [{ kind: "MEETING", name: "Posto BR", place: "", time: "", note: "" }],
      distanceKm: "100",
      surface: "PAVED",
      difficulty: "EASY",
      rideTime: "",
      tolls: "",
      tipIds: [],
      packingNote: "",
      planB: "",
      date: "2026-11-22",
      departureTime: "07:00",
      returnTime: "16:00",
      mapUrl: "",
      photoKey: null,
    });

    await orders.saveOrder(ana.id, batch.id, [
      { colorId: batch.colors[0].id, size: "M", quantity: 1 },
    ]);
    await rides.respond(ana.id, rideId, "GOING");
    await profiles.updatePersonalData(ana.id, { ...current, nickname: "Aninha" });

    expect((await orders.listOrders(admin.id, batch.id))[0].participantName).toBe("Aninha");
    expect((await rides.getRide(admin.id, rideId)).going).toEqual(["Aninha"]);
    expect((await orders.listManagedOrders(admin.id, batch.id))[0].participantName).toBe(
      "Ana Reis (Aninha)",
    );
    expect((await orders.getBatchReport(admin.id, batch.id)).orders[0].participantName).toBe(
      "Ana Reis (Aninha)",
    );
    expect((await access.listParticipants(admin.id)).map((person) => person.fullName)).toEqual([
      "Ana Reis (Aninha)",
      "Chefe Lima",
    ]);
  });
});

describe("região, experiência, bio e tempo de grupo", () => {
  const current = {
    fullName: "Ana Reis",
    nickname: "",
    instagram: "",
    region: "",
    experience: "",
    bio: "",
    birthday: "",
    whatsapp: "(21) 98888-7777",
    shirtSize: "",
    emergencyName: "",
    emergencyPhone: "",
    bloodType: "",
    emergencyName2: "",
    emergencyPhone2: "",
    healthPlan: "",
    healthPlanCard: "",
    healthNotes: "",
  };
  const filled = { ...current, region: "ZONA_NORTE", experience: "ROAD_AND_DIRT", bio: " Serra aos sábados " };

  async function setup() {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");
    const bia = await createParticipant(admin.id, "bia@exemplo.com", "Bia Souza");

    return { admin, ana, bia };
  }

  it("grava os três dados e os mostra à própria pessoa, a outro rider e ao administrador", async () => {
    const { admin, ana, bia } = await setup();

    await profiles.updatePersonalData(ana.id, filled);

    const expected = { region: "ZONA_NORTE", experience: "ROAD_AND_DIRT", bio: "Serra aos sábados" };

    expect(await profiles.getOwnProfile(ana.id)).toMatchObject(expected);
    expect(await profiles.getMemberProfile(bia.id, ana.id)).toMatchObject(expected);
    expect(await profiles.getMemberRecord(admin.id, ana.id)).toMatchObject(expected);
  });

  it("apaga os três dados quando os campos voltam vazios", async () => {
    const { ana } = await setup();

    await profiles.updatePersonalData(ana.id, filled);
    await profiles.updatePersonalData(ana.id, current);

    expect(await profiles.getOwnProfile(ana.id)).toMatchObject({ region: null, experience: null, bio: null });
  });

  it("recusa região e nível fora da lista, bio longa e bio com quebra de linha", async () => {
    const { ana } = await setup();
    const refused = [
      ["region", { ...current, region: "Copacabana" }],
      ["experience", { ...current, experience: "EXPERT" }],
      ["bio", { ...current, bio: "x".repeat(141) }],
      ["bio", { ...current, bio: "uma linha\noutra linha" }],
    ] as const;

    for (const [field, input] of refused) {
      await expect(profiles.updatePersonalData(ana.id, input)).rejects.toMatchObject({
        code: "INVALID_INPUT",
        fieldErrors: { [field]: expect.any(String) },
      });
    }

    await profiles.updatePersonalData(ana.id, { ...current, bio: "x".repeat(140) });
  });

  it("conta o tempo de grupo a partir da aprovação, e bloquear não muda a data", async () => {
    const { admin, ana, bia } = await setup();
    const approval = await db.accessDecision.findFirstOrThrow({
      where: { joinRequest: { userId: ana.id }, kind: "APPROVED" },
    });

    expect((await profiles.getOwnProfile(ana.id)).memberSince).toEqual(approval.createdAt);

    const anaRequest = await db.joinRequest.findUniqueOrThrow({ where: { userId: ana.id } });

    await access.block(admin.id, anaRequest.id);
    await access.unblock(admin.id, anaRequest.id);

    expect((await profiles.getMemberProfile(bia.id, ana.id)).memberSince).toEqual(approval.createdAt);
  });

  it("vale a aprovação para quem foi reprovado antes", async () => {
    const admin = await createAdmin();
    const { user, joinRequest } = await createRequester("caio@exemplo.com", "Caio Melo");

    await access.decide(admin.id, joinRequest.id, "reject");
    await access.revertRejection(admin.id, joinRequest.id);

    const reverted = await db.accessDecision.findFirstOrThrow({
      where: { joinRequestId: joinRequest.id, kind: "REVERTED" },
    });

    expect((await profiles.getOwnProfile(user.id)).memberSince).toEqual(reverted.createdAt);
  });

  it("usa a data do pedido para o administrador que entrou sem aprovação", async () => {
    const admin = await createAdmin();
    const request = await db.joinRequest.findUniqueOrThrow({ where: { userId: admin.id } });

    expect((await profiles.getOwnProfile(admin.id)).memberSince).toEqual(request.createdAt);
  });
});

describe("aniversário", () => {
  const current = {
    fullName: "Ana Reis",
    nickname: "",
    instagram: "",
    region: "",
    experience: "",
    bio: "",
    birthday: "",
    whatsapp: "(21) 98888-7777",
    shirtSize: "",
    emergencyName: "",
    emergencyPhone: "",
    bloodType: "",
    emergencyName2: "",
    emergencyPhone2: "",
    healthPlan: "",
    healthPlanCard: "",
    healthNotes: "",
  };
  const midAugust = new Date("2027-08-15T15:00:00Z");

  async function setup() {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");
    const bia = await createParticipant(admin.id, "bia@exemplo.com", "Bia Souza");
    const caio = await createParticipant(admin.id, "caio@exemplo.com", "Caio Melo");

    return { admin, ana, bia, caio };
  }

  function birthdayOn(userId: string, birthday: string, fullName: string) {
    return profiles.updatePersonalData(userId, { ...current, fullName, birthday });
  }

  it.each([
    ["12/08", { day: 12, month: 8 }],
    ["5/3", { day: 5, month: 3 }],
    ["29-02", { day: 29, month: 2 }],
  ])("guarda %s só como dia e mês e mostra a outro rider", async (text, expected) => {
    const { ana, bia } = await setup();

    await birthdayOn(ana.id, text, "Ana Reis");

    expect((await profiles.getOwnProfile(ana.id)).birthday).toEqual(expected);
    expect((await profiles.getMemberProfile(bia.id, ana.id)).birthday).toEqual(expected);
  });

  it("recusa data que não existe ou que traz ano", async () => {
    const { ana } = await setup();

    for (const birthday of ["30/02", "31/04", "0/5", "12/13", "12/08/1990", "agosto"]) {
      await expect(birthdayOn(ana.id, birthday, "Ana Reis")).rejects.toMatchObject({
        code: "INVALID_INPUT",
        fieldErrors: { birthday: expect.any(String) },
      });
    }
  });

  it("lista os aniversariantes do mês em ordem de dia, sem quem não informou", async () => {
    const { ana, bia, caio } = await setup();

    await birthdayOn(ana.id, "20/08", "Ana Reis");
    await birthdayOn(bia.id, "03/08", "Bia Souza");
    await birthdayOn(caio.id, "10/09", "Caio Melo");

    const { monthName, people } = await profiles.listBirthdays(caio.id, midAugust);

    expect(monthName).toBe("agosto");
    expect(people.map((person) => [person.fullName, person.day])).toEqual([
      ["Bia Souza", 3],
      ["Ana Reis", 20],
    ]);
  });

  it("tira da lista quem apagou o aniversário e quem está bloqueado", async () => {
    const { admin, ana, bia, caio } = await setup();
    const biaRequest = await db.joinRequest.findUniqueOrThrow({ where: { userId: bia.id } });

    await birthdayOn(ana.id, "20/08", "Ana Reis");
    await birthdayOn(bia.id, "03/08", "Bia Souza");
    await birthdayOn(ana.id, "", "Ana Reis");
    await access.block(admin.id, biaRequest.id);

    expect((await profiles.listBirthdays(caio.id, midAugust)).people).toEqual([]);
  });

  it("vira o mês pelo relógio de Brasília e mostra 29 de fevereiro em qualquer fevereiro", async () => {
    const { ana, bia } = await setup();

    await birthdayOn(ana.id, "29/02", "Ana Reis");
    await birthdayOn(bia.id, "01/03", "Bia Souza");

    // 1 de março às 02h em UTC ainda é 28 de fevereiro às 23h no Rio; 2027 não é bissexto.
    const lastNightOfFebruary = new Date("2027-03-01T02:00:00Z");
    const firstMorningOfMarch = new Date("2027-03-01T12:00:00Z");
    const february = await profiles.listBirthdays(bia.id, lastNightOfFebruary);
    const march = await profiles.listBirthdays(ana.id, firstMorningOfMarch);

    expect(february.people.map((person) => person.fullName)).toEqual(["Ana Reis"]);
    expect(march.people.map((person) => person.fullName)).toEqual(["Bia Souza"]);
  });

  it("não mostra aniversariantes a quem não está aprovado", async () => {
    const { user } = await createRequester("dani@exemplo.com", "Dani Luz");

    await expectProfileError(profiles.listBirthdays(user.id), "FORBIDDEN");
  });
});

describe("foto do perfil", () => {
  const personal = {
    fullName: "Ana Reis",
    nickname: "",
    instagram: "",
    region: "",
    experience: "",
    bio: "",
    birthday: "",
    whatsapp: "(21) 98888-7777",
    shirtSize: "",
    emergencyName: "",
    emergencyPhone: "",
    bloodType: "",
    emergencyName2: "",
    emergencyPhone2: "",
    healthPlan: "",
    healthPlanCard: "",
    healthNotes: "",
  };
  const jpeg = (size = 10): StoredPhoto => ({ bytes: new Uint8Array(size), contentType: "image/jpeg" });

  async function setup() {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");

    return { admin, ana };
  }

  it("guarda a foto enviada e a mantém quando só os outros dados mudam", async () => {
    const { ana } = await setup();

    await profiles.updatePersonalData(ana.id, personal, { kind: "replace", photo: jpeg() });

    const { photoKey } = await profiles.getOwnProfile(ana.id);

    expect(photoKey).not.toBeNull();
    expect(storedPhotos.has(photoKey ?? "")).toBe(true);

    await profiles.updatePersonalData(ana.id, { ...personal, nickname: "Aninha" });

    expect((await profiles.getOwnProfile(ana.id)).photoKey).toBe(photoKey);
    expect(storedPhotos.size).toBe(1);
  });

  it("apaga o arquivo anterior ao trocar e ao remover a foto", async () => {
    const { ana } = await setup();

    await profiles.updatePersonalData(ana.id, personal, { kind: "replace", photo: jpeg() });

    const first = (await profiles.getOwnProfile(ana.id)).photoKey;

    await profiles.updatePersonalData(ana.id, personal, { kind: "replace", photo: jpeg() });

    const second = (await profiles.getOwnProfile(ana.id)).photoKey;

    expect(second).not.toBe(first);
    expect([...storedPhotos.keys()]).toEqual([second]);

    await profiles.updatePersonalData(ana.id, personal, { kind: "remove" });

    expect((await profiles.getOwnProfile(ana.id)).photoKey).toBeNull();
    expect(storedPhotos.size).toBe(0);
  });

  it("recusa formato ou tamanho não aceito sem guardar nada nem mexer no resto", async () => {
    const { ana } = await setup();
    const pdf = { bytes: new Uint8Array(10), contentType: "application/pdf" };
    const huge = jpeg(MAX_PHOTO_BYTES + 1);

    for (const photo of [pdf, huge]) {
      await expect(
        profiles.updatePersonalData(ana.id, { ...personal, nickname: "Aninha" }, { kind: "replace", photo }),
      ).rejects.toMatchObject({ code: "INVALID_INPUT", fieldErrors: { photo: expect.any(String) } });
    }

    expect(storedPhotos.size).toBe(0);
    expect(await profiles.getOwnProfile(ana.id)).toMatchObject({ photoKey: null, nickname: null });
  });

  it("não guarda a foto nova quando outro campo é recusado", async () => {
    const { ana } = await setup();

    await expect(
      profiles.updatePersonalData(ana.id, { ...personal, fullName: "" }, { kind: "replace", photo: jpeg() }),
    ).rejects.toMatchObject({ code: "INVALID_INPUT" });

    expect(storedPhotos.size).toBe(0);
  });

  it("escolhe o que mostrar: foto enviada, depois a do Google, depois as iniciais", () => {
    const person = { fullName: "Ana Paula Reis", nickname: null };

    expect(avatarSource({ ...person, photoKey: "a.jpg", accountImage: "https://g/x.jpg" })).toEqual({
      kind: "photo",
      url: "/fotos/a.jpg",
    });
    expect(avatarSource({ ...person, photoKey: null, accountImage: "https://g/x.jpg" })).toEqual({
      kind: "account",
      url: "https://g/x.jpg",
    });
    expect(avatarSource({ ...person, photoKey: null, accountImage: null })).toEqual({
      kind: "initials",
      text: "AR",
    });
  });

  it("tira as iniciais do apelido quando existe, senão do nome", () => {
    expect(initialsOf({ fullName: "Ana Paula Reis", nickname: null })).toBe("AR");
    expect(initialsOf({ fullName: "Ana Paula Reis", nickname: "Aninha" })).toBe("A");
    expect(initialsOf({ fullName: "  bruno  ", nickname: null })).toBe("B");
  });
});

describe("motos", () => {
  const second = { model: "Scrambler 400 X", engineSize: "400", year: "2024", color: "Amarela", nickname: "", rangeKm: "" };

  async function setup() {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");

    return { admin, ana };
  }

  async function bikesOf(userId: string) {
    return (await profiles.getOwnProfile(userId)).bikes;
  }

  it("dá ao modelo da lista a cilindrada dele e aceita outro modelo com a cilindrada digitada", async () => {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");

    await profiles.addBike(ana.id, { model: "triumph scrambler 1200xe", engineSize: "", year: "", color: "", nickname: "", rangeKm: "" });
    await profiles.addBike(ana.id, { model: "Speed Twin", engineSize: "1200", year: "", color: "", nickname: "", rangeKm: "" });

    const bikes = (await profiles.getOwnProfile(ana.id)).bikes.map((bike) => [bike.model, bike.engineSize]);

    expect(bikes).toEqual([
      ["Scrambler 900", 900],
      ["Scrambler 1200 XE", 1200],
      ["Speed Twin", 1200],
    ]);
    await expect(
      profiles.addBike(ana.id, { model: "Speed Twin", engineSize: "", year: "", color: "", nickname: "", rangeKm: "" }),
    ).rejects.toMatchObject({ code: "INVALID_INPUT", fieldErrors: { engineSize: expect.any(String) } });
  });

  it("aceita no pedido de ingresso o modelo da lista sem cilindrada, e outro modelo com ela", async () => {
    const listed = await db.user.create({ data: { email: "lia@exemplo.com" } });
    const other = await db.user.create({ data: { email: "nei@exemplo.com" } });

    await access.submitJoinRequest(listed.id, { ...request, bikeModel: "Scrambler 400 XC", engineSize: "" });
    await access.submitJoinRequest(other.id, { ...request, bikeModel: "Bonneville T120", engineSize: "1200" });

    const stored = await db.joinRequest.findMany({ orderBy: { createdAt: "asc" } });

    expect(stored.map((row) => [row.bikeModel, row.engineSize])).toEqual([
      ["Scrambler 400 XC", 400],
      ["Bonneville T120", 1200],
    ]);
  });

  it("adiciona uma segunda moto com ano e cor, depois da principal", async () => {
    const { ana } = await setup();

    await profiles.addBike(ana.id, second);

    expect(await bikesOf(ana.id)).toMatchObject([
      { model: "Scrambler 900", engineSize: 900, isMain: true },
      { model: "Scrambler 400 X", engineSize: 400, year: 2024, color: "Amarela", isMain: false },
    ]);
  });

  it("corrige os dados de uma moto e limpa ano e cor quando voltam vazios", async () => {
    const { ana } = await setup();
    const [bike] = await bikesOf(ana.id);

    await profiles.updateBike(ana.id, bike.id, {
      model: "Scrambler 1200 XE",
      engineSize: "1200",
      year: "2023",
      color: "Verde",
      nickname: "",
      rangeKm: "",
    });
    await profiles.updateBike(ana.id, bike.id, {
      model: "Scrambler 1200 XE",
      engineSize: "1200",
      year: "",
      color: "",
      nickname: "",
      rangeKm: "",
    });

    expect(await bikesOf(ana.id)).toEqual([
      { id: bike.id, model: "Scrambler 1200 XE", engineSize: 1200, year: null, color: null, nickname: null, rangeKm: null, photoKey: null, mods: [], isMain: true },
    ]);
  });

  it("recusa modelo vazio, cilindrada que não é número e ano fora do plausível", async () => {
    const { ana } = await setup();
    const invalid = [
      [{ ...second, model: " " }, "model"],
      [{ ...second, model: "Bonneville T120", engineSize: "novecentos" }, "engineSize"],
      [{ ...second, year: "1800" }, "year"],
      [{ ...second, year: "24" }, "year"],
      [{ ...second, color: "x".repeat(31) }, "color"],
    ] as const;

    for (const [input, field] of invalid) {
      await expect(profiles.addBike(ana.id, input)).rejects.toMatchObject({
        code: "INVALID_INPUT",
        fieldErrors: { [field]: expect.any(String) },
      });
    }

    expect(await bikesOf(ana.id)).toHaveLength(1);
  });

  it("guarda apelido e autonomia, mostra a outro rider e limpa quando voltam vazios", async () => {
    const { ana } = await setup();
    const admin = await db.user.findFirstOrThrow({ where: { email: "chefe@exemplo.com" } });
    const { id } = await profiles.addBike(ana.id, { ...second, nickname: " Tangerina ", rangeKm: "280" });

    const seen = (await profiles.getMemberProfile(admin.id, ana.id)).bikes.find((bike) => bike.id === id);

    expect(seen).toMatchObject({ nickname: "Tangerina", rangeKm: 280, photoKey: null });

    await profiles.updateBike(ana.id, id, second);

    const cleared = (await bikesOf(ana.id)).find((bike) => bike.id === id);

    expect(cleared).toMatchObject({ nickname: null, rangeKm: null });
  });

  it("recusa apelido longo e autonomia fora da faixa", async () => {
    const { ana } = await setup();
    const invalid = [
      [{ ...second, nickname: "x".repeat(41) }, "nickname"],
      [{ ...second, rangeKm: "49" }, "rangeKm"],
      [{ ...second, rangeKm: "1001" }, "rangeKm"],
      [{ ...second, rangeKm: "muito" }, "rangeKm"],
    ] as const;

    for (const [input, field] of invalid) {
      await expect(profiles.addBike(ana.id, input)).rejects.toMatchObject({
        code: "INVALID_INPUT",
        fieldErrors: { [field]: expect.any(String) },
      });
    }

    await profiles.addBike(ana.id, { ...second, rangeKm: "50" });
  });

  it("guarda a foto da moto, troca apagando a anterior e a leva para a lista de riders", async () => {
    const { ana } = await setup();
    const jpeg = { bytes: new Uint8Array([1, 2, 3]), contentType: "image/jpeg" };
    const { id } = await profiles.addBike(ana.id, second, { kind: "replace", photo: jpeg });
    const first = (await bikesOf(ana.id)).find((bike) => bike.id === id)?.photoKey ?? "";

    expect(storedPhotos.has(first)).toBe(true);

    await profiles.updateBike(ana.id, id, { ...second, color: "Preta" });

    expect((await bikesOf(ana.id)).find((bike) => bike.id === id)?.photoKey).toBe(first);

    await profiles.updateBike(ana.id, id, second, { kind: "replace", photo: jpeg });

    const replaced = (await bikesOf(ana.id)).find((bike) => bike.id === id)?.photoKey ?? "";

    expect(replaced).not.toBe(first);
    expect([...storedPhotos.keys()]).toEqual([replaced]);

    await profiles.setMainBike(ana.id, id);

    const listed = (await profiles.listGroup(ana.id)).find((member) => member.userId === ana.id);

    expect(listed?.mainBike.photoKey).toBe(replaced);

    await profiles.updateBike(ana.id, id, second, { kind: "remove" });

    expect(storedPhotos.size).toBe(0);
  });

  it("apaga a foto ao remover a moto e não guarda nada quando o envio é recusado", async () => {
    const { ana } = await setup();
    const jpeg = { bytes: new Uint8Array([1, 2, 3]), contentType: "image/jpeg" };
    const pdf = { bytes: new Uint8Array([1]), contentType: "application/pdf" };
    const { id } = await profiles.addBike(ana.id, second, { kind: "replace", photo: jpeg });

    await profiles.removeBike(ana.id, id);

    expect(storedPhotos.size).toBe(0);

    await expect(
      profiles.addBike(ana.id, second, { kind: "replace", photo: pdf }),
    ).rejects.toMatchObject({ code: "INVALID_INPUT", fieldErrors: { photo: expect.any(String) } });
    await expect(
      profiles.addBike(ana.id, { ...second, rangeKm: "9" }, { kind: "replace", photo: jpeg }),
    ).rejects.toMatchObject({ code: "INVALID_INPUT" });

    expect(storedPhotos.size).toBe(0);
    expect(await bikesOf(ana.id)).toHaveLength(1);
  });

  it("lista as modificações da moto na ordem de cadastro e as mostra a outro rider", async () => {
    const { admin, ana } = await setup();
    const [bike] = await bikesOf(ana.id);

    await profiles.addBikeMod(ana.id, bike.id, { category: "TYRES", description: " Pirelli Scorpion Rally " });
    await profiles.addBikeMod(ana.id, bike.id, { category: "EXHAUST", description: "Zard alto" });
    await profiles.addBikeMod(ana.id, bike.id, { category: "TYRES", description: "Câmara reforçada" });

    const seen = (await profiles.getMemberProfile(admin.id, ana.id)).bikes[0].mods;

    expect(seen.map((mod) => [mod.category, mod.description])).toEqual([
      ["TYRES", "Pirelli Scorpion Rally"],
      ["EXHAUST", "Zard alto"],
      ["TYRES", "Câmara reforçada"],
    ]);
    expect(groupMods(seen).map((group) => [group.label, group.items.length])).toEqual([
      ["Escape", 1],
      ["Pneus", 2],
    ]);
  });

  it("deixa o dono editar e remover um item, e só o dono", async () => {
    const { admin, ana } = await setup();
    const [bike] = await bikesOf(ana.id);
    const { id } = await profiles.addBikeMod(ana.id, bike.id, { category: "EXHAUST", description: "Zard alto" });

    await expectProfileError(profiles.addBikeMod(admin.id, bike.id, { category: "OTHER", description: "Adesivo" }), "NOT_FOUND");
    await expectProfileError(profiles.updateBikeMod(admin.id, id, { category: "OTHER", description: "Outro" }), "NOT_FOUND");
    await expectProfileError(profiles.removeBikeMod(admin.id, id), "NOT_FOUND");

    await profiles.updateBikeMod(ana.id, id, { category: "LUGGAGE", description: "Bagageiro SW-Motech" });

    expect((await bikesOf(ana.id))[0].mods).toEqual([{ id, category: "LUGGAGE", description: "Bagageiro SW-Motech" }]);

    await profiles.removeBikeMod(ana.id, id);

    expect((await bikesOf(ana.id))[0].mods).toEqual([]);
  });

  it("recusa item sem categoria da lista, sem descrição ou longo demais", async () => {
    const { ana } = await setup();
    const [bike] = await bikesOf(ana.id);
    const invalid = [
      [{ category: "Banco", description: "Banco comfort" }, "category"],
      [{ category: "", description: "Banco comfort" }, "category"],
      [{ category: "OTHER", description: " " }, "description"],
      [{ category: "OTHER", description: "x".repeat(81) }, "description"],
    ] as const;

    for (const [input, field] of invalid) {
      await expect(profiles.addBikeMod(ana.id, bike.id, input)).rejects.toMatchObject({
        code: "INVALID_INPUT",
        fieldErrors: { [field]: expect.any(String) },
      });
    }

    await profiles.addBikeMod(ana.id, bike.id, { category: "OTHER", description: "x".repeat(80) });
  });

  it("para no vigésimo item, mesmo com pedidos simultâneos, e apaga os itens com a moto", async () => {
    const { ana } = await setup();
    const { id: bikeId } = await profiles.addBike(ana.id, second);
    const item = { category: "OTHER", description: "Item" };

    for (let count = 0; count < 19; count += 1) await profiles.addBikeMod(ana.id, bikeId, item);

    const results = await Promise.allSettled([
      profiles.addBikeMod(ana.id, bikeId, item),
      profiles.addBikeMod(ana.id, bikeId, item),
    ]);

    expect(results.map((result) => result.status).toSorted()).toEqual(["fulfilled", "rejected"]);
    await expectProfileError(profiles.addBikeMod(ana.id, bikeId, item), "MOD_LIMIT");
    expect(await db.bikeMod.count()).toBe(20);

    await profiles.removeBike(ana.id, bikeId);

    expect(await db.bikeMod.count()).toBe(0);
  });

  it("deixa escolher a principal, e sempre existe exatamente uma", async () => {
    const { ana } = await setup();
    const added = await profiles.addBike(ana.id, second);

    await Promise.all([
      profiles.setMainBike(ana.id, added.id),
      profiles.setMainBike(ana.id, added.id),
    ]);

    const bikes = await bikesOf(ana.id);

    expect(bikes.filter((bike) => bike.isMain)).toHaveLength(1);
    expect(bikes[0]).toMatchObject({ id: added.id, isMain: true });
  });

  it("passa o título de principal à mais antiga das que ficam quando a principal é removida", async () => {
    const { ana } = await setup();
    const [first] = await bikesOf(ana.id);
    const middle = await profiles.addBike(ana.id, second);

    await profiles.addBike(ana.id, { ...second, model: "Scrambler 1200 X" });
    await profiles.removeBike(ana.id, first.id);

    expect(await bikesOf(ana.id)).toMatchObject([
      { id: middle.id, isMain: true },
      { model: "Scrambler 1200 X", isMain: false },
    ]);
  });

  it("nunca deixa a pessoa sem moto, nem com duas remoções ao mesmo tempo", async () => {
    const { ana } = await setup();
    const [first] = await bikesOf(ana.id);

    await expectProfileError(profiles.removeBike(ana.id, first.id), "LAST_BIKE");

    const added = await profiles.addBike(ana.id, second);
    const results = await Promise.allSettled([
      profiles.removeBike(ana.id, first.id),
      profiles.removeBike(ana.id, added.id),
    ]);
    const bikes = await bikesOf(ana.id);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(bikes).toHaveLength(1);
    expect(bikes[0].isMain).toBe(true);
  });

  it("para em cinco motos, mesmo com pedidos simultâneos", async () => {
    const { ana } = await setup();

    await profiles.addBike(ana.id, second);
    await profiles.addBike(ana.id, second);
    await profiles.addBike(ana.id, second);

    const results = await Promise.allSettled([
      profiles.addBike(ana.id, second),
      profiles.addBike(ana.id, second),
      profiles.addBike(ana.id, second),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(await bikesOf(ana.id)).toHaveLength(5);
    await expectProfileError(profiles.addBike(ana.id, second), "BIKE_LIMIT");
  });

  it("não deixa mexer na moto de outra pessoa nem quem não está aprovado", async () => {
    const { admin, ana } = await setup();
    const [anaBike] = await bikesOf(ana.id);
    const { user: pending } = await createRequester("espera@exemplo.com", "Caio Sá");

    await profiles.addBike(admin.id, second);

    await expectProfileError(profiles.updateBike(admin.id, anaBike.id, second), "NOT_FOUND");
    await expectProfileError(profiles.setMainBike(admin.id, anaBike.id), "NOT_FOUND");
    await expectProfileError(profiles.removeBike(admin.id, anaBike.id), "NOT_FOUND");
    await expectProfileError(profiles.addBike(pending.id, second), "FORBIDDEN");
    expect(await bikesOf(ana.id)).toHaveLength(1);
  });
});

describe("dados de emergência", () => {
  const personal = {
    fullName: "Ana Reis",
    nickname: "",
    instagram: "",
    region: "",
    experience: "",
    bio: "",
    birthday: "",
    whatsapp: "(21) 98888-7777",
    shirtSize: "",
    emergencyName: "",
    emergencyPhone: "",
    bloodType: "",
    emergencyName2: "",
    emergencyPhone2: "",
    healthPlan: "",
    healthPlanCard: "",
    healthNotes: "",
  };
  const emergency = {
    ...personal,
    emergencyName: " Carla Reis (mãe) ",
    emergencyPhone: "(21) 97777-1234",
    bloodType: "O+",
    emergencyName2: "",
    emergencyPhone2: "",
    healthPlan: "",
    healthPlanCard: "",
    healthNotes: "",
  };

  async function setup() {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");

    return { admin, ana };
  }

  it("guarda contato, telefone só com dígitos e tipo sanguíneo", async () => {
    const { ana } = await setup();

    await profiles.updatePersonalData(ana.id, emergency);

    expect(await profiles.getOwnProfile(ana.id)).toMatchObject({
      emergencyName: "Carla Reis (mãe)",
      emergencyPhone: "21977771234",
      bloodType: "O+",
    });
  });

  it("aceita o perfil sem nenhum dado de emergência, e também só o tipo sanguíneo", async () => {
    const { ana } = await setup();

    await profiles.updatePersonalData(ana.id, personal);
    await profiles.updatePersonalData(ana.id, { ...personal, bloodType: "Não sei" });

    expect(await profiles.getOwnProfile(ana.id)).toMatchObject({
      emergencyName: null,
      emergencyPhone: null,
      bloodType: "Não sei",
    });
  });

  it("exige nome e telefone do contato juntos, telefone com DDD e tipo da lista", async () => {
    const { ana } = await setup();
    const invalid = [
      [{ ...emergency, emergencyName: "" }, "emergencyName"],
      [{ ...emergency, emergencyPhone: "" }, "emergencyPhone"],
      [{ ...emergency, emergencyPhone: "9999" }, "emergencyPhone"],
      [{ ...emergency, bloodType: "X+" }, "bloodType"],
    ] as const;

    for (const [input, field] of invalid) {
      await expect(profiles.updatePersonalData(ana.id, input)).rejects.toMatchObject({
        code: "INVALID_INPUT",
        fieldErrors: { [field]: expect.any(String) },
      });
    }

    expect((await profiles.getOwnProfile(ana.id)).emergencyName).toBeNull();
  });

  it("apaga os três dados de uma vez, sem mexer no resto do perfil", async () => {
    const { ana } = await setup();

    await profiles.updatePersonalData(ana.id, { ...emergency, nickname: "Aninha" });
    await profiles.clearEmergencyData(ana.id);

    expect(await profiles.getOwnProfile(ana.id)).toMatchObject({
      nickname: "Aninha",
      emergencyName: null,
      emergencyPhone: null,
      bloodType: null,
    });
  });

  const extended = {
    ...emergency,
    emergencyName2: " Paulo Reis (irmão) ",
    emergencyPhone2: "(21) 96666-4321",
    healthPlan: " Unimed Rio ",
    healthPlanCard: " 0 123 456789 00-1 ",
    healthNotes: " Alergia a dipirona. ",
  };

  it("guarda segundo contato, plano de saúde e alergias, e os mostra só à pessoa e ao administrador", async () => {
    const { admin, ana } = await setup();
    const bia = await createParticipant(admin.id, "bia@exemplo.com", "Bia Souza");
    const expected = {
      emergencyName2: "Paulo Reis (irmão)",
      emergencyPhone2: "21966664321",
      healthPlan: "Unimed Rio",
      healthPlanCard: "0 123 456789 00-1",
      healthNotes: "Alergia a dipirona.",
    };

    await profiles.updatePersonalData(ana.id, extended);

    expect(await profiles.getOwnProfile(ana.id)).toMatchObject(expected);
    expect(await profiles.getMemberRecord(admin.id, ana.id)).toMatchObject(expected);

    const seenByRider = JSON.stringify(await profiles.getMemberProfile(bia.id, ana.id));

    for (const secret of ["Paulo", "21966664321", "Unimed", "456789", "dipirona"]) {
      expect(seenByRider).not.toContain(secret);
    }
  });

  it("recusa segundo contato pela metade ou sem o primeiro, carteirinha sem plano e texto longo", async () => {
    const { ana } = await setup();
    const refused = [
      [{ ...extended, emergencyName2: "" }, "emergencyName2"],
      [{ ...extended, emergencyPhone2: "" }, "emergencyPhone2"],
      [{ ...extended, emergencyPhone2: "999" }, "emergencyPhone2"],
      [{ ...extended, emergencyName: "", emergencyPhone: "" }, "emergencyName2"],
      [{ ...extended, healthPlan: "" }, "healthPlan"],
      [{ ...extended, healthNotes: "x".repeat(501) }, "healthNotes"],
    ] as const;

    for (const [input, field] of refused) {
      await expect(profiles.updatePersonalData(ana.id, input)).rejects.toMatchObject({
        code: "INVALID_INPUT",
        fieldErrors: { [field]: expect.any(String) },
      });
    }

    await profiles.updatePersonalData(ana.id, { ...extended, healthPlanCard: "", healthNotes: "x".repeat(500) });
  });

  it("apaga de uma vez os dados de emergência antigos e novos, sem tocar no resto", async () => {
    const { ana } = await setup();

    await profiles.updatePersonalData(ana.id, { ...extended, nickname: "Aninha" });
    await profiles.clearEmergencyData(ana.id);

    expect(await profiles.getOwnProfile(ana.id)).toMatchObject({
      nickname: "Aninha",
      emergencyName: null,
      emergencyPhone: null,
      bloodType: null,
      emergencyName2: null,
      emergencyPhone2: null,
      healthPlan: null,
      healthPlanCard: null,
      healthNotes: null,
    });
  });

  it("não leva nenhum dado de emergência nem telefone para o relatório da campanha", async () => {
    const { admin, ana } = await setup();
    const batch = await batches.openBatch(admin.id, {
      model: "Camiseta Mirante",
      unitPrice: "80",
      sizes: ["M"],
      colors: [{ name: "Preta", photoKey: "preta.webp" }],
    });

    await profiles.updatePersonalData(ana.id, extended);
    await orders.saveOrder(ana.id, batch.id, [
      { colorId: batch.colors[0].id, size: "M", quantity: 1 },
    ]);

    const report = JSON.stringify(await orders.getBatchReport(admin.id, batch.id));
    const groupList = JSON.stringify(await orders.listOrders(admin.id, batch.id));

    for (const secret of ["Carla", "21977771234", "O+", "21988887777", "Paulo", "21966664321", "Unimed", "dipirona"]) {
      expect(report).not.toContain(secret);
      expect(groupList).not.toContain(secret);
    }
  });

  it("não deixa quem não está aprovado apagar", async () => {
    await setup();

    const { user: pending } = await createRequester("espera@exemplo.com", "Caio Sá");

    await expectProfileError(profiles.clearEmergencyData(pending.id), "FORBIDDEN");
  });
});

describe("pessoal do grupo", () => {
  const filled = {
    fullName: "Ana Reis",
    nickname: "Zeca",
    instagram: "ana.reis",
    region: "",
    experience: "",
    bio: "",
    birthday: "",
    whatsapp: "(21) 98888-7777",
    shirtSize: "M",
    emergencyName: "Carla Reis",
    emergencyPhone: "(21) 97777-1234",
    bloodType: "O+",
    emergencyName2: "",
    emergencyPhone2: "",
    healthPlan: "",
    healthPlanCard: "",
    healthNotes: "",
  };

  async function setup() {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");
    const bia = await createParticipant(admin.id, "bia@exemplo.com", "Bia Luz");

    await profiles.updatePersonalData(ana.id, filled);

    return { admin, ana, bia };
  }

  it("lista quem está no grupo pelo nome exibido, com moto principal e marca de administrador", async () => {
    const { admin, ana, bia } = await setup();

    expect(await profiles.listGroup(bia.id)).toEqual([
      {
        userId: bia.id,
        fullName: "Bia Luz",
        nickname: null,
        photoKey: null,
        accountImage: "https://exemplo.com/foto.jpg",
        isAdmin: false,
        mainBike: { model: "Scrambler 900", engineSize: 900, photoKey: null },
      },
      {
        userId: admin.id,
        fullName: "Chefe Lima",
        nickname: null,
        photoKey: null,
        accountImage: null,
        isAdmin: true,
        mainBike: { model: "Scrambler 900", engineSize: 900, photoKey: null },
      },
      {
        userId: ana.id,
        fullName: "Ana Reis",
        nickname: "Zeca",
        photoKey: null,
        accountImage: "https://exemplo.com/foto.jpg",
        isAdmin: false,
        mainBike: { model: "Scrambler 900", engineSize: 900, photoKey: null },
      },
    ]);
  });

  it("entrega a outro rider só o que o grupo vê: nome, apelido, Instagram, região, experiência, bio, aniversário, tempo de grupo, foto e motos", async () => {
    const { ana, bia } = await setup();

    await profiles.addBike(ana.id, { model: "Scrambler 400 X", engineSize: "400", year: "", color: "", nickname: "", rangeKm: "" });

    const seen = await profiles.getMemberProfile(bia.id, ana.id);

    expect(Object.keys(seen).toSorted()).toEqual([
      "accountImage",
      "bikes",
      "bio",
      "birthday",
      "experience",
      "fullName",
      "instagram",
      "isAdmin",
      "memberSince",
      "nickname",
      "photoKey",
      "region",
      "userId",
    ]);
    expect(seen).toMatchObject({ fullName: "Ana Reis", nickname: "Zeca", instagram: "ana.reis" });
    expect(seen.bikes.map((bike) => [bike.model, bike.isMain])).toEqual([
      ["Scrambler 900", true],
      ["Scrambler 400 X", false],
    ]);

    const everythingSent = JSON.stringify([seen, await profiles.listGroup(bia.id)]);

    for (const secret of ["21988887777", "Carla", "21977771234", "O+", '"M"']) {
      expect(everythingSent).not.toContain(secret);
    }
  });

  it("tira quem foi bloqueado da lista e torna o perfil não encontrado", async () => {
    const { admin, ana, bia } = await setup();
    const blocked = (await access.listParticipants(admin.id)).find(
      (person) => person.userId === ana.id,
    );

    await access.block(admin.id, blocked?.id ?? "");

    expect((await profiles.listGroup(bia.id)).map((member) => member.userId)).toEqual([
      bia.id,
      admin.id,
    ]);
    await expectProfileError(profiles.getMemberProfile(bia.id, ana.id), "NOT_FOUND");
    await expectProfileError(profiles.getMemberProfile(bia.id, "inexistente"), "NOT_FOUND");
  });

  it("não mostra a lista nem perfil a quem não está aprovado", async () => {
    const { ana } = await setup();
    const { user: pending } = await createRequester("espera@exemplo.com", "Caio Sá");

    await expectProfileError(profiles.listGroup(pending.id), "FORBIDDEN");
    await expectProfileError(profiles.getMemberProfile(pending.id, ana.id), "FORBIDDEN");
    expect((await profiles.listGroup(ana.id)).map((member) => member.fullName)).not.toContain("Caio Sá");
  });

  it("liga cada nome das listas de presença e de pedidos à pessoa", async () => {
    const { admin, ana } = await setup();
    const batch = await batches.openBatch(admin.id, {
      model: "Camiseta Mirante",
      unitPrice: "80",
      sizes: ["M"],
      colors: [{ name: "Preta", photoKey: "preta.webp" }],
    });
    const { id: rideId } = await rides.publishRide(admin.id, {
      route: "Serra de Petrópolis",
      description: "",
      meetingTime: "",
      stops: [{ kind: "MEETING", name: "Posto BR", place: "", time: "", note: "" }],
      distanceKm: "100",
      surface: "PAVED",
      difficulty: "EASY",
      rideTime: "",
      tolls: "",
      tipIds: [],
      packingNote: "",
      planB: "",
      date: "2026-11-22",
      departureTime: "07:00",
      returnTime: "16:00",
      mapUrl: "",
      photoKey: null,
    });

    await orders.saveOrder(ana.id, batch.id, [
      { colorId: batch.colors[0].id, size: "M", quantity: 1 },
    ]);
    await rides.respond(ana.id, rideId, "GOING");

    expect((await orders.listOrders(admin.id, batch.id))[0]).toMatchObject({
      userId: ana.id,
      participantName: "Zeca",
    });
    expect((await rides.getRide(admin.id, rideId)).people.going).toEqual([
      { userId: ana.id, name: "Zeca" },
    ]);
  });
});

describe("estrada com o grupo", () => {
  const beforeRide = new Date("2026-11-22T09:00:00Z");
  const afterRide = new Date("2026-11-22T12:00:00Z");
  let clock = beforeRide;
  const timedRides = createRideService(db, access, () => clock);
  const timedProfiles = createProfileService(db, access, photoStorage, () => clock);
  const serra = {
    route: "Serra de Petrópolis",
    description: "",
    meetingTime: "",
    stops: [{ kind: "MEETING", name: "Posto BR", place: "", time: "", note: "" }],
    distanceKm: "100",
    surface: "PAVED",
    difficulty: "EASY",
    rideTime: "",
    tolls: "",
    tipIds: [],
    packingNote: "",
    planB: "",
    date: "2026-11-22",
    departureTime: "07:00",
    returnTime: "16:00",
    mapUrl: "",
    photoKey: null,
  };

  it("conta o passeio feito, dá o selo e mostra a outro rider; a correção do administrador desfaz", async () => {
    clock = beforeRide;

    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");
    const bia = await createParticipant(admin.id, "bia@exemplo.com", "Bia Souza");
    const { id } = await timedRides.publishRide(admin.id, serra);

    await timedRides.respond(ana.id, id, "GOING");

    expect(await timedProfiles.getRideHistory(bia.id, ana.id)).toMatchObject({ count: 0, level: null });

    clock = afterRide;

    expect(await timedProfiles.getRideHistory(bia.id, ana.id)).toMatchObject({
      count: 1,
      level: { name: "Primeira saída", next: { name: "Pegou estrada", remaining: 4 } },
      streak: { current: 1, best: 1 },
      recent: [{ id, route: "Serra de Petrópolis" }],
    });
    expect((await timedProfiles.getRideHistory(ana.id, bia.id)).count).toBe(0);

    await timedRides.setAttendance(admin.id, id, ana.id, false);

    expect(await timedProfiles.getRideHistory(ana.id, ana.id)).toMatchObject({ count: 0, level: null, recent: [] });
  });

  it("não mostra histórico a quem não está no grupo", async () => {
    const admin = await createAdmin();
    const { user: outsider } = await createRequester("fora@exemplo.com", "Fora Dias");

    await expect(timedProfiles.getRideHistory(outsider.id, admin.id)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("ficha completa para administradores", () => {
  const filled = {
    fullName: "Ana Reis",
    nickname: "Zeca",
    instagram: "ana.reis",
    region: "",
    experience: "",
    bio: "",
    birthday: "",
    whatsapp: "(21) 98888-7777",
    shirtSize: "M",
    emergencyName: "Carla Reis",
    emergencyPhone: "(21) 97777-1234",
    bloodType: "O+",
    emergencyName2: "",
    emergencyPhone2: "",
    healthPlan: "",
    healthPlanCard: "",
    healthNotes: "",
  };

  async function setup() {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");
    const bia = await createParticipant(admin.id, "bia@exemplo.com", "Bia Luz");

    await profiles.updatePersonalData(ana.id, filled);

    return { admin, ana, bia };
  }

  it("mostra ao administrador contato, tamanho e dados de emergência", async () => {
    const { admin, ana } = await setup();

    expect(await profiles.getMemberRecord(admin.id, ana.id)).toMatchObject({
      userId: ana.id,
      fullName: "Ana Reis",
      nickname: "Zeca",
      instagram: "ana.reis",
      status: "APPROVED",
      whatsapp: "21988887777",
      shirtSize: "M",
      emergencyName: "Carla Reis",
      emergencyPhone: "21977771234",
      bloodType: "O+",
      isAdmin: false,
    });
  });

  it("traz vazio o que a pessoa não informou", async () => {
    const { admin, bia } = await setup();

    expect(await profiles.getMemberRecord(admin.id, bia.id)).toMatchObject({
      shirtSize: null,
      emergencyName: null,
      emergencyPhone: null,
      bloodType: null,
    });
  });

  it("continua abrindo a ficha de quem foi bloqueado", async () => {
    const { admin, ana, bia } = await setup();
    const request = (await access.listParticipants(admin.id)).find(
      (person) => person.userId === ana.id,
    );

    await access.block(admin.id, request?.id ?? "");

    expect(await profiles.getMemberRecord(admin.id, ana.id)).toMatchObject({
      status: "BLOCKED",
      emergencyName: "Carla Reis",
    });
    await expectProfileError(profiles.getMemberProfile(bia.id, ana.id), "NOT_FOUND");
  });

  it("recusa a ficha a quem não é administrador, inclusive a própria", async () => {
    const { admin, ana, bia } = await setup();

    await expectProfileError(profiles.getMemberRecord(bia.id, ana.id), "FORBIDDEN");
    await expectProfileError(profiles.getMemberRecord(ana.id, ana.id), "FORBIDDEN");
    await expectProfileError(profiles.getMemberRecord(admin.id, "inexistente"), "NOT_FOUND");
  });
});

describe("tamanho sugerido e lembrete de perfil", () => {
  const personal = {
    fullName: "Ana Reis",
    nickname: "",
    instagram: "",
    region: "",
    experience: "",
    bio: "",
    birthday: "",
    whatsapp: "(21) 98888-7777",
    shirtSize: "",
    emergencyName: "",
    emergencyPhone: "",
    bloodType: "",
    emergencyName2: "",
    emergencyPhone2: "",
    healthPlan: "",
    healthPlanCard: "",
    healthNotes: "",
  };

  async function setup() {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");

    return { admin, ana };
  }

  it("sugere o tamanho do perfil só quando a campanha oferece esse tamanho", () => {
    expect(suggestSize("M", ["P", "M", "G"])).toBe("M");
    expect(suggestSize("XGG", ["P", "M", "G"])).toBeNull();
    expect(suggestSize(null, ["P", "M", "G"])).toBeNull();
  });

  it("lembra de completar o perfil enquanto faltam foto e tamanho", async () => {
    const { ana } = await setup();

    expect(await profiles.shouldRemindToComplete(ana.id)).toBe(true);

    await profiles.updatePersonalData(ana.id, { ...personal, nickname: "Aninha" });

    expect(await profiles.shouldRemindToComplete(ana.id)).toBe(true);
  });

  it("para de lembrar quando a pessoa guarda o tamanho ou envia a foto", async () => {
    const { admin, ana } = await setup();

    await profiles.updatePersonalData(ana.id, { ...personal, shirtSize: "M" });
    await profiles.updatePersonalData(admin.id, { ...personal, fullName: "Chefe Lima" }, {
      kind: "replace",
      photo: { bytes: new Uint8Array(10), contentType: "image/jpeg" },
    });

    expect(await profiles.shouldRemindToComplete(ana.id)).toBe(false);
    expect(await profiles.shouldRemindToComplete(admin.id)).toBe(false);
  });

  it("guarda a dispensa: não volta a lembrar, nem se o perfil continuar vazio", async () => {
    const { admin, ana } = await setup();

    await profiles.dismissReminder(ana.id);
    await profiles.dismissReminder(ana.id);

    expect(await profiles.shouldRemindToComplete(ana.id)).toBe(false);
    expect(await profiles.shouldRemindToComplete(admin.id)).toBe(true);
  });

  it("não vale para quem não está aprovado", async () => {
    await setup();

    const { user: pending } = await createRequester("espera@exemplo.com", "Caio Sá");

    await expectProfileError(profiles.shouldRemindToComplete(pending.id), "FORBIDDEN");
    await expectProfileError(profiles.dismissReminder(pending.id), "FORBIDDEN");
  });
});
