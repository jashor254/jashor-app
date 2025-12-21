// src/lib/services/googleClient.js
import axios from "axios";

const GOOGLE_API_ENDPOINT = process.env.GOOGLE_API_ENDPOINT;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function googleGenerate(prompt, { maxTokens = 800, temperature = 0.2, system = "" } = {}) {
  if (!GOOGLE_API_ENDPOINT || !GOOGLE_API_KEY) {
    throw new Error("Google API not configured. Set GOOGLE_API_ENDPOINT and GOOGLE_API_KEY.");
  }

  const payload = {
    prompt,
    system,
    max_tokens: maxTokens,
    temperature,
  };

  try {
    const res = await axios.post(GOOGLE_API_ENDPOINT, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GOOGLE_API_KEY}`,
      },
      timeout: 30000
    });

    const d = res.data;
    if (typeof d === "string") return d;
    if (d.candidates?.[0]?.content) return d.candidates[0].content;
    if (d.candidates?.[0]?.output_text) return d.candidates[0].output_text;
    if (d.output) return d.output;
    if (d.text) return d.text;
    return JSON.stringify(d);
  } catch (err) {
    console.error("googleGenerate error", err?.response?.data || err?.message || err);
    throw err;
  }
}
