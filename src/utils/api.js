import { DEFAULT_MODEL } from "../config/api.js";

const API_URL = "https://api.anthropic.com/v1/messages";

function extractAssistantText(data) {
  const blocks = data?.content;
  if (!Array.isArray(blocks)) return null;

  const text = blocks
    .filter((b) => b?.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("\n\n")
    .trim();

  return text || null;
}

function formatApiError(status, body) {
  const type = body?.error?.type;
  const raw = body?.error?.message || "";

  if (type === "authentication_error" || status === 401) {
    return "Invalid API key. Open Settings and enter a valid Anthropic API key.";
  }
  if (type === "permission_error" || status === 403) {
    return "Your API key does not have access to this model.";
  }
  if (type === "rate_limit_error" || status === 429) {
    return "Rate limit reached. Wait a moment and try again.";
  }
  if (type === "not_found_error" || /model/i.test(raw)) {
    return "The AI model is unavailable. Please update the app.";
  }
  if (raw) return raw;
  return `Request failed (${status}). Please try again.`;
}

export async function sendToAnthropic({ apiKey, system, messages, signal }) {
  if (!apiKey?.trim()) {
    throw new Error("API_KEY_MISSING");
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey.trim(),
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: 1000,
      system,
      messages,
    }),
    signal,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(formatApiError(res.status, data));
  }

  const text = extractAssistantText(data);
  if (!text) {
    throw new Error("The model returned an empty response. Please try again.");
  }

  return text;
}

export function buildWeddingContext(weddingInfo) {
  const { date, guests, budget, style } = weddingInfo;
  if (!date && !guests && !budget && !style) return "";
  return `\n\nWedding context: Date: ${date || "TBD"}, Guests: ${guests || "TBD"}, Budget: ${budget || "TBD"}, Style: ${style || "TBD"}`;
}

export function extractWeddingHints(reply, weddingInfo) {
  const updates = {};
  const dateMatch = reply.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/i
  );
  const guestMatch = reply.match(/(\d+)\s*(guests?|people|attendees)/i);
  if (dateMatch && !weddingInfo.date) updates.date = dateMatch[0];
  if (guestMatch && !weddingInfo.guests) updates.guests = guestMatch[1];
  return updates;
}
