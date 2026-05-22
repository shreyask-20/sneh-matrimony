import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { neonConfig } from "@neondatabase/serverless";
import { Pool } from "pg";
import ws from "ws";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const log =
    process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

  // Neon on Vercel: use the serverless driver (WebSocket) instead of pg Pool.
  // pg Pool + session-mode pooler causes EMAXCONNSESSION / connect timeouts.
  if (connectionString.includes("neon.tech")) {
    neonConfig.webSocketConstructor = ws;
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({ adapter, log });
  }

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

  globalForPrisma.pool = pool;
  return new PrismaClient({ adapter: new PrismaPg(pool), log });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;
