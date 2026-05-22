const API_URL = "https://api.anthropic.com/v1/messages";

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
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system,
      messages,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "I couldn't generate a response. Please try again.";
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
