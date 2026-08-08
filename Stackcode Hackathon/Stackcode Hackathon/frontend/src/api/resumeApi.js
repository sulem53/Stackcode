// src/api/resumeApi.js
// Real API layer — connects to Node/Express + Groq backend

const API_BASE = 'http://localhost:3001';

/**
 * Uploads a resume file and returns the parsed profile.
 * @param {File} file
 * @returns {Promise<Object>} profile JSON
 */
export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('resume', file);

  const res = await fetch(`${API_BASE}/upload-resume`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Resume upload failed');
  const data = await res.json();
  return data.profile;
}

/**
 * Fetches ranked job matches for a given profile.
 * @param {Object} profile
 * @returns {Promise<Array>} array of job match objects sorted by score desc
 */
export async function fetchJobMatches(profile) {
  const res = await fetch(`${API_BASE}/match-jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile }),
  });

  if (!res.ok) throw new Error('Job matching failed');
  const data = await res.json();
  return data.matches;
}

/**
 * Generates a cover letter for a specific job.
 * @param {string} jobId
 * @param {Object} profile
 * @returns {Promise<string>} cover letter text
 */
export async function generateCoverLetter(jobId, profile) {
  const res = await fetch(`${API_BASE}/generate-cover-letter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, jobId }),
  });

  if (!res.ok) throw new Error('Cover letter generation failed');
  const data = await res.json();
  return data.letterText;
}