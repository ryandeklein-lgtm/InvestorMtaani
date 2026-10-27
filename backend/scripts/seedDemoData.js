require("dotenv").config({ path: require("node:path").resolve(__dirname, "../.env") });
const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcrypt");
const pool = require("../config/db");

const DEMO_PASSWORD = "DemoOnly!2026";
const mediaDir = path.resolve(__dirname, "../demo-media");
let poolClosed = false;

async function closePool() {
  if (poolClosed) return;
  poolClosed = true;
  await pool.end();
}

const accounts = [
  { key: "kijani", role: "business", name: "Demo Business — Kijani Sun Co-op", email: "demo.business.kijani@investormtaani.test" },
  { key: "market", role: "business", name: "Demo Business — Mtaani Fresh Market", email: "demo.business.market@investormtaani.test" },
  { key: "growers", role: "business", name: "Demo Business — Green Valley Growers", email: "demo.business.growers@investormtaani.test" },
  { key: "bahari", role: "investor", name: "Demo Investor — Bahari Climate Fund", email: "demo.investor.bahari@investormtaani.test" },
  { key: "pwani", role: "investor", name: "Demo Investor — Pwani Food Ventures", email: "demo.investor.pwani@investormtaani.test" },
  { key: "rift", role: "investor", name: "Demo Investor — Rift Valley Growth Circle", email: "demo.investor.rift@investormtaani.test" },
];

const businesses = [
  { key: "kijani", business_name: "Demo Business — Kijani Sun Co-op", industry: "Clean Energy", location: "Kitui", description: "Synthetic demo profile for a community solar installation and maintenance cooperative. All figures and activities are fictional.", year_established: 2021, employees: 12, annual_revenue: 4800000, monthly_gross: 720000, monthly_net: 180000, amount_seeking: 1200000, funding_reason: "Synthetic example for testing profile discovery.", investment_structure: "Equity", use_of_funds: "Demo only — equipment and technician training.", business_stage: "Growth", registration_number: "DEMO-KE-001" },
  { key: "market", business_name: "Demo Business — Mtaani Fresh Market", industry: "Food & Agriculture", location: "Nairobi", description: "Synthetic demo profile for a neighbourhood produce aggregation and cold-chain service. All figures and activities are fictional.", year_established: 2020, employees: 18, annual_revenue: 7200000, monthly_gross: 1100000, monthly_net: 245000, amount_seeking: 1800000, funding_reason: "Synthetic example for testing profile discovery.", investment_structure: "Debt", use_of_funds: "Demo only — cold storage and delivery equipment.", business_stage: "Expansion", registration_number: "DEMO-KE-002" },
  { key: "growers", business_name: "Demo Business — Green Valley Growers", industry: "Agriculture", location: "Nakuru", description: "Synthetic demo profile for a growers group testing water-smart greenhouse farming. All figures and activities are fictional.", year_established: 2019, employees: 26, annual_revenue: 9600000, monthly_gross: 1450000, monthly_net: 310000, amount_seeking: 2500000, funding_reason: "Synthetic example for testing profile discovery.", investment_structure: "Equity", use_of_funds: "Demo only — greenhouse upgrades and farmer training.", business_stage: "Growth", registration_number: "DEMO-KE-003" },
];

