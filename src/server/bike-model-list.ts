import type { AccessService } from "@/server/access";
import { type ListedBikeModel, spellingsOf } from "@/server/bike-models";
import type { Database } from "@/server/db";

export type BikeModelInput = { name: string; engineSize: string };

export type ManagedBikeModel = ListedBikeModel & { active: boolean };

type BikeModelErrorCode = "FORBIDDEN" | "NOT_FOUND" | "INVALID_INPUT" | "DUPLICATE";

export class BikeModelError extends Error {
  readonly name = "BikeModelError";

  constructor(readonly code: BikeModelErrorCode) {
    super(code);
  }
}

export const BIKE_MODEL_NAME_MAX_LENGTH = 60;

const listed = { id: true, name: true, engineSize: true } as const;
const inListOrder = [{ position: "asc" }, { id: "asc" }] as const;

function validate(input: BikeModelInput) {
  const name = input.name.trim().replace(/\s+/g, " ");
  const engineText = input.engineSize.trim();
  const isValid =
    name.length >= 2 && name.length <= BIKE_MODEL_NAME_MAX_LENGTH && /^\d{3,4}$/.test(engineText);

  if (!isValid) throw new BikeModelError("INVALID_INPUT");

  return { name, engineSize: Number(engineText) };
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
    select: listed,
  });
}

export function createBikeModelService(db: Database, access: Pick<AccessService, "getAccess">) {
  async function assertAdmin(userId: string) {
    const viewer = await access.getAccess(userId);

    if (!viewer.isAdmin) throw new BikeModelError("FORBIDDEN");
  }

  function listOffered(keepForBikeId: string | null = null) {
    return loadOfferedBikeModels(db, keepForBikeId);
  }

  async function listAll(adminId: string): Promise<ManagedBikeModel[]> {
    await assertAdmin(adminId);

    return db.bikeModel.findMany({ orderBy: [...inListOrder], select: { ...listed, active: true } });
  }

  type Transaction = Parameters<Parameters<Database["$transaction"]>[0]>[0];

  // Serialises every change to the list, so two administrators cannot both pass the check
  // below or leave two models in the same position.
  function changingTheList<Result>(change: (tx: Transaction) => Promise<Result>) {
    return db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(7203)`;

      return change(tx);
    });
  }

  // Two models that answer to the same spelling could not be told apart when someone types
  // one, so the list never holds them, active or not.
  async function assertNotConfusable(tx: Transaction, model: { name: string; engineSize: number }, ownId?: string) {
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

  // Swaps a model with its neighbour, one place up or down.
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
