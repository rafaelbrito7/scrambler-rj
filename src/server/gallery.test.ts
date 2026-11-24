import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { createAccessService } from "@/server/access";
import { createGalleryService, GalleryError, MAX_GALLERY_UPLOAD_BYTES } from "@/server/gallery";
import type { PhotoStorage, StoredPhoto } from "@/server/photo-storage";
import { createRideService, type RideInput } from "@/server/rides";
import { connectTestDatabase, resetDatabase } from "@/server/test-database";

const db = connectTestDatabase();
const access = createAccessService(db, { adminEmails: ["chefe@exemplo.com"] });
const beforeRide = new Date("2026-11-22T09:00:00Z");
const afterRide = new Date("2026-11-22T20:00:00Z");
let clock = afterRide;
const rides = createRideService(db, access, () => clock);
const stored = new Map<string, StoredPhoto>();
let counter = 0;

const storage: PhotoStorage = {
  async save(photo) {
    counter += 1;

    const key = `galeria-${counter}.jpg`;

    stored.set(key, photo);

    return key;
  },
  async read(key) {
    return stored.get(key) ?? null;
  },
  async remove(key) {
    stored.delete(key);
  },
};

// Stands in for the image library: marks the photo as shrunk and refuses a "broken" one.
async function shrink(photo: StoredPhoto): Promise<StoredPhoto> {
  if (photo.bytes[0] === 0) throw new Error("not an image");

  return { bytes: new Uint8Array([9]), contentType: "image/jpeg" };
}

const gallery = createGalleryService(db, access, rides, storage, shrink, () => clock);
const jpeg: StoredPhoto = { bytes: new Uint8Array([1, 2, 3]), contentType: "image/jpeg" };
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
  stops: [{ kind: "MEETING", name: "Posto BR", place: "", time: "", note: "" }],
};

async function createAdmin() {
  const admin = await db.user.create({ data: { email: "chefe@exemplo.com" } });

  await access.submitJoinRequest(admin.id, { ...bike, fullName: "Chefe Lima" });

  return admin;
}

async function createParticipant(adminId: string, email: string, fullName: string) {
  const user = await db.user.create({ data: { email } });
  const request = await access.submitJoinRequest(user.id, { ...bike, fullName });

  await access.decide(adminId, request.id, "approve");

  return user;
}

async function expectGalleryError(action: Promise<unknown>, code: GalleryError["code"]) {
  await expect(action).rejects.toMatchObject({ name: "GalleryError", code });
}

async function setup() {
  clock = beforeRide;

  const admin = await createAdmin();
  const ana = await createParticipant(admin.id, "ana@exemplo.com", "Ana Reis");
  const bia = await createParticipant(admin.id, "bia@exemplo.com", "Bia Souza");
  const { id } = await rides.publishRide(admin.id, serra);

  await rides.respond(ana.id, id, "GOING");
  clock = afterRide;

  return { admin, ana, bia, id };
}

beforeEach(async () => {
  await resetDatabase(db);
  stored.clear();
});

afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