const investors = [
  { key: "bahari", display_name: "Demo Investor — Bahari Climate Fund", investor_type: "Investment group (demo)", location: "Nairobi", thesis: "Synthetic investor profile focused on community energy access.", min_check_size: 500000, max_check_size: 2000000, preferred_stage: "Growth", sectors_of_interest: "Clean Energy", geographic_focus: "Kitui", preferred_structure: "Equity", investing_status: "Active (demo)", portfolio_highlights: "Fictional test profile — no real portfolio.", verification_status: "verified" },
  { key: "pwani", display_name: "Demo Investor — Pwani Food Ventures", investor_type: "Venture fund (demo)", location: "Nairobi", thesis: "Synthetic investor profile focused on food distribution and local supply chains.", min_check_size: 500000, max_check_size: 3000000, preferred_stage: "Expansion", sectors_of_interest: "Food & Agriculture", geographic_focus: "Nairobi", preferred_structure: "Debt", investing_status: "Active (demo)", portfolio_highlights: "Fictional test profile — no real portfolio.", verification_status: "verified" },
  { key: "rift", display_name: "Demo Investor — Rift Valley Growth Circle", investor_type: "Investor network (demo)", location: "Nakuru", thesis: "Synthetic investor profile focused on practical, water-smart agriculture.", min_check_size: 1000000, max_check_size: 4000000, preferred_stage: "Growth", sectors_of_interest: "Agriculture", geographic_focus: "Nakuru", preferred_structure: "Equity", investing_status: "Active (demo)", portfolio_highlights: "Fictional test profile — no real portfolio.", verification_status: "verified" },
];

const posts = [
  { business: "kijani", body: "DEMO ONLY — A fictional look at the community solar setup. Use this sample to try the photo feed and investor discovery.", file: "kijani-solar.png", mime: "image/png", likes: ["bahari", "pwani"] },
  { business: "kijani", body: "DEMO ONLY — A short, synthetic video tour of the sample solar workspace. This is not a real business or project.", file: "kijani-solar-tour.webm", mime: "video/webm", likes: ["bahari", "rift"] },
  { business: "market", body: "DEMO ONLY — Sample market scene for testing image posts, likes and business-profile links.", file: "mtaani-fresh-market.png", mime: "image/png", likes: ["pwani", "rift", "bahari"] },
  { business: "growers", body: "DEMO ONLY — Synthetic greenhouse and harvest illustration for trying agriculture discovery.", file: "green-valley-growers.png", mime: "image/png", likes: ["rift", "pwani"] },
  { business: "growers", body: "DEMO ONLY — What would you want to learn about a water-smart growing project? This fictional update is here to test the conversation feed.", file: null, mime: null, likes: ["bahari"] },
];

function assertSafeTarget() {
  if (process.env.NODE_ENV !== "development" || process.env.ALLOW_DEMO_SEED !== "YES") {
    throw new Error("Demo seeding is blocked. Set NODE_ENV=development and ALLOW_DEMO_SEED=YES for a local development database.");
  }
  let host = process.env.DB_HOST || "";
  if (process.env.DATABASE_URL) {
    try { host = new URL(process.env.DATABASE_URL).hostname; }
    catch { throw new Error("DATABASE_URL is invalid; no demo data was written."); }
  }
  if (!["localhost", "127.0.0.1", "::1"].includes(host)) {
    throw new Error("Demo seeding only runs against a local PostgreSQL host; no demo data was written.");
  }
}

