/**
 * CareerPilot Backend — server.js
 *
 * AI Career Search & Application Agent API
 * Built with Node.js, Express, Groq API (llama-3.3-70b-versatile)
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Route modules
const resumeRouter = require("./src/routes/resume");
const jobsRouter = require("./src/routes/jobs");
const jobsListRouter = require("./src/routes/jobsList");
const coverLetterRouter = require("./src/routes/coverLetter");
const applicationsRouter = require("./src/routes/applications");

// ─── Startup guard ────────────────────────────────────────────────────────────
if (!process.env.GROQ_API_KEY) {
  console.error("❌  GROQ_API_KEY is not set. Create a .env file with your key.");
  process.exit(1);
}

// ─── App setup ────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT ?? 3001;

// CORS — allow the React frontend on localhost:5173 (Vite default)
const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,          // allow cookies / auth headers if frontend ever needs them
  preflightContinue: false,   // let cors() handle OPTIONS itself — don't pass to next()
  optionsSuccessStatus: 204,  // 204 is spec-correct for preflight; IE11 needs 200 but we don't care
};
app.use(cors(corsOptions));
// app.use(cors) above already intercepts OPTIONS preflights for every path
// because preflightContinue:false makes the cors middleware respond immediately.

// Body parsers
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Request logger (dev) ─────────────────────────────────────────────────────
app.use((req, _res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.originalUrl}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "CareerPilot API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Core API endpoints
app.use("/upload-resume", resumeRouter);
app.use("/match-jobs", jobsRouter);
app.use("/generate-cover-letter", coverLetterRouter);
app.use("/applications", applicationsRouter);
app.use("/jobs", jobsListRouter);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found.",
    path: req.originalUrl,
    availableRoutes: [
      "GET  /health",
      "GET  /jobs",
      "POST /upload-resume",
      "POST /match-jobs",
      "POST /generate-cover-letter",
      "GET  /applications",
      "POST /applications",
      "PATCH /applications/:jobId",
      "DELETE /applications/:jobId",
    ],
  });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[Global Error Handler]", err);
  res.status(err.status ?? 500).json({
    error: err.message ?? "An unexpected error occurred.",
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("");
  console.log("╔══════════════════════════════════════════╗");
  console.log("║       🚀  CareerPilot API  v1.0.0        ║");
  console.log(`║       Listening on http://localhost:${PORT}  ║`);
  console.log("╠══════════════════════════════════════════╣");
  console.log("║  POST /upload-resume                     ║");
  console.log("║  POST /match-jobs                        ║");
  console.log("║  POST /generate-cover-letter             ║");
  console.log("║  GET  /applications                      ║");
  console.log("║  POST /applications                      ║");
  console.log("║  PATCH /applications/:jobId              ║");
  console.log("║  GET  /health                            ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log("");
});

module.exports = app;
