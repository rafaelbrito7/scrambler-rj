import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

export type Database = PrismaClient;

export function createDatabase(connectionString: string): Database {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

const globalForDatabase = globalThis as unknown as { database?: Database };

function connect(): Database {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL não está definida.");
  }

  return createDatabase(connectionString);
}

// Reused across hot reloads so development does not exhaust connections.
export const db: Database = globalForDatabase.database ?? connect();

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.database = db;
}
