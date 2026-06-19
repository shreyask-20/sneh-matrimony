require("dotenv/config");
const { Pool } = require("pg");

const SUPABASE_URL = process.env.SUPABASE_URL;
const NEON_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL) {
  throw new Error("SUPABASE_URL is not set in .env");
}

if (!NEON_URL) {
  throw new Error("DATABASE_URL (Neon) is not set in .env");
}

const supabase = new Pool({ connectionString: SUPABASE_URL, ssl: { rejectUnauthorized: false } });
const neon = new Pool({ connectionString: NEON_URL, ssl: { rejectUnauthorized: false } });

// Transfer order respects foreign key dependencies
const TABLES_IN_ORDER = [
  "User",
  "FamilyDetails",
  "Horoscope",
  "Preferences",
  "ApprovalLog",
  "Photo",
  "Interest",
  "Conversation",
  "Message",
  "Shortlist",
  "Block",
  "Account",
  "Session",
  "VerificationToken",
  "Payment",
  "Subscription",
];

// Maps to track ID remapping for auto-increment tables
const idMaps = {};

async function fetchAll(client, table) {
  const { rows } = await client.query(`SELECT * FROM "${table}"`);
  return rows;
}

async function clearNeonTable(client, table) {
  await client.query(`DELETE FROM "${table}"`);
}

async function insertRows(client, table, rows) {
  if (rows.length === 0) return 0;

  const columns = Object.keys(rows[0]);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  const query = `INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders})`;

  let count = 0;
  for (const row of rows) {
    const values = columns.map((col) => row[col]);
    try {
      await client.query(query, values);
      count++;
    } catch (err) {
      console.error(`  Failed to insert into ${table}:`, err.message);
      console.error(`  Row:`, JSON.stringify(row).slice(0, 200));
    }
  }
  return count;
}

async function migrate() {
  console.log("=== Supabase → Neon Migration ===\n");

  try {
    await supabase.query("SELECT 1");
    console.log("✓ Connected to Supabase");
  } catch (err) {
    throw new Error(`Failed to connect to Supabase: ${err.message}`);
  }

  try {
    await neon.query("SELECT 1");
    console.log("✓ Connected to Neon\n");
  } catch (err) {
    throw new Error(`Failed to connect to Neon: ${err.message}`);
  }

  const summary = [];

  for (const table of TABLES_IN_ORDER) {
    console.log(`Migrating ${table}...`);
    const rows = await fetchAll(supabase, table);
    console.log(`  Found ${rows.length} rows in Supabase`);

    if (rows.length === 0) {
      summary.push({ table, supabase: 0, neon: 0 });
      continue;
    }

    await clearNeonTable(neon, table);
    const inserted = await insertRows(neon, table, rows);
    console.log(`  Inserted ${inserted} rows into Neon`);
    summary.push({ table, supabase: rows.length, neon: inserted });
  }

  console.log("\n=== Migration Summary ===");
  console.log("Table".padEnd(22), "Supabase".padEnd(12), "Neon".padEnd(12));
  console.log("-".repeat(46));
  for (const s of summary) {
    console.log(s.table.padEnd(22), String(s.supabase).padEnd(12), String(s.neon).padEnd(12));
  }

  await supabase.end();
  await neon.end();
  console.log("\n✓ Migration complete. Connections closed.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exitCode = 1;
});
