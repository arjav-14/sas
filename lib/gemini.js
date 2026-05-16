import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
];

function getModelCandidates() {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  const list = fromEnv ? [fromEnv, ...DEFAULT_MODELS] : DEFAULT_MODELS;
  return [...new Set(list)];
}

function buildPrompt(content) {
  return `You are a productivity assistant. Analyze the following note content and respond with ONLY valid JSON (no markdown fences) in this exact shape:
{
  "summary": "2-3 sentence summary",
  "action_items": ["item 1", "item 2"],
  "suggested_title": "short descriptive title"
}

If there are no action items, use an empty array. Keep action items concise and actionable.

Note content:
${content || "(empty note)"}`;
}

function parseAiResponse(text) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    const parsed = JSON.parse(cleaned);
    return {
      summary: parsed.summary || "",
      action_items: Array.isArray(parsed.action_items) ? parsed.action_items : [],
      suggested_title: parsed.suggested_title || "",
    };
  } catch {
    return {
      summary: text.slice(0, 300),
      action_items: [],
      suggested_title: "Untitled Note",
    };
  }
}

function isModelUnavailable(error) {
  const msg = error?.message || "";
  return (
    error?.status === 404 ||
    msg.includes("404") ||
    msg.includes("not found") ||
    msg.includes("no longer available")
  );
}

function isQuotaError(error) {
  const msg = error?.message || "";
  return error?.status === 429 || msg.includes("429") || msg.includes("quota");
}

export async function analyzeNoteContent(content) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in .env.local");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = buildPrompt(content);
  const models = getModelCandidates();
  let lastError = null;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      console.log(`[Gemini] success with model: ${modelName}`);
      return parseAiResponse(text);
    } catch (error) {
      lastError = error;
      console.warn(`[Gemini] model ${modelName} failed:`, error.message);

      if (isQuotaError(error)) {
        throw new Error(
          "Gemini API quota exceeded. Wait a minute and try again, or enable billing in Google AI Studio."
        );
      }

      if (isModelUnavailable(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    lastError?.message ||
      "No Gemini model available. Set GEMINI_MODEL in .env.local (e.g. gemini-2.5-flash)."
  );
}
