/**
 * CareerPilot Backend — src/routes/jobs-list.js
 * GET /jobs — returns the static jobs list (no Groq call needed).
 * Useful for the frontend to display all available jobs.
 */

const express = require("express");
const path = require("path");

const router = express.Router();
const jobs = require(path.join(__dirname, "../../data/jobs.json"));

router.get("/", (_req, res) => {
  return res.status(200).json({ success: true, total: jobs.length, jobs });
});

module.exports = router;
