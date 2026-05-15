import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Set pool size based on environment — serverless needs a smaller pool
const poolSize = process.env.NODE_ENV === "production" ? 10 : 5;
const pool = new Pool({
  connectionString,
  max: poolSize,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000, // 10s — Aiven free tier can be slow to wake
  idleTimeoutMillis: 30000,
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
