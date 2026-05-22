import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Serverless (Vercel): each warm instance must use 1 connection max. Many
// concurrent instances × large pools exceed Neon/PgBouncer session limits (e.g. 15).
const poolSize =
  Number(process.env.DATABASE_POOL_MAX) ||
  (process.env.NODE_ENV === "production" ? 1 : 5);

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    max: poolSize,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
    allowExitOnIdle: true,
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.pool = pool;
globalForPrisma.prisma = prisma;
