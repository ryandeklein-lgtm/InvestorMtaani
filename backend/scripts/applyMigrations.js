const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const pool = require("../config/db");

async function applyMigrations() {
  const directory = path.resolve(__dirname, "../migrations");
  const files = fs.readdirSync(directory).filter((file) => file.endsWith(".sql")).sort();
  const client = await pool.connect();

  try {
    await client.query("SELECT pg_advisory_lock($1)", [73120418]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    for (const file of files) {
      const found = await client.query(
        "SELECT 1 FROM app_schema_migrations WHERE filename = $1",
        [file]
      );
      if (found.rowCount) continue;

      const sql = fs.readFileSync(path.join(directory, file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO app_schema_migrations (filename) VALUES ($1)",
          [file]
        );
        await client.query("COMMIT");
        console.log(`Applied ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock($1)", [73120418]);
    } finally {
      client.release();
    }
    await pool.end();
  }
}

applyMigrations().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
});
