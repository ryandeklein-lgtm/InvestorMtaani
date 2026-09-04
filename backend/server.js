const express = require("express");
const cors = require("cors");
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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Investor Mtaani API is running 🚀",
  });
});

// Current backend test
app.get("/ryan-test", (req, res) => {
  res.json({
    success: true,
    message: "This is the CURRENT backend.",
  });
});

// API Routes
app.use("/api/auth", authRoutes);

// Old startup route - keep for now
app.use("/api/startups", startupRoutes);

// Business routes
app.use("/api/businesses", businessRoutes);

// Investor routes
app.use("/api/investors", investorRoutes);

// Matchmaking routes
app.use("/api/matchmaking", matchmakingRoutes);

// Funding routes
app.use("/api/funding", fundingRoutes);

// News routes
app.use("/api/news", newsRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Database test + server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await pool.query("SELECT NOW()");

    console.log("🟢 PostgreSQL connected successfully");
    console.log(
      `🚀 Investor Mtaani Backend running on http://localhost:${PORT}`
    );
  } catch (error) {
    console.error(
      "🔴 Database connection failed:",
      error.message
    );
  }
});