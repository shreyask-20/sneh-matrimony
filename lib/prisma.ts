import { PrismaClient, type Prisma } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool as PgPool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: PgPool | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const log: Prisma.LogLevel[] =
    process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

  if (connectionString.includes("neon.tech")) {
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({ adapter, log });
  }

  const poolSize =
    Number(process.env.DATABASE_POOL_MAX) ||
    (process.env.NODE_ENV === "production" ? 1 : 5);

  const pool =
    globalForPrisma.pgPool ??
    new PgPool({
      connectionString,
      max: poolSize,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 10000,
      allowExitOnIdle: true,
    });

  globalForPrisma.pgPool = pool;
  return new PrismaClient({ adapter: new PrismaPg(pool), log });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;
