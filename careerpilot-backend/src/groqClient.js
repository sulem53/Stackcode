/**
 * CareerPilot Backend — src/groqClient.js
 * Centralised Groq SDK instance + a safe JSON extraction helper.
 */

const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "llama-3.3-70b-versatile";
const TEMPERATURE = 0.3;

/**
 * Strips markdown code fences (```json … ``` or ``` … ```) from a string,
 * then attempts JSON.parse. Throws a descriptive error on failure.
 *
 * @param {string} raw - raw text from the LLM
 * @returns {any} parsed JSON value
 */
function parseGroqJSON(raw) {
  // Remove markdown fences – handles ```json, ```JSON, ``` etc.
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```[\w]*\n?/i, "").replace(/```\s*$/i, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `Groq response could not be parsed as JSON.\nCleaned text: ${cleaned.slice(0, 300)}\nOriginal error: ${err.message}`
    );
  }
}

/**
 * Calls Groq with a single user message and returns the assistant text.
 *
 * @param {string} prompt
 * @returns {Promise<string>} assistant message content
 */
async function callGroq(prompt) {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: TEMPERATURE,
    messages: [{ role: "user", content: prompt }],
  });
  return completion.choices[0]?.message?.content ?? "";
}

module.exports = { callGroq, parseGroqJSON };
