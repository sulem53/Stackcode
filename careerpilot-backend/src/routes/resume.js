/**
 * CareerPilot Backend — src/routes/resume.js
 * POST /upload-resume
 *
 * Accepts a PDF or DOCX via multipart/form-data (field: "resume").
 * Extracts raw text, sends to Groq, returns a structured profile JSON.
 */

const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { callGroq, parseGroqJSON } = require("../groqClient");

const router = express.Router();

// Store file in memory (no temp disk files needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    // Browsers sometimes send PDFs/DOCXs as application/octet-stream.
    // Use the file extension as a secondary signal before accepting or rejecting.
    const allowedMimes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream", // browser fallback mime
    ];
    const allowedExts = /\.(pdf|docx)$/i;
    const mimeOk = allowedMimes.includes(file.mimetype);
    const extOk  = allowedExts.test(file.originalname);

    if (mimeOk && extOk) {
      cb(null, true);
    } else {
      // Pass false (not an Error) — multer skips the file and keeps the socket
      // open. The missing req.file check below returns a clean 400 JSON response.
      cb(null, false);
    }
  },
});

/**
 * Extract raw text from a file buffer based on mimetype.
 */
async function extractText(buffer, mimetype) {
  if (mimetype === "application/pdf") {
    const result = await pdfParse(buffer);
    return result.text;
  }
  // DOCX
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Build the Groq prompt for profile extraction.
 */
function buildProfilePrompt(resumeText) {
  return `
You are a resume parser. Extract structured information from the following resume text.
Return ONLY valid JSON, no preamble, no markdown, no code fences.

The JSON must exactly match this schema:
{
  "name": "string",
  "email": "string",
  "skills": ["string"],
  "experience": [
    { "role": "string", "company": "string", "years": number }
  ],
  "education": [
    { "degree": "string", "institution": "string", "year": number }
  ],
  "totalYearsExperience": number
}

Rules:
- "skills" should be a flat array of individual skill names (e.g. "React", "Python", "SQL").
- "years" in experience is the number of years in that specific role (estimate from dates if needed, use 1 if unclear).
- "totalYearsExperience" is the sum of all experience years, or best estimate from the resume.
- If a field is not present in the resume, use an empty array [] or empty string "" as appropriate.
- Do not invent information not present in the resume.

Resume text:
"""
${resumeText}
"""
`.trim();
}

// POST /upload-resume
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      // multer filtered the file out (wrong extension/mime) or none was attached
      return res.status(400).json({
        error: "No valid file received. Upload a PDF or DOCX using field name 'resume'.",
      });
    }

    // Normalise the mimetype: browsers sometimes send application/octet-stream
    // for perfectly valid PDFs/DOCXs. Use the filename extension to recover.
    const mimetype =
      req.file.mimetype === "application/octet-stream"
        ? req.file.originalname.toLowerCase().endsWith(".pdf")
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : req.file.mimetype;

    // 1. Extract raw text
    let rawText;
    try {
      rawText = await extractText(req.file.buffer, mimetype);
    } catch (extractErr) {
      return res.status(422).json({ error: `Text extraction failed: ${extractErr.message}` });
    }

    if (!rawText || rawText.trim().length < 50) {
      return res.status(422).json({ error: "Could not extract meaningful text from the file." });
    }

    // 2. Send to Groq
    let profile;
    try {
      const raw = await callGroq(buildProfilePrompt(rawText));
      profile = parseGroqJSON(raw);
    } catch (groqErr) {
      return res.status(502).json({ error: `Groq parsing failed: ${groqErr.message}` });
    }

    // 3. Return the structured profile
    return res.status(200).json({
      success: true,
      profile,
      meta: {
        filename: req.file.originalname,
        mimetype,
        charCount: rawText.length,
      },
    });
  } catch (err) {
    console.error("[/upload-resume] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error.", details: err.message });
  }
});

// Multer error handler — catches oversized files, corrupt multipart bodies, etc.
// Must be a 4-argument function to be recognised as an error handler by Express.
// eslint-disable-next-line no-unused-vars
router.use((err, _req, res, _next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File too large. Maximum size is 10 MB." });
  }
  console.error("[/upload-resume] Multer error:", err.message);
  return res.status(400).json({ error: err.message ?? "File upload error." });
});

module.exports = router;
