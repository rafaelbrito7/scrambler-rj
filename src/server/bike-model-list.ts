import type { Prisma } from "@/generated/prisma/client";
import { BIKE_MODEL_NAME_MAX_LENGTH, type ListedBikeModel, spellingsOf } from "@/server/bike-models";
import type { Database } from "@/server/db";

// Declared here rather than imported: the access service itself reads the list.
type Access = { getAccess(userId: string): Promise<{ isAdmin: boolean }> };

export type BikeModelInput = { name: string; engineSize: string };

export type ManagedBikeModel = ListedBikeModel & { active: boolean };

type BikeModelErrorCode = "FORBIDDEN" | "NOT_FOUND" | "INVALID_INPUT" | "DUPLICATE";

export class BikeModelError extends Error {
  readonly name = "BikeModelError";

  constructor(readonly code: BikeModelErrorCode) {
    super(code);
  }
}

// One lock for the whole list. Changing the list takes it alone; writing a bike that points
// at a model shares it, so the bike is never left with a name the model no longer has.
const LIST_LOCK = 7203;

const modelFields = { id: true, name: true, engineSize: true } as const;
const inListOrder = [{ position: "asc" }, { id: "asc" }] as const;

function validate(input: BikeModelInput) {
  const name = input.name.trim().replace(/\s+/g, " ");
  const engineText = input.engineSize.trim();
  const model = { name, engineSize: Number(engineText) };
  const isValid =
    name.length >= 2 &&
    name.length <= BIKE_MODEL_NAME_MAX_LENGTH &&
    /^\d{3,4}$/.test(engineText) &&
    spellingsOf(model).length > 0;

  if (!isValid) throw new BikeModelError("INVALID_INPUT");

  return model;
}

// What a rider may pick. Anyone signed in reads it, approved or not: the join request offers
// it. Passing a bike keeps that bike's own model on offer even after it was deactivated.
export async function loadOfferedBikeModels(
  db: Pick<Database, "bikeModel">,
  keepForBikeId: string | null = null,
): Promise<ListedBikeModel[]> {
  return db.bikeModel.findMany({
    where: keepForBikeId
      ? { OR: [{ active: true }, { bikes: { some: { id: keepForBikeId } } }] }
      : { active: true },
    orderBy: [...inListOrder],
    select: modelFields,
  });
}

// Called inside the transaction that writes a bike: the model's name and engine size as they
// are now, held still until the bike is saved. Null for a bike that is not from the list.
export async function readListedModelForWrite(tx: Prisma.TransactionClient, listedModelId: string | null) {
  if (listedModelId === null) return null;

  await tx.$executeRaw`SELECT pg_advisory_xact_lock_shared(${LIST_LOCK})`;

  const model = await tx.bikeModel.findUnique({ where: { id: listedModelId }, select: modelFields });

  return model ? { model: model.name, engineSize: model.engineSize, listedModelId: model.id } : null;
}

export function createBikeModelService(db: Database, access: Access) {
  async function assertAdmin(userId: string) {
    const viewer = await access.getAccess(userId);

    if (!viewer.isAdmin) throw new BikeModelError("FORBIDDEN");
  }

  function listOffered(keepForBikeId: string | null = null) {
    return loadOfferedBikeModels(db, keepForBikeId);
  }

  async function listAll(adminId: string): Promise<ManagedBikeModel[]> {
    await assertAdmin(adminId);

    return db.bikeModel.findMany({ orderBy: [...inListOrder], select: { ...modelFields, active: true } });
  }

  type Transaction = Prisma.TransactionClient;

  function changingTheList<Result>(change: (tx: Transaction) => Promise<Result>) {
    return db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${LIST_LOCK})`;

      return change(tx);
    });
  }

  // Two models that answer to the same spelling could not be told apart when someone types
  // one, so the list never holds them, active or not.
  async function assertNotConfusable(
    tx: Transaction,
    model: Pick<ListedBikeModel, "name" | "engineSize">,
    ownId?: string,
  ) {
    const others = await tx.bikeModel.findMany({
      where: ownId ? { id: { not: ownId } } : undefined,
      select: { name: true, engineSize: true },
    });
    const taken = new Set(others.flatMap(spellingsOf));

    if (spellingsOf(model).some((spelling) => taken.has(spelling))) throw new BikeModelError("DUPLICATE");
  }

  async function addModel(adminId: string, input: BikeModelInput) {
    await assertAdmin(adminId);

    const data = validate(input);

    return changingTheList(async (tx) => {
      await assertNotConfusable(tx, data);

      const last = await tx.bikeModel.aggregate({ _max: { position: true } });

      return tx.bikeModel.create({
        data: { ...data, position: (last._max.position ?? -1) + 1 },
        select: { id: true },
      });
    });
  }

  // The bikes that use the model follow it: they show the new name and the new engine size.
  async function updateModel(adminId: string, modelId: string, input: BikeModelInput) {
    await assertAdmin(adminId);

    const data = validate(input);

    await changingTheList(async (tx) => {
      const exists = (await tx.bikeModel.count({ where: { id: modelId } })) === 1;

      if (!exists) throw new BikeModelError("NOT_FOUND");

      await assertNotConfusable(tx, data, modelId);
      await tx.bikeModel.update({ where: { id: modelId }, data });
      await tx.bike.updateMany({
        where: { listedModelId: modelId },
        data: { model: data.name, engineSize: data.engineSize },
      });
    });
  }

  async function setModelActive(adminId: string, modelId: string, active: boolean) {
    await assertAdmin(adminId);

    const updated = await db.bikeModel.updateMany({ where: { id: modelId }, data: { active } });

    if (updated.count === 0) throw new BikeModelError("NOT_FOUND");
  }

  async function moveModel(adminId: string, modelId: string, direction: "up" | "down") {
    await assertAdmin(adminId);

    await changingTheList(async (tx) => {
      const models = await tx.bikeModel.findMany({ orderBy: [...inListOrder], select: { id: true } });
      const index = models.findIndex((model) => model.id === modelId);
      const target = direction === "up" ? index - 1 : index + 1;

      if (index === -1) throw new BikeModelError("NOT_FOUND");
      if (target < 0 || target >= models.length) return;

      const ordered = models.map((model) => model.id);

      [ordered[index], ordered[target]] = [ordered[target], ordered[index]];

      for (const [position, id] of ordered.entries()) {
        await tx.bikeModel.update({ where: { id }, data: { position } });
      }
    });
  }

  return { listOffered, listAll, addModel, updateModel, setModelActive, moveModel };
}

export type BikeModelService = ReturnType<typeof createBikeModelService>;
