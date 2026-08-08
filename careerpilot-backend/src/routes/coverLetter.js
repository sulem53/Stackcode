/**
 * CareerPilot Backend — src/routes/coverLetter.js
 * POST /generate-cover-letter
 *
 * Accepts { profile, jobId }, looks up the job, and returns a cover letter.
 */

const express = require("express");
const path = require("path");
const { callGroq, parseGroqJSON } = require("../groqClient");

const router = express.Router();

const jobs = require(path.join(__dirname, "../../data/jobs.json"));

/**
 * Build the Groq prompt for cover letter generation.
 */
function buildCoverLetterPrompt(profile, job) {
  return `
You are an expert career coach and professional writer.
Write a concise, compelling cover letter for the candidate applying to the given job.
Return ONLY valid JSON, no preamble, no markdown, no code fences.

The JSON must exactly match this schema:
{
  "letterText": "string"
}

Cover letter requirements:
- 3-4 short paragraphs (opening, relevant experience, skills alignment, closing).
- Professional but warm tone. No generic filler phrases like "I am writing to express my interest".
- Specifically reference the candidate's skills and experience that match this role.
- Address it generically (no "Dear [Name]" placeholder) — just start with the first paragraph.
- Keep it under 300 words.

Candidate Profile:
${JSON.stringify(profile, null, 2)}

Job to apply for:
${JSON.stringify(job, null, 2)}
`.trim();
}

// POST /generate-cover-letter
router.post("/", async (req, res) => {
  try {
    const { profile, jobId } = req.body;

    if (!profile || typeof profile !== "object") {
      return res.status(400).json({ error: "Request body must include a 'profile' object." });
    }

    if (!jobId || typeof jobId !== "string") {
      return res.status(400).json({ error: "Request body must include a 'jobId' string." });
    }

    const job = jobs.find((j) => j.jobId === jobId);
    if (!job) {
      return res.status(404).json({ error: `No job found with jobId: '${jobId}'.` });
    }

    let result;
    try {
      const raw = await callGroq(buildCoverLetterPrompt(profile, job));
      result = parseGroqJSON(raw);
    } catch (groqErr) {
      return res.status(502).json({ error: `Groq error: ${groqErr.message}` });
    }

    if (!result.letterText || typeof result.letterText !== "string") {
      return res.status(502).json({ error: "Groq returned an unexpected response structure." });
    }

    return res.status(200).json({
      success: true,
      jobId,
      jobTitle: job.title,
      company: job.company,
      letterText: result.letterText,
    });
  } catch (err) {
    console.error("[/generate-cover-letter] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error.", details: err.message });
  }
});

module.exports = router;
