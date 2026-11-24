import "dotenv/config";

import { INITIAL_BIKE_MODELS } from "@/server/bike-models";
import { createDatabase, type Database } from "@/server/db";

export function connectTestDatabase(): Database {
  const testUrl = process.env.DATABASE_URL_TEST;

  if (!testUrl) throw new Error("DATABASE_URL_TEST não está definida.");

  return createDatabase(testUrl);
}

export async function resetDatabase(db: Database) {
  await db.profile.deleteMany();
  await db.bike.deleteMany();
  await db.recipe.deleteMany();
  await db.ride.deleteMany();
  await db.rideTip.deleteMany();
  await db.order.deleteMany();
  await db.batch.deleteMany();
  await db.accessDecision.deleteMany();
  await db.joinRequest.deleteMany();
  await db.user.deleteMany();
  // Back to the list the platform starts with, as the migration writes it.
  await db.bikeModel.deleteMany();
  await db.bikeModel.createMany({
    data: INITIAL_BIKE_MODELS.map((model, position) => ({ ...model, position })),
  });
}