async function seed() {
  assertSafeTarget();
  const requiredMedia = [...new Set(posts.map((post) => post.file).filter(Boolean))];
  for (const name of requiredMedia) {
    if (!fs.existsSync(path.join(mediaDir, name))) throw new Error(`Missing demo media: ${name}`);
  }
  const migration = await pool.query("SELECT to_regclass('public.community_posts') AS table_name");
  if (!migration.rows[0].table_name) throw new Error("Community tables are missing. Run the community-posts migration first.");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const userIds = {};

    for (const account of accounts) {
      let result = await client.query("SELECT id, name, role FROM users WHERE email = $1", [account.email]);
      if (result.rowCount) {
        const existing = result.rows[0];
        if (existing.name !== account.name || existing.role !== account.role) {
          throw new Error(`Refusing to change the existing account ${account.email}; its identity does not match the demo fixture.`);
        }
        await client.query("UPDATE users SET password = $1, status = 'active' WHERE id = $2", [passwordHash, existing.id]);
        userIds[account.key] = existing.id;
      } else {
        result = await client.query(
          `INSERT INTO users (name, email, password, role, status)
           VALUES ($1, $2, $3, $4, 'active') RETURNING id`,
          [account.name, account.email, passwordHash, account.role]
        );
        userIds[account.key] = result.rows[0].id;
      }
    }

    const businessIds = {};
    for (const business of businesses) {
      const { key, ...fields } = business;
      const columns = Object.keys(fields);
      const values = [userIds[key], ...columns.map((column) => fields[column])];
      const placeholders = values.map((_, index) => `$${index + 1}`);
      const existing = await client.query("SELECT id FROM businesses WHERE user_id = $1 ORDER BY id LIMIT 1", [userIds[key]]);
      let result;
      if (existing.rowCount) {
        const updates = columns.map((column, index) => `${column} = $${index + 1}`).join(", ");
        values.push(existing.rows[0].id);
        result = await client.query(
          `UPDATE businesses SET ${updates}, status = 'approved', verified_at = NOW()
           WHERE id = $${columns.length + 1} RETURNING id`,
          values.slice(1)
        );
      } else {
        result = await client.query(
          `INSERT INTO businesses (user_id, ${columns.join(", ")}, status, verified_at)
           VALUES (${placeholders.join(", ")}, 'approved', NOW()) RETURNING id`,
          values
        );
      }
      businessIds[key] = result.rows[0].id;
    }

    const sectorType = await client.query(
      `SELECT data_type FROM information_schema.columns
       WHERE table_schema = current_schema() AND table_name = 'investors' AND column_name = 'sectors_of_interest'`
    );
    const sectorsAreArray = sectorType.rows[0]?.data_type === "ARRAY";
    for (const investor of investors) {
      const { key, ...fields } = investor;
      if (sectorsAreArray && typeof fields.sectors_of_interest === "string") {
        fields.sectors_of_interest = fields.sectors_of_interest.split(",").map((item) => item.trim());
      }
      const columns = Object.keys(fields);
      const values = [userIds[key], ...columns.map((column) => fields[column])];
      const placeholders = values.map((_, index) => `$${index + 1}`);
      const updates = columns.map((column) => `${column} = EXCLUDED.${column}`).join(", ");
      const sql = `INSERT INTO investors (user_id, ${columns.join(", ")})
                   VALUES (${placeholders.join(", ")})
                   ON CONFLICT (user_id) DO UPDATE SET ${updates}, updated_at = NOW()
                   RETURNING id`;
      await client.query(sql, values);
    }

    for (const post of posts) {
      const media = post.file ? fs.readFileSync(path.join(mediaDir, post.file)) : null;
      await client.query("DELETE FROM community_posts WHERE business_id = $1 AND body = $2", [businessIds[post.business], post.body]);
      const result = await client.query(
        `INSERT INTO community_posts (business_id, author_id, body, media, media_mime, media_size)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [businessIds[post.business], userIds[post.business], post.body, media, post.mime, media?.length || null]
      );
      for (const likeKey of post.likes) {
        await client.query(
          "INSERT INTO community_post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [result.rows[0].id, userIds[likeKey]]
        );
      }
    }

    await client.query("COMMIT");
    const counts = await client.query(
      `SELECT (SELECT COUNT(*) FROM users WHERE email LIKE 'demo.%@investormtaani.test') AS demo_users,
              (SELECT COUNT(*) FROM businesses b JOIN users u ON u.id = b.user_id WHERE u.email LIKE 'demo.business.%@investormtaani.test') AS demo_businesses,
              (SELECT COUNT(*) FROM investors i JOIN users u ON u.id = i.user_id WHERE u.email LIKE 'demo.investor.%@investormtaani.test') AS demo_investors,
              (SELECT COUNT(*) FROM community_posts p JOIN businesses b ON b.id = p.business_id JOIN users u ON u.id = b.user_id WHERE u.email LIKE 'demo.business.%@investormtaani.test') AS demo_posts`
    );
    console.log(`Seeded local Investor Mtaani demo records: ${JSON.stringify(counts.rows[0])}`);
    console.log(`Demo-only shared password: ${DEMO_PASSWORD}`);
    for (const account of accounts) console.log(`${account.role}: ${account.email}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await closePool();
  }
}

seed().catch(async (error) => {
  console.error(error.message);
  await closePool();
  process.exitCode = 1;
});
