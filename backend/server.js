const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const pool = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const startupRoutes = require("./routes/startupRoutes");
const businessRoutes = require("./routes/businessRoutes");
const investorRoutes = require("./routes/investorRoutes");
const matchmakingRoutes = require("./routes/matchmakingRoutes");
const fundingRoutes = require("./routes/fundingRoutes");
const newsRoutes = require("./routes/newsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const kycRoutes = require("./routes/kycRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const draftRoutes = require("./routes/draftRoutes");
const communityRoutes = require("./routes/communityRoutes");

// Fail early if required settings are missing
const REQUIRED_ENV = [
  "JWT_SECRET",
];

const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const databaseFields = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"];
if (!hasDatabaseUrl) {
  missingEnv.push(...databaseFields.filter((key) => !process.env[key]));
}
if (process.env.NODE_ENV === "production" && !process.env.FRONTEND_URL) {
  missingEnv.push("FRONTEND_URL");
}
if (process.env.NODE_ENV === "production" && !/^[a-f0-9]{64}$/i.test(process.env.KYC_ENCRYPTION_KEY || "")) {
  missingEnv.push("KYC_ENCRYPTION_KEY (64 hexadecimal characters)");
}
if (process.env.NODE_ENV === "production" && process.env.DB_SSL !== "true") {
  missingEnv.push("DB_SSL=true");
}
if (missingEnv.length > 0) {
  console.error(
    "🔴 Missing required environment variables:",
    missingEnv.join(", ")
  );
  process.exit(1);
}
if (
  process.env.JWT_SECRET.length < 32 ||
  process.env.JWT_SECRET.toLowerCase().includes("replace-this")
) {
  console.error("🔴 Set JWT_SECRET to a unique random value of at least 32 characters.");
  process.exit(1);
}

const app = express();
if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// CORS: only allow your frontend(s). Separate several URLs with commas.
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

if (process.env.NODE_ENV === "production") {
  const invalidOrigins = allowedOrigins.filter((origin) => {
    try {
      const parsed = new URL(origin);
      return parsed.protocol !== "https:" || parsed.origin !== origin || parsed.username || parsed.password;
    } catch {
      return true;
    }
  });
  if (invalidOrigins.length) {
    console.error("🔴 FRONTEND_URL must contain only exact HTTPS origins, separated by commas.");
    process.exit(1);
  }
  if (process.env.DB_SSL_REJECT_UNAUTHORIZED === "false") {
    console.error("🔴 Do not disable PostgreSQL certificate validation in production.");
    process.exit(1);
  }
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

// Slow down brute-force attempts on login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Investor Mtaani API is running 🚀",
  });
});
app.get("/healthz", (req, res) => {
  pool.query("SELECT 1")
    .then(() => res.status(200).json({ success: true, status: "healthy" }))
    .catch(() => res.status(503).json({ success: false, status: "unavailable" }));
});

// API Routes
app.use("/api/auth", authLimiter, authRoutes);

// Old startup route - keep for now
app.use("/api/startups", startupRoutes);

app.use("/api/businesses", businessRoutes);
app.use("/api/investors", investorRoutes);
app.use("/api/matchmaking", matchmakingRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/drafts", draftRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/funding", fundingRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;

  if (status === 500) {
    console.error("Server Error:", err);
  }

  res.status(status).json({
    success: false,
    message: status === 500 ? "Internal server error" : err.message,
  });
});

// Check the database, then start the server
const PORT = process.env.PORT || 5000;
let httpServer;

const start = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("🟢 PostgreSQL connected successfully");

    httpServer = app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `🚀 Investor Mtaani Backend running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("🔴 Database connection failed:", error.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received; closing HTTP server and database pool.`);
  try {
    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => error ? reject(error) : resolve());
      });
    }
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Error while closing database pool:", error.message);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start();
