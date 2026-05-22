import { MODEL_FALLBACK_CHAIN } from "../config/api.js";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODELS_URL = "https://api.anthropic.com/v1/models";

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

function isModelError(status, body) {
  const type = body?.error?.type;
  const raw = body?.error?.message || "";
  return (
    status === 404 ||
    type === "not_found_error" ||
    type === "invalid_request_error" && /model/i.test(raw)
  );
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
  if (isModelError(status, body)) {
    return "No supported AI model is available for your API key. Check console.anthropic.com for model access.";
  }
  if (raw) return raw;
  return `Request failed (${status}). Please try again.`;
}

async function fetchAvailableModelIds(apiKey, signal) {
  try {
    const res = await fetch(`${MODELS_URL}?limit=100`, {
      headers: {
        "x-api-key": apiKey.trim(),
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const ids = (data?.data || []).map((m) => m.id).filter(Boolean);
    return ids.length ? ids : null;
  } catch {
    return null;
  }
}

function pickModelsToTry(availableIds) {
  if (!availableIds?.length) return MODEL_FALLBACK_CHAIN;

  const available = new Set(availableIds);
  const picked = MODEL_FALLBACK_CHAIN.filter((id) => available.has(id));
  if (picked.length) return picked;

  // Prefer any sonnet, then haiku, from the account's model list
  const sonnet = availableIds.find((id) => /sonnet/i.test(id));
  if (sonnet) return [sonnet, ...MODEL_FALLBACK_CHAIN];
  const haiku = availableIds.find((id) => /haiku/i.test(id));
  if (haiku) return [haiku, ...MODEL_FALLBACK_CHAIN];

  return [availableIds[0]];
}

async function requestWithModel({ apiKey, model, system, messages, signal }) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey.trim(),
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      system,
      messages,
    }),
    signal,
  });

  const data = await res.json().catch(() => ({}));
  return { res, data, model };
}

export async function sendToAnthropic({ apiKey, system, messages, signal }) {
  if (!apiKey?.trim()) {
    throw new Error("API_KEY_MISSING");
  }

  const availableIds = await fetchAvailableModelIds(apiKey, signal);
  const modelsToTry = pickModelsToTry(availableIds);

  let lastModelError = null;

  for (const model of modelsToTry) {
    const { res, data } = await requestWithModel({
      apiKey,
      model,
      system,
      messages,
      signal,
    });

    if (res.ok) {
      const text = extractAssistantText(data);
      if (!text) {
        throw new Error("The model returned an empty response. Please try again.");
      }
      return text;
    }

    if (isModelError(res.status, data)) {
      lastModelError = data;
      continue;
    }

    throw new Error(formatApiError(res.status, data));
  }

  throw new Error(
    lastModelError
      ? formatApiError(404, lastModelError)
      : "No supported AI model is available for your API key."
  );
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
