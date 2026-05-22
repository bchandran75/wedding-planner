/**
 * Models to try in order (newest Sonnet first, then stable fallbacks).
 * See https://docs.anthropic.com/en/docs/about-claude/models/overview
 */
export const MODEL_FALLBACK_CHAIN = [
  "claude-sonnet-4-6",
  "claude-sonnet-4-5-20250929",
  "claude-sonnet-4-20250514",
  "claude-3-5-sonnet-20241022",
  "claude-haiku-4-5-20251001",
];

export const DEFAULT_MODEL = MODEL_FALLBACK_CHAIN[0];
