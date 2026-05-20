import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import postgres from "postgres";

async function main() {
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
  console.log("URL starts with:", process.env.DATABASE_URL?.slice(0, 40));

  const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

  try {
    const result = await sql`SELECT NOW()`;
    console.log("✅ Connected:", result);
  } catch (err) {
    console.error("❌ Failed:", err);
  }

  await sql.end();
  process.exit(0);
}

main();