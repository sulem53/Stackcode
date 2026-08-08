/**
 * CareerPilot Backend — src/routes/applications.js
 * In-memory application tracker.
 *
 * POST   /applications          — add an application
 * GET    /applications          — list all applications
 * PATCH  /applications/:id      — update application stage (accepts jobId OR UUID)
 * DELETE /applications/:id      — remove application     (accepts jobId OR UUID)
 */

const express = require("express");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Valid pipeline stages
const VALID_STAGES = ["Interested", "Applied", "Interview", "Selected", "Rejected"];

// In-memory store  { jobId -> application }
const applicationStore = new Map();

/**
 * Resolve a URL param to the Map key (jobId).
 * Accepts either the jobId string ("fe-002") or the internal UUID.
 * Returns the Map key string, or undefined if not found.
 */
function resolveKey(param) {
  // Fast path: exact jobId match
  if (applicationStore.has(param)) return param;

  // Fallback: scan for a matching internal UUID
  for (const [key, app] of applicationStore.entries()) {
    if (app.id === param) return key;
  }

  return undefined;
}

// POST /applications
router.post("/", (req, res) => {
  try {
    const { jobId, jobTitle, title, company, stage, notes } = req.body;
    const resolvedTitle = jobTitle ?? title ?? "";

    if (!jobId || typeof jobId !== "string") {
      return res.status(400).json({ error: "'jobId' is required and must be a string." });
    }

    if (applicationStore.has(jobId)) {
      return res.status(409).json({
        error: `Application for jobId '${jobId}' already exists. Use PATCH to update it.`,
      });
    }

    const resolvedStage = stage ?? "Interested";
    if (!VALID_STAGES.includes(resolvedStage)) {
      return res.status(400).json({
        error: `Invalid stage '${resolvedStage}'. Valid stages: ${VALID_STAGES.join(", ")}.`,
      });
    }

    const application = {
      id: uuidv4(),
      jobId,
      jobTitle: resolvedTitle,
      company: company ?? "",
      stage: resolvedStage,
      notes: notes ?? "",
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{ stage: resolvedStage, changedAt: new Date().toISOString() }],
    };

    applicationStore.set(jobId, application);

    return res.status(201).json({ success: true, application });
  } catch (err) {
    console.error("[POST /applications] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error.", details: err.message });
  }
});

// GET /applications
router.get("/", (_req, res) => {
  try {
    const applications = Array.from(applicationStore.values());

    // Group by stage for frontend kanban convenience
    const grouped = VALID_STAGES.reduce((acc, stage) => {
      acc[stage] = applications.filter((a) => a.stage === stage);
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      total: applications.length,
      applications,
      grouped,
    });
  } catch (err) {
    console.error("[GET /applications] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error.", details: err.message });
  }
});

// PATCH /applications/:id  (accepts jobId string OR internal UUID)
router.patch("/:id", (req, res) => {
  try {
    const key = resolveKey(req.params.id);

    if (!key) {
      return res.status(404).json({
        error: `No application found for '${req.params.id}'. Provide the jobId or the id from the create response.`,
      });
    }

    const { stage, notes } = req.body;

    if (stage !== undefined && !VALID_STAGES.includes(stage)) {
      return res.status(400).json({
        error: `Invalid stage '${stage}'. Valid stages: ${VALID_STAGES.join(", ")}.`,
      });
    }

    const application = applicationStore.get(key);
    const previousStage = application.stage;

    if (stage !== undefined) {
      application.stage = stage;
      application.history.push({ stage, changedAt: new Date().toISOString() });
    }

    if (notes !== undefined) {
      application.notes = notes;
    }

    application.updatedAt = new Date().toISOString();
    applicationStore.set(key, application);

    return res.status(200).json({
      success: true,
      previousStage,
      application,
    });
  } catch (err) {
    console.error("[PATCH /applications/:id] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error.", details: err.message });
  }
});

// DELETE /applications/:id  (accepts jobId string OR internal UUID)
router.delete("/:id", (req, res) => {
  try {
    const key = resolveKey(req.params.id);

    if (!key) {
      return res.status(404).json({
        error: `No application found for '${req.params.id}'.`,
      });
    }

    const { jobId } = applicationStore.get(key);
    applicationStore.delete(key);
    return res.status(200).json({ success: true, message: `Application for '${jobId}' deleted.` });
  } catch (err) {
    console.error("[DELETE /applications/:id] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error.", details: err.message });
  }
});

module.exports = router;
