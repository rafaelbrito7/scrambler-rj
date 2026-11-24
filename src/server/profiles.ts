import type { Prisma } from "@/generated/prisma/client";
import type { AccessService } from "@/server/access";
import {
  MAX_MODS_PER_BIKE,
  MOD_CATEGORIES,
  MOD_DESCRIPTION_MAX_LENGTH,
  type ListedBikeModel,
  type ModItem,
  resolveBike,
} from "@/server/bike-models";
import { loadOfferedBikeModels, readListedModelForWrite } from "@/server/bike-model-list";
import type { Database } from "@/server/db";
import { groupName } from "@/server/display-name";
import {
  isAcceptedPhotoType,
  MAX_PHOTO_BYTES,
  type PhotoStorage,
  type StoredPhoto,
} from "@/server/photo-storage";
import { HEALTH_NOTES_MAX_LENGTH } from "@/server/health-limits";
import {
  BIO_MAX_LENGTH,
  type Birthday,
  currentMonth,
  EXPERIENCE_LEVELS,
  parseBirthday,
  REGIONS,
} from "@/server/profile-options";
import { levelFor, monthOf, type RideLevel, streaksFor } from "@/server/ride-history";
import { BLOOD_TYPES, GARMENT_SIZES } from "@/server/sizes";

type ProfileErrorCode =
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_INPUT"
  | "BIKE_LIMIT"
  | "MOD_LIMIT"
  | "LAST_BIKE";

export type BikeInput = {
  model: string;
  engineSize: string;
  year: string;
  color: string;
  nickname: string;
  rangeKm: string;
};

export type BikeField = keyof BikeInput;

export const MAX_BIKES = 5;

export type PersonalDataInput = {
  fullName: string;
  nickname: string;
  instagram: string;
  region: string;
  experience: string;
  bio: string;
  birthday: string;
  whatsapp: string;
  shirtSize: string;
  emergencyName: string;
  emergencyPhone: string;
  bloodType: string;
  emergencyName2: string;
  emergencyPhone2: string;
  healthPlan: string;
  healthPlanCard: string;
  healthNotes: string;
};

export type PersonalDataField = keyof PersonalDataInput;

// What to do with the profile photo when saving: leave it, take it away or put a new one.
export type PhotoChange =
  | { kind: "keep" }
  | { kind: "remove" }
  | { kind: "replace"; photo: StoredPhoto };

export type ModInput = { category: string; description: string };

export type ProfileFieldErrors = Partial<
  Record<PersonalDataField | BikeField | keyof ModInput | "photo", string>
>;

export class ProfileError extends Error {
  readonly name = "ProfileError";

  constructor(
    readonly code: ProfileErrorCode,
    readonly fieldErrors: ProfileFieldErrors = {},
  ) {
    super(code);
  }
}

// Accepts "usuario", "@usuario" or a pasted profile address and keeps only the username.
// Returns null when the text cannot be an Instagram username.
export function normalizeInstagram(text: string): string | null {
  const trimmed = text.trim();
  const fromAddress = /instagram\.com\/([^/?#\s]+)/i.exec(trimmed);
  const username = (fromAddress ? fromAddress[1] : trimmed).replace(/^@/, "");

  return /^[a-zA-Z0-9._]{1,30}$/.test(username) ? username.toLowerCase() : null;
}

function validatePersonalData(input: PersonalDataInput, photoChange: PhotoChange) {
  const fieldErrors: ProfileFieldErrors = {};
  const isRejectedPhoto =
    photoChange.kind === "replace" &&
    (!isAcceptedPhotoType(photoChange.photo.contentType) ||
      photoChange.photo.bytes.byteLength > MAX_PHOTO_BYTES);

  if (isRejectedPhoto) fieldErrors.photo = "Use uma foto JPG, PNG ou WebP de até 5 MB.";

  const fullName = input.fullName.trim();
  const nickname = input.nickname.trim();
  const whatsapp = input.whatsapp.replace(/\D/g, "");
  const instagramText = input.instagram.trim();
  const instagram = instagramText ? normalizeInstagram(instagramText) : null;
  const shirtSize = input.shirtSize.trim();

  if (fullName.length < 2) fieldErrors.fullName = "Informe seu nome.";
  if (fullName.length > 80) fieldErrors.fullName = "Use no máximo 80 caracteres.";
  if (nickname.length > 30) fieldErrors.nickname = "Use no máximo 30 caracteres.";

  if (whatsapp.length < 10 || whatsapp.length > 13) {
    fieldErrors.whatsapp = "Informe o WhatsApp com DDD, por exemplo (21) 98888-7777.";
  }

  if (instagramText && !instagram) {
    fieldErrors.instagram = "Digite só o usuário, por exemplo @scramblerrj, ou cole o link do perfil.";
  }

  const region = input.region.trim();
  const experience = input.experience.trim();
  const bio = input.bio.trim();

  if (region && !REGIONS.some((option) => option.value === region)) {
    fieldErrors.region = "Escolha uma das regiões da lista.";
  }

  if (experience && !EXPERIENCE_LEVELS.some((option) => option.value === experience)) {
    fieldErrors.experience = "Escolha um dos níveis da lista.";
  }

  if (bio.length > BIO_MAX_LENGTH) fieldErrors.bio = `Use no máximo ${BIO_MAX_LENGTH} caracteres.`;
  if (/[\r\n]/.test(bio)) fieldErrors.bio = "Escreva em uma linha só.";

  const birthdayText = input.birthday.trim();
  const birthday = birthdayText ? parseBirthday(birthdayText) : null;

  if (birthdayText && !birthday) {
    fieldErrors.birthday = "Informe dia e mês, por exemplo 12/08.";
  }

  if (shirtSize && !GARMENT_SIZES.includes(shirtSize)) {
    fieldErrors.shirtSize = "Escolha um dos tamanhos da lista.";
  }

  // Emergency data is optional, but a contact is only useful with both a name and a number.
  const emergencyName = input.emergencyName.trim();
  const emergencyPhone = input.emergencyPhone.replace(/\D/g, "");
  const bloodType = input.bloodType.trim();
  const hasContactName = emergencyName.length > 0;
  const hasContactPhone = input.emergencyPhone.trim().length > 0;

  if (hasContactPhone && !hasContactName) {
    fieldErrors.emergencyName = "Informe o nome de quem atende esse telefone.";
  }

  if (emergencyName.length > 80) fieldErrors.emergencyName = "Use no máximo 80 caracteres.";

  if (hasContactName && !hasContactPhone) {
    fieldErrors.emergencyPhone = "Informe o telefone do contato, com DDD.";
  } else if (hasContactPhone && (emergencyPhone.length < 10 || emergencyPhone.length > 13)) {
    fieldErrors.emergencyPhone = "Informe o telefone com DDD, por exemplo (21) 98888-7777.";
  }

  if (bloodType && !BLOOD_TYPES.includes(bloodType)) {
    fieldErrors.bloodType = "Escolha um dos tipos da lista.";
  }

  // A second contact follows the first one's rules and only makes sense when there is a first.
  const emergencyName2 = input.emergencyName2.trim();
  const emergencyPhone2 = input.emergencyPhone2.replace(/\D/g, "");
  const hasSecondName = emergencyName2.length > 0;
  const hasSecondPhone = input.emergencyPhone2.trim().length > 0;
  const hasFirstContact = hasContactName && hasContactPhone;

  if (hasSecondPhone && !hasSecondName) {
    fieldErrors.emergencyName2 = "Informe o nome de quem atende esse telefone.";
  }

  if (emergencyName2.length > 80) fieldErrors.emergencyName2 = "Use no máximo 80 caracteres.";

  if (hasSecondName && !hasSecondPhone) {
    fieldErrors.emergencyPhone2 = "Informe o telefone do contato, com DDD.";
  } else if (hasSecondPhone && (emergencyPhone2.length < 10 || emergencyPhone2.length > 13)) {
    fieldErrors.emergencyPhone2 = "Informe o telefone com DDD, por exemplo (21) 98888-7777.";
  }

  if ((hasSecondName || hasSecondPhone) && !hasFirstContact) {
    fieldErrors.emergencyName2 ??= "Preencha antes o primeiro contato.";
  }

  const healthPlan = input.healthPlan.trim();
  const healthPlanCard = input.healthPlanCard.trim();
  const healthNotes = input.healthNotes.trim();

  if (healthPlan.length > 60) fieldErrors.healthPlan = "Use no máximo 60 caracteres.";
  if (healthPlanCard.length > 40) fieldErrors.healthPlanCard = "Use no máximo 40 caracteres.";

  if (healthPlanCard && !healthPlan) {
    fieldErrors.healthPlan = "Informe o nome do plano dessa carteirinha.";
  }

  if (healthNotes.length > HEALTH_NOTES_MAX_LENGTH) {
    fieldErrors.healthNotes = `Use no máximo ${HEALTH_NOTES_MAX_LENGTH} caracteres.`;
  }

  if (Object.keys(fieldErrors).length > 0) throw new ProfileError("INVALID_INPUT", fieldErrors);

  return {
    fullName,
    nickname: nickname || null,
    instagram,
    region: region || null,
    experience: experience || null,
    bio: bio || null,
    birthDay: birthday?.day ?? null,
    birthMonth: birthday?.month ?? null,
    whatsapp,
    shirtSize: shirtSize || null,
    emergencyName: emergencyName || null,
    emergencyPhone: emergencyPhone || null,
    bloodType: bloodType || null,
    emergencyName2: emergencyName2 || null,
    emergencyPhone2: emergencyPhone2 || null,
    healthPlan: healthPlan || null,
    healthPlanCard: healthPlanCard || null,
    healthNotes: healthNotes || null,
  };
}

export type BikeSummary = {
  id: string;
  model: string;
  engineSize: number;
  year: number | null;
  color: string | null;
  nickname: string | null;
  rangeKm: number | null;
  photoKey: string | null;
  mods: ModItem[];
  isMain: boolean;
};

// What a person sees of their own profile: everything.
export type OwnProfile = {
  userId: string;
  fullName: string;
  nickname: string | null;
  instagram: string | null;
  region: string | null;
  experience: string | null;
  bio: string | null;
  birthday: Birthday | null;
  memberSince: Date;
  whatsapp: string;
  photoKey: string | null;
  accountImage: string | null;
  shirtSize: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  bloodType: string | null;
  emergencyName2: string | null;
  emergencyPhone2: string | null;
  healthPlan: string | null;
  healthPlanCard: string | null;
  healthNotes: string | null;
  isAdmin: boolean;
  bikes: BikeSummary[];
};

// What one participant may see of another: who they are and what they ride. Phone, size and
// emergency data are not part of this shape at all, so they cannot leak through it.
export type MemberProfile = {
  userId: string;
  fullName: string;
  nickname: string | null;
  instagram: string | null;
  region: string | null;
  experience: string | null;
  bio: string | null;
  birthday: Birthday | null;
  memberSince: Date;
  photoKey: string | null;
  accountImage: string | null;
  isAdmin: boolean;
  bikes: BikeSummary[];
};

// The full record, for administrators only: what the group sees plus how to reach the person
// and whom to call if something goes wrong.
export type MemberRecord = MemberProfile & {
  status: "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED";
  whatsapp: string;
  shirtSize: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  bloodType: string | null;
  emergencyName2: string | null;
  emergencyPhone2: string | null;
  healthPlan: string | null;
  healthPlanCard: string | null;
  healthNotes: string | null;
};

// A person's road with the group, seen by every rider: it only gathers what each ride's page
// already shows.
export type RideHistory = {
  count: number;
  level: RideLevel | null;
  streak: { current: number; best: number };
  recent: { id: string; route: string; startsAt: Date }[];
  // The latest photos this person published in ride galleries.
  photos: { id: string; photoKey: string; rideId: string; route: string }[];
};

const RECENT_RIDES = 5;
const HISTORY_PHOTOS = 12;

export type BirthdayPerson = Pick<
  MemberProfile,
  "userId" | "fullName" | "nickname" | "photoKey" | "accountImage"
> & { day: number };

export type GroupMember = Pick<
  MemberProfile,
  "userId" | "fullName" | "nickname" | "photoKey" | "accountImage" | "isAdmin"
> & {
  mainBike: { model: string; engineSize: number; photoKey: string | null };
};

function validateBike(input: BikeInput, photoChange: PhotoChange, models: ListedBikeModel[]) {
  const fieldErrors: ProfileFieldErrors = {};
  const isRejectedPhoto =
    photoChange.kind === "replace" &&
    (!isAcceptedPhotoType(photoChange.photo.contentType) ||
      photoChange.photo.bytes.byteLength > MAX_PHOTO_BYTES);

  if (isRejectedPhoto) fieldErrors.photo = "Use uma foto JPG, PNG ou WebP de até 5 MB.";

  const nickname = input.nickname.trim();
  const rangeText = input.rangeKm.trim();
  const rangeKm = rangeText ? Number(rangeText) : null;
  const isPlausibleRange =
    rangeKm === null || (/^\d{2,4}$/.test(rangeText) && rangeKm >= 50 && rangeKm <= 1000);

  if (nickname.length > 40) fieldErrors.nickname = "Use no máximo 40 caracteres.";

  if (!isPlausibleRange) {
    fieldErrors.rangeKm = "Informe os quilômetros com um tanque, entre 50 e 1000.";
  }

  const { model, engineSize, listedModelId } = resolveBike(models, input.model, input.engineSize);
  const yearText = input.year.trim();
  const color = input.color.trim();
  const year = yearText ? Number(yearText) : null;
  const latestYear = new Date().getFullYear() + 1;

  if (model.length < 2) fieldErrors.model = "Informe o modelo da moto.";
  if (model.length > 60) fieldErrors.model = "Use no máximo 60 caracteres.";

  if (!/^\d{3,4}$/.test(engineSize)) {
    fieldErrors.engineSize = "Informe a cilindrada em números, por exemplo 900.";
  }

  const isPlausibleYear =
    year === null || (/^\d{4}$/.test(yearText) && year >= 1950 && year <= latestYear);

  if (!isPlausibleYear) fieldErrors.year = `Informe o ano com quatro números, até ${latestYear}.`;
  if (color.length > 30) fieldErrors.color = "Use no máximo 30 caracteres.";

  if (Object.keys(fieldErrors).length > 0) throw new ProfileError("INVALID_INPUT", fieldErrors);

  return {
    model,
    engineSize: Number(engineSize),
    listedModelId,
    year,
    color: color || null,
    nickname: nickname || null,
    rangeKm,
  };
}

// When the person entered the group: the first approval. Blocking and unblocking later do not
// move it. Administrators named in the configuration enter without a decision, so their
// request date stands in.
const memberSinceSelect = {
  createdAt: true,
  decisions: {
    where: { kind: { in: ["APPROVED", "REVERTED"] } },
    orderBy: { createdAt: "asc" },
    take: 1,
    select: { createdAt: true },
  },
} satisfies Prisma.JoinRequestSelect;

const modsInclude = {
  mods: {
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true, category: true, description: true },
  },
} satisfies Prisma.BikeInclude;

function validateMod(input: ModInput) {
  const fieldErrors: ProfileFieldErrors = {};
  const category = input.category.trim();
  const description = input.description.trim();

  if (!MOD_CATEGORIES.some((option) => option.value === category)) {
    fieldErrors.category = "Escolha uma categoria.";
  }

  if (description.length < 2) fieldErrors.description = "Descreva o item.";

  if (description.length > MOD_DESCRIPTION_MAX_LENGTH) {
    fieldErrors.description = `Use no máximo ${MOD_DESCRIPTION_MAX_LENGTH} caracteres.`;
  }

  if (Object.keys(fieldErrors).length > 0) throw new ProfileError("INVALID_INPUT", fieldErrors);

  return { category, description };
}

function birthdayOf(profile: { birthDay: number | null; birthMonth: number | null }): Birthday | null {
  const { birthDay, birthMonth } = profile;

  return birthDay !== null && birthMonth !== null ? { day: birthDay, month: birthMonth } : null;
}

function memberSinceOf(request: { createdAt: Date; decisions: { createdAt: Date }[] }) {
  return request.decisions[0]?.createdAt ?? request.createdAt;
}

export function createProfileService(
  db: Database,
  access: Pick<AccessService, "getAccess">,
  photos: PhotoStorage,
  now: () => Date = () => new Date(),
) {
  // Nothing here is stored as a total: count, badge and streak come from the answers and the
  // administrators' corrections at every read, so fixing one attendance fixes all of them.
  async function getRideHistory(viewerId: string, memberId: string): Promise<RideHistory> {
    await assertApproved(viewerId);

    const isInGroup =
      (await db.joinRequest.count({ where: { userId: memberId, status: "APPROVED" } })) === 1;

    if (!isInGroup) {
      return { count: 0, level: null, streak: { current: 0, best: 0 }, recent: [], photos: [] };
    }

    const [done, published] = await Promise.all([
      db.ride.findMany({
        where: { status: { not: "CANCELLED" }, startsAt: { lte: now() } },
        orderBy: [{ startsAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          route: true,
          startsAt: true,
          responses: { where: { userId: memberId }, select: { answer: true } },
          attendance: { where: { userId: memberId }, select: { counts: true } },
        },
      }),
      db.ridePhoto.findMany({
        where: { userId: memberId, approved: true, ride: { status: { not: "CANCELLED" } } },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: HISTORY_PHOTOS,
        select: { id: true, photoKey: true, rideId: true, ride: { select: { route: true } } },
      }),
    ]);
    const ridden = done.filter(
      (ride) => ride.attendance[0]?.counts ?? ride.responses[0]?.answer === "GOING",
    );

    return {
      count: ridden.length,
      level: levelFor(ridden.length),
      streak: streaksFor(
        ridden.map((ride) => monthOf(ride.startsAt)),
        done.map((ride) => monthOf(ride.startsAt)),
        now(),
      ),
      recent: ridden.slice(0, RECENT_RIDES).map(({ id, route, startsAt }) => ({ id, route, startsAt })),
      photos: published.map((photo) => ({
        id: photo.id,
        photoKey: photo.photoKey,
        rideId: photo.rideId,
        route: photo.ride.route,
      })),
    };
  }

  async function getOwnProfile(userId: string): Promise<OwnProfile> {
    const viewer = await access.getAccess(userId);

    if (viewer.state !== "approved") throw new ProfileError("FORBIDDEN");

    const profile = await db.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            image: true,
            joinRequest: { select: memberSinceSelect },
            bikes: { orderBy: [{ createdAt: "asc" }, { id: "asc" }], include: modsInclude },
          },
        },
      },
    });

    if (!profile?.user.joinRequest) throw new ProfileError("NOT_FOUND");

    const bikes = profile.user.bikes.map((bike) => ({
      id: bike.id,
      model: bike.model,
      engineSize: bike.engineSize,
      year: bike.year,
      color: bike.color,
      nickname: bike.nickname,
      rangeKm: bike.rangeKm,
      photoKey: bike.photoKey,
      mods: bike.mods,
      isMain: bike.id === profile.mainBikeId,
    }));

    return {
      userId,
      fullName: profile.fullName,
      nickname: profile.nickname,
      instagram: profile.instagram,
      region: profile.region,
      experience: profile.experience,
      bio: profile.bio,
      birthday: birthdayOf(profile),
      memberSince: memberSinceOf(profile.user.joinRequest),
      whatsapp: profile.whatsapp,
      photoKey: profile.photoKey,
      accountImage: profile.user.image,
      shirtSize: profile.shirtSize,
      emergencyName: profile.emergencyName,
      emergencyPhone: profile.emergencyPhone,
      bloodType: profile.bloodType,
      emergencyName2: profile.emergencyName2,
      emergencyPhone2: profile.emergencyPhone2,
      healthPlan: profile.healthPlan,
      healthPlanCard: profile.healthPlanCard,
      healthNotes: profile.healthNotes,
      isAdmin: viewer.isAdmin,
      // The main bike leads the list wherever bikes are shown.
      bikes: bikes.toSorted((a, b) => Number(b.isMain) - Number(a.isMain)),
    };
  }

  // A person only ever edits the profile that belongs to the signed-in account. Everything is
  // checked before anything is written, so a refused field never leaves a half-saved profile.
  async function updatePersonalData(
    userId: string,
    input: PersonalDataInput,
    photoChange: PhotoChange = { kind: "keep" },
  ) {
    const viewer = await access.getAccess(userId);

    if (viewer.state !== "approved") throw new ProfileError("FORBIDDEN");

    const data = validatePersonalData(input, photoChange);
    const current = await db.profile.findUnique({ where: { userId }, select: { photoKey: true } });

    if (!current) throw new ProfileError("NOT_FOUND");

    const isChangingPhoto = photoChange.kind !== "keep";
    const newPhotoKey = photoChange.kind === "replace" ? await photos.save(photoChange.photo) : null;
    const photoKey = isChangingPhoto ? newPhotoKey : current.photoKey;

    try {
      await db.profile.update({ where: { userId }, data: { ...data, photoKey } });
    } catch (error) {
      if (newPhotoKey) await photos.remove(newPhotoKey);

      throw error;
    }

    // The old file goes only after the profile points away from it.
    const isOldPhotoUnused = isChangingPhoto && current.photoKey !== null;

    if (isOldPhotoUnused && current.photoKey) await photos.remove(current.photoKey);
  }

  async function assertApproved(userId: string) {
    const viewer = await access.getAccess(userId);

    if (viewer.state !== "approved") throw new ProfileError("FORBIDDEN");
  }

  // Everyone who is in the group right now, by the name the group uses. Blocked people are
  // left out.
  async function listGroup(viewerId: string): Promise<GroupMember[]> {
    await assertApproved(viewerId);

    const profiles = await db.profile.findMany({
      where: { user: { joinRequest: { status: "APPROVED" } } },
      select: {
        userId: true,
        fullName: true,
        nickname: true,
        photoKey: true,
        mainBike: { select: { model: true, engineSize: true, photoKey: true } },
        user: { select: { image: true, role: true } },
      },
    });

    return profiles
      .map((profile) => ({
        userId: profile.userId,
        fullName: profile.fullName,
        nickname: profile.nickname,
        photoKey: profile.photoKey,
        accountImage: profile.user.image,
        isAdmin: profile.user.role === "ADMIN",
        mainBike: profile.mainBike,
      }))
      .toSorted((a, b) => groupName(a).localeCompare(groupName(b), "pt-BR"));
  }

  // Who in the group has a birthday this month, earliest day first. Only people who chose to
  // tell their birthday, and never someone who is blocked.
  async function listBirthdays(viewerId: string, now = new Date()) {
    await assertApproved(viewerId);

    const { month, name } = currentMonth(now);
    const found = await db.profile.findMany({
      where: { birthMonth: month, user: { joinRequest: { status: "APPROVED" } } },
      select: {
        userId: true,
        fullName: true,
        nickname: true,
        photoKey: true,
        birthDay: true,
        user: { select: { image: true } },
      },
    });
    const people: BirthdayPerson[] = found
      .map((profile) => ({
        userId: profile.userId,
        fullName: profile.fullName,
        nickname: profile.nickname,
        photoKey: profile.photoKey,
        accountImage: profile.user.image,
        day: profile.birthDay ?? 0,
      }))
      .toSorted((a, b) => a.day - b.day || groupName(a).localeCompare(groupName(b), "pt-BR"));

    return { monthName: name, people };
  }

  async function getMemberProfile(viewerId: string, memberId: string): Promise<MemberProfile> {
    await assertApproved(viewerId);

    const profile = await db.profile.findFirst({
      // Someone who is not in the group right now is simply not found.
      where: { userId: memberId, user: { joinRequest: { status: "APPROVED" } } },
      select: {
        userId: true,
        fullName: true,
        nickname: true,
        instagram: true,
        region: true,
        experience: true,
        bio: true,
        birthDay: true,
        birthMonth: true,
        photoKey: true,
        mainBikeId: true,
        user: {
          select: {
            image: true,
            role: true,
            joinRequest: { select: memberSinceSelect },
            bikes: { orderBy: [{ createdAt: "asc" }, { id: "asc" }], include: modsInclude },
          },
        },
      },
    });

    if (!profile?.user.joinRequest) throw new ProfileError("NOT_FOUND");

    const bikes = profile.user.bikes.map((bike) => ({
      id: bike.id,
      model: bike.model,
      engineSize: bike.engineSize,
      year: bike.year,
      color: bike.color,
      nickname: bike.nickname,
      rangeKm: bike.rangeKm,
      photoKey: bike.photoKey,
      mods: bike.mods,
      isMain: bike.id === profile.mainBikeId,
    }));

    return {
      userId: profile.userId,
      fullName: profile.fullName,
      nickname: profile.nickname,
      instagram: profile.instagram,
      region: profile.region,
      experience: profile.experience,
      bio: profile.bio,
      birthday: birthdayOf(profile),
      memberSince: memberSinceOf(profile.user.joinRequest),
      photoKey: profile.photoKey,
      accountImage: profile.user.image,
      isAdmin: profile.user.role === "ADMIN",
      bikes: bikes.toSorted((a, b) => Number(b.isMain) - Number(a.isMain)),
    };
  }

  // Blocked people keep their record: the history was preserved and an administrator may
  // still need to reach them.
  async function getMemberRecord(adminId: string, memberId: string): Promise<MemberRecord> {
    const viewer = await access.getAccess(adminId);

    if (!viewer.isAdmin) throw new ProfileError("FORBIDDEN");

    const profile = await db.profile.findUnique({
      where: { userId: memberId },
      include: {
        user: {
          select: {
            image: true,
            role: true,
            joinRequest: { select: { status: true, ...memberSinceSelect } },
            bikes: { orderBy: [{ createdAt: "asc" }, { id: "asc" }], include: modsInclude },
          },
        },
      },
    });

    if (!profile?.user.joinRequest) throw new ProfileError("NOT_FOUND");

    const bikes = profile.user.bikes.map((bike) => ({
      id: bike.id,
      model: bike.model,
      engineSize: bike.engineSize,
      year: bike.year,
      color: bike.color,
      nickname: bike.nickname,
      rangeKm: bike.rangeKm,
      photoKey: bike.photoKey,
      mods: bike.mods,
      isMain: bike.id === profile.mainBikeId,
    }));

    return {
      userId: profile.userId,
      fullName: profile.fullName,
      nickname: profile.nickname,
      instagram: profile.instagram,
      region: profile.region,
      experience: profile.experience,
      bio: profile.bio,
      birthday: birthdayOf(profile),
      memberSince: memberSinceOf(profile.user.joinRequest),
      photoKey: profile.photoKey,
      accountImage: profile.user.image,
      isAdmin: profile.user.role === "ADMIN",
      bikes: bikes.toSorted((a, b) => Number(b.isMain) - Number(a.isMain)),
      status: profile.user.joinRequest.status,
      whatsapp: profile.whatsapp,
      shirtSize: profile.shirtSize,
      emergencyName: profile.emergencyName,
      emergencyPhone: profile.emergencyPhone,
      bloodType: profile.bloodType,
      emergencyName2: profile.emergencyName2,
      emergencyPhone2: profile.emergencyPhone2,
      healthPlan: profile.healthPlan,
      healthPlanCard: profile.healthPlanCard,
      healthNotes: profile.healthNotes,
    };
  }

  // A gentle nudge on the home screen while the profile has neither photo nor size. It goes
  // away for good once the person fills either one or says "not now".
  async function shouldRemindToComplete(userId: string) {
    await assertApproved(userId);

    const profile = await db.profile.findUnique({
      where: { userId },
      select: { photoKey: true, shirtSize: true, reminderDismissedAt: true },
    });

    if (!profile) return false;

    const isBare = profile.photoKey === null && profile.shirtSize === null;

    return isBare && profile.reminderDismissedAt === null;
  }

  async function dismissReminder(userId: string) {
    await assertApproved(userId);

    await db.profile.updateMany({
      where: { userId, reminderDismissedAt: null },
      data: { reminderDismissedAt: new Date() },
    });
  }

  // Health and contact data belong to the person: one command takes all of it away.
  async function clearEmergencyData(userId: string) {
    const viewer = await access.getAccess(userId);

    if (viewer.state !== "approved") throw new ProfileError("FORBIDDEN");

    await db.profile.updateMany({
      where: { userId },
      data: {
        emergencyName: null,
        emergencyPhone: null,
        bloodType: null,
        emergencyName2: null,
        emergencyPhone2: null,
        healthPlan: null,
        healthPlanCard: null,
        healthNotes: null,
      },
    });
  }

  type Transaction = Parameters<Parameters<Database["$transaction"]>[0]>[0];

  // Every change to someone's bikes runs one at a time behind their profile row, so the
  // limits hold when two requests arrive together.
  async function withBikes<Result>(
    userId: string,
    change: (tx: Transaction, mainBikeId: string) => Promise<Result>,
  ) {
    const viewer = await access.getAccess(userId);

    if (viewer.state !== "approved") throw new ProfileError("FORBIDDEN");

    return db.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<{ mainBikeId: string }[]>`
        SELECT "mainBikeId" FROM "Profile" WHERE "userId" = ${userId} FOR UPDATE
      `;

      if (rows.length === 0) throw new ProfileError("NOT_FOUND");

      return change(tx as Transaction, rows[0].mainBikeId);
    });
  }

  async function addBike(
    userId: string,
    input: BikeInput,
    photoChange: PhotoChange = { kind: "keep" },
  ) {
    const data = validateBike(input, photoChange, await loadOfferedBikeModels(db));
    const photoKey = photoChange.kind === "replace" ? await photos.save(photoChange.photo) : null;

    try {
      return await withBikes(userId, async (tx) => {
        const owned = await tx.bike.count({ where: { userId } });

        if (owned >= MAX_BIKES) throw new ProfileError("BIKE_LIMIT");

        const listedNow = await readListedModelForWrite(tx, data.listedModelId);

        return tx.bike.create({ data: { ...data, ...listedNow, photoKey, userId }, select: { id: true } });
      });
    } catch (error) {
      if (photoKey) await photos.remove(photoKey);

      throw error;
    }
  }

  async function updateBike(
    userId: string,
    bikeId: string,
    input: BikeInput,
    photoChange: PhotoChange = { kind: "keep" },
  ) {
    const data = validateBike(input, photoChange, await loadOfferedBikeModels(db, bikeId));
    const isChangingPhoto = photoChange.kind !== "keep";
    const newPhotoKey = photoChange.kind === "replace" ? await photos.save(photoChange.photo) : null;
    let oldPhotoKey: string | null = null;

    try {
      await withBikes(userId, async (tx) => {
        const current = await tx.bike.findFirst({
          where: { id: bikeId, userId },
          select: { photoKey: true },
        });

        if (!current) throw new ProfileError("NOT_FOUND");

        oldPhotoKey = current.photoKey;

        const photoKey = isChangingPhoto ? newPhotoKey : current.photoKey;

        const listedNow = await readListedModelForWrite(tx, data.listedModelId);

        await tx.bike.update({ where: { id: bikeId }, data: { ...data, ...listedNow, photoKey } });
      });
    } catch (error) {
      if (newPhotoKey) await photos.remove(newPhotoKey);

      throw error;
    }

    // The old file goes only after the bike points away from it.
    if (isChangingPhoto && oldPhotoKey) await photos.remove(oldPhotoKey);
  }

  async function setMainBike(userId: string, bikeId: string) {
    await withBikes(userId, async (tx) => {
      const isOwned = (await tx.bike.count({ where: { id: bikeId, userId } })) === 1;

      if (!isOwned) throw new ProfileError("NOT_FOUND");

      await tx.profile.update({ where: { userId }, data: { mainBikeId: bikeId } });
    });
  }

  // The group is of Scrambler owners, so the last bike never leaves a profile. Removing the
  // main one hands the title to the oldest bike that stays.
  async function removeBike(userId: string, bikeId: string) {
    const photoKey = await withBikes(userId, async (tx, mainBikeId) => {
      const bikes = await tx.bike.findMany({
        where: { userId },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: { id: true, photoKey: true },
      });
      const removed = bikes.find((bike) => bike.id === bikeId);

      if (!removed) throw new ProfileError("NOT_FOUND");
      if (bikes.length === 1) throw new ProfileError("LAST_BIKE");

      if (bikeId === mainBikeId) {
        const heir = bikes.find((bike) => bike.id !== bikeId);

        await tx.profile.update({ where: { userId }, data: { mainBikeId: heir?.id } });
      }

      await tx.bike.delete({ where: { id: bikeId } });

      return removed.photoKey;
    });

    if (photoKey) await photos.remove(photoKey);
  }

  // Modifications belong to a bike and only its owner changes them. The limit is checked
  // behind the same lock as the bikes, so two requests cannot both take the last slot.
  async function addBikeMod(userId: string, bikeId: string, input: ModInput) {
    const data = validateMod(input);

    return withBikes(userId, async (tx) => {
      const bike = await tx.bike.findFirst({
        where: { id: bikeId, userId },
        select: { _count: { select: { mods: true } } },
      });

      if (!bike) throw new ProfileError("NOT_FOUND");
      if (bike._count.mods >= MAX_MODS_PER_BIKE) throw new ProfileError("MOD_LIMIT");

      return tx.bikeMod.create({ data: { ...data, bikeId }, select: { id: true } });
    });
  }

  async function updateBikeMod(userId: string, modId: string, input: ModInput) {
    const data = validateMod(input);

    await withBikes(userId, async (tx) => {
      const updated = await tx.bikeMod.updateMany({ where: { id: modId, bike: { userId } }, data });

      if (updated.count === 0) throw new ProfileError("NOT_FOUND");
    });
  }

  async function removeBikeMod(userId: string, modId: string) {
    await withBikes(userId, async (tx) => {
      const removed = await tx.bikeMod.deleteMany({ where: { id: modId, bike: { userId } } });

      if (removed.count === 0) throw new ProfileError("NOT_FOUND");
    });
  }

  return {
    addBikeMod,
    updateBikeMod,
    removeBikeMod,
    getOwnProfile,
    getRideHistory,
    listGroup,
    listBirthdays,
    getMemberProfile,
    getMemberRecord,
    shouldRemindToComplete,
    dismissReminder,
    updatePersonalData,
    clearEmergencyData,
    addBike,
    updateBike,
    setMainBike,
    removeBike,
  };
}

export type ProfileService = ReturnType<typeof createProfileService>;
