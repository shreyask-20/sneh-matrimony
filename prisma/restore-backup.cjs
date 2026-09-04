/**
 * Restore a single-JSON admin backup (from /api/admin/backup/export) into a database.
 *
 * Usage (ALWAYS restore to a fresh Neon branch first, never prod directly):
 *   DIRECT_URL="postgresql://..." node prisma/restore-backup.cjs ./sneh-backup-2026-09-04.json
 *
 * Strategy: upserts in FK-safe order (users first, then dependents).
 * Password hashes are restored as-is so logins keep working.
 */
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool: PgPool } = require("pg");

function createClient(connectionString) {
  if (connectionString.includes("neon.tech")) {
    return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
  }
  const pool = new PgPool({ connectionString, ssl: { rejectUnauthorized: false } });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

async function main() {
  const file = process.argv[2];
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!file || !connectionString) {
    console.error("Usage: DIRECT_URL=... node prisma/restore-backup.cjs <backup.json>");
    process.exit(1);
  }
  const { tables, meta } = JSON.parse(fs.readFileSync(file, "utf8"));
  console.log(`Backup from ${meta?.exportedAt}, counts:`, meta?.counts);

  const prisma = createClient(connectionString);
  try {
    for (const u of tables.users || []) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: { ...u },
        create: { ...u },
      });
    }
    for (const [model, rows] of [
      ["familyDetails", tables.familyDetails],
      ["horoscope", tables.horoscopes],
      ["preferences", tables.preferences],
      ["photo", tables.photos],
      ["interest", tables.interests],
      ["conversation", tables.conversations],
      ["message", tables.messages],
      ["shortlist", tables.shortlists],
      ["block", tables.blocks],
      ["account", tables.accounts],
      ["approvalLog", tables.approvalLogs],
      ["payment", tables.payments],
      ["subscription", tables.subscriptions],
      ["verificationToken", tables.verificationTokens],
    ]) {
      for (const r of rows || []) {
        const where = r.id !== undefined ? { id: r.id } : undefined;
        if (model === "verificationToken") {
          await prisma.verificationToken.upsert({
            where: { identifier_token: { identifier: r.identifier, token: r.token } },
            update: { ...r },
            create: { ...r },
          });
        } else if (where) {
          await prisma[model].upsert({ where, update: { ...r }, create: { ...r } });
        }
      }
    }
    console.log("Restore complete.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