describe("galeria do passeio", () => {
  it("fica fechada antes da saída e num passeio cancelado", async () => {
    const { admin, ana, id } = await setup();

    clock = beforeRide;

    expect(await gallery.getGallery(ana.id, id)).toMatchObject({ isOpen: false, canUpload: false });
    await expectGalleryError(gallery.addPhoto(ana.id, id, jpeg), "GALLERY_CLOSED");

    clock = afterRide;
    await rides.cancelRide(admin.id, id);

    expect((await gallery.getGallery(ana.id, id)).isOpen).toBe(false);
    await expectGalleryError(gallery.addPhoto(ana.id, id, jpeg), "GALLERY_CLOSED");
  });

  it("guarda a foto reduzida como pendente, vista só por quem enviou e pelo administrador", async () => {
    const { admin, ana, bia, id } = await setup();
    const { id: photoId } = await gallery.addPhoto(ana.id, id, jpeg);
    const [key] = [...stored.keys()];

    expect(stored.get(key)).toEqual({ bytes: new Uint8Array([9]), contentType: "image/jpeg" });
    expect(await gallery.getGallery(ana.id, id)).toMatchObject({
      canUpload: true,
      remaining: 9,
      approved: [],
      pending: [{ id: photoId, photoKey: key, authorId: ana.id, authorName: "Ana Reis", approved: false }],
    });
    expect((await gallery.getGallery(admin.id, id)).pending).toHaveLength(1);
    expect(await gallery.getGallery(bia.id, id)).toMatchObject({ canUpload: false, approved: [], pending: [] });
    expect(await gallery.canSeeFile(ana.id, key)).toBe(true);
    expect(await gallery.canSeeFile(admin.id, key)).toBe(true);
    expect(await gallery.canSeeFile(bia.id, key)).toBe(false);
  });

  it("mostra a foto a todo o grupo depois de aprovada", async () => {
    const { admin, ana, bia, id } = await setup();
    const { id: photoId } = await gallery.addPhoto(ana.id, id, jpeg);
    const [key] = [...stored.keys()];

    await gallery.approvePhoto(admin.id, photoId);

    expect(await gallery.getGallery(bia.id, id)).toMatchObject({
      approved: [{ id: photoId, authorName: "Ana Reis", approved: true }],
      pending: [],
    });
    expect(await gallery.canSeeFile(bia.id, key)).toBe(true);
    expect((await db.ridePhoto.findUniqueOrThrow({ where: { id: photoId } })).reviewedAt).toEqual(afterRide);
  });

  it("só deixa enviar quem fez o passeio, e o administrador", async () => {
    const { admin, bia, id } = await setup();

    await expectGalleryError(gallery.addPhoto(bia.id, id, jpeg), "DID_NOT_ATTEND");

    await rides.setAttendance(admin.id, id, bia.id, true);
    await gallery.addPhoto(bia.id, id, jpeg);
    await gallery.addPhoto(admin.id, id, jpeg);

    expect(await db.ridePhoto.count()).toBe(2);
  });

  it("recusa arquivo que não é foto, grande demais ou ilegível, sem guardar nada", async () => {
    const { ana, id } = await setup();
    const refused: StoredPhoto[] = [
      { bytes: new Uint8Array([1]), contentType: "application/pdf" },
      { bytes: new Uint8Array(MAX_GALLERY_UPLOAD_BYTES + 1).fill(1), contentType: "image/jpeg" },
      { bytes: new Uint8Array([0, 1]), contentType: "image/jpeg" },
    ];

    for (const photo of refused) await expectGalleryError(gallery.addPhoto(ana.id, id, photo), "INVALID_PHOTO");

    expect(stored.size).toBe(0);
    expect(await db.ridePhoto.count()).toBe(0);
  });

  it("para na décima foto do rider, contando pendentes, mesmo com envios simultâneos", async () => {
    const { ana, id } = await setup();

    for (let count = 0; count < 9; count += 1) await gallery.addPhoto(ana.id, id, jpeg);

    const results = await Promise.allSettled([
      gallery.addPhoto(ana.id, id, jpeg),
      gallery.addPhoto(ana.id, id, jpeg),
    ]);

    expect(results.map((result) => result.status).toSorted()).toEqual(["fulfilled", "rejected"]);
    await expectGalleryError(gallery.addPhoto(ana.id, id, jpeg), "RIDER_LIMIT");
    expect(await db.ridePhoto.count()).toBe(10);
    expect(stored.size).toBe(10);
    expect((await gallery.getGallery(ana.id, id)).remaining).toBe(0);
  });

  it("para na centésima quinquagésima foto do passeio", async () => {
    const { admin, ana, id } = await setup();

    await db.ridePhoto.createMany({
      data: Array.from({ length: 150 }, (_, index) => ({
        rideId: id,
        userId: admin.id,
        photoKey: `cheia-${index}.jpg`,
      })),
    });

    await expectGalleryError(gallery.addPhoto(ana.id, id, jpeg), "RIDE_LIMIT");
    expect(stored.size).toBe(0);
  });

  it("deixa quem enviou apagar a própria pendente, e só o administrador apagar o resto", async () => {
    const { admin, ana, bia, id } = await setup();
    const first = await gallery.addPhoto(ana.id, id, jpeg);
    const second = await gallery.addPhoto(ana.id, id, jpeg);

    await expectGalleryError(gallery.removePhoto(bia.id, first.id), "FORBIDDEN");
    await gallery.removePhoto(ana.id, first.id);

    expect(stored.size).toBe(1);

    await gallery.approvePhoto(admin.id, second.id);
    await expectGalleryError(gallery.removePhoto(ana.id, second.id), "FORBIDDEN");
    await gallery.removePhoto(admin.id, second.id);

    expect(stored.size).toBe(0);
    expect(await db.ridePhoto.count()).toBe(0);
    await expectGalleryError(gallery.removePhoto(admin.id, second.id), "NOT_FOUND");
  });

  it("conta as pendentes por passeio para o painel, e só o administrador aprova", async () => {
    const { admin, ana, id } = await setup();
    const first = await gallery.addPhoto(ana.id, id, jpeg);

    await gallery.addPhoto(ana.id, id, jpeg);

    expect(await gallery.countPendingByRide(admin.id)).toEqual(new Map([[id, 2]]));

    await expectGalleryError(gallery.approvePhoto(ana.id, first.id), "FORBIDDEN");
    await expectGalleryError(gallery.countPendingByRide(ana.id), "FORBIDDEN");
    await gallery.approvePhoto(admin.id, first.id);

    expect(await gallery.countPendingByRide(admin.id)).toEqual(new Map([[id, 1]]));
  });

  it("não mostra nada a quem não está aprovado", async () => {
    const { id } = await setup();
    const stranger = await db.user.create({ data: { email: "novo@exemplo.com" } });

    await expectGalleryError(gallery.getGallery(stranger.id, id), "FORBIDDEN");
    await expectGalleryError(gallery.addPhoto(stranger.id, id, jpeg), "FORBIDDEN");
  });
});
