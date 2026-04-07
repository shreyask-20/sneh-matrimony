import "dotenv/config";
import { defineConfig } from "prisma/config";

// Keep Prisma client generation working even if DATABASE_URL is not present in
// the current shell. The runtime Prisma client still validates DATABASE_URL.
const fallbackDatabaseUrl = "postgresql://postgres:postgres@localhost:5432/postgres";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? fallbackDatabaseUrl,
  },
});
