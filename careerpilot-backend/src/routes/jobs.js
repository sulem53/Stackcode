/**
 * CareerPilot Backend — src/routes/jobs.js
 * POST /match-jobs
 *
 * Accepts a profile object, runs a Groq matching prompt over each job
 * in jobs.json, and returns results sorted by score descending.
 */

const express = require("express");
const path = require("path");
const { callGroq, parseGroqJSON } = require("../groqClient");

const router = express.Router();

// Load jobs once at module init (static data – no DB needed)
const jobs = require(path.join(__dirname, "../../data/jobs.json"));

/**
 * Build the Groq prompt for a single job match.
 */
function buildMatchPrompt(profile, job) {
  return `
You are a career-matching AI. Evaluate how well the candidate profile matches the job description.
Return ONLY valid JSON, no preamble, no markdown, no code fences.

The JSON must exactly match this schema:
{
  "jobId": "string",
  "title": "string",
  "company": "string",
  "score": number,
  "rationale": "string",
  "matchingSkills": ["string"],
  "missingSkills": ["string"]
}

Rules:
- "score" must be an integer between 0 and 100.
- "rationale" is 1-2 sentences explaining the score.
- "matchingSkills" lists skills the candidate HAS that the job requires or values.
- "missingSkills" lists skills the job requires that the candidate is missing.
- Use the jobId, title, and company exactly as provided below.

Candidate Profile:
${JSON.stringify(profile, null, 2)}

Job:
${JSON.stringify(job, null, 2)}
`.trim();
}

// POST /match-jobs
router.post("/", async (req, res) => {
  try {
    const { profile } = req.body;

    if (!profile || typeof profile !== "object") {
      return res.status(400).json({ error: "Request body must include a 'profile' object." });
    }

    // Basic profile validation
    const requiredFields = ["name", "skills", "experience", "education", "totalYearsExperience"];
    for (const field of requiredFields) {
      if (!(field in profile)) {
        return res.status(400).json({ error: `Profile is missing required field: '${field}'` });
      }
    }

    // Run all job matches in parallel for speed
    const matchPromises = jobs.map(async (job) => {
      try {
        const raw = await callGroq(buildMatchPrompt(profile, job));
        const result = parseGroqJSON(raw);

        // Ensure required fields exist (defensive fallback)
        return {
          jobId: result.jobId ?? job.jobId,
          title: result.title ?? job.title,
          company: result.company ?? job.company,
          score: typeof result.score === "number" ? result.score : 0,
          rationale: result.rationale ?? "",
          matchingSkills: Array.isArray(result.matchingSkills) ? result.matchingSkills : [],
          missingSkills: Array.isArray(result.missingSkills) ? result.missingSkills : [],
          // Extra job metadata for frontend convenience
          location: job.location,
          salary: job.salary,
          type: job.type,
          domain: job.domain,
        };
      } catch (err) {
        console.error(`[/match-jobs] Failed to match job ${job.jobId}:`, err.message);
        // Return a graceful failure entry rather than crashing the whole response
        return {
          jobId: job.jobId,
          title: job.title,
          company: job.company,
          score: 0,
          rationale: "Match could not be evaluated.",
          matchingSkills: [],
          missingSkills: [],
          location: job.location,
          salary: job.salary,
          type: job.type,
          domain: job.domain,
          error: err.message,
        };
      }
    });

    const results = await Promise.all(matchPromises);

    // Sort descending by score
    results.sort((a, b) => b.score - a.score);

    return res.status(200).json({
      success: true,
      totalJobs: results.length,
      matches: results,
    });
  } catch (err) {
    console.error("[/match-jobs] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error.", details: err.message });
  }
});

module.exports = router;
