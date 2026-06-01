/**
 * The layered "someone special" reveal — a small, deliberate piece of theatre.
 *
 * Sandipan is, officially, single. There is nonetheless someone special — but
 * that's complicated, and the bot must NEVER give it up directly. Sampurna is
 * intentionally absent from the knowledge base and the LLM grounding context,
 * so she never surfaces in a generic "family" / "personal life" answer. She is
 * revealed only by peeling back layers, and only if the visitor keeps pushing:
 *
 *   try 1  "Is he single? / someone special?"  → refrain (he's single… but)
 *   try 2  "Who? / come on"                     → refrain (it's complicated)
 *   try 3  "Tell me / who again"                → refrain (kept close to heart)
 *   try 4  "Who?!" (still pushing)              → Her name is Sampurna Kayal.
 *   any    "Who is Sampurna?" (by name)         → She is the most special person…
 *
 * The current layer is inferred from the agent's OWN previous reply, so the
 * script is deterministic and runs BEFORE the LLM and the local retrieval — it
 * can never be leaked, paraphrased, or skipped ahead.
 */
import { specialPerson, firstName } from "../../data/profile";
import type { ChatTurn } from "./index";

// Exact answer strings — also used as stage markers (we compare the previous
// assistant reply against these to know which layer we're on).
export const SPECIAL_LAYER_1 = `Officially, ${firstName} is single. 😊 Though… it's a little complicated.`;
export const SPECIAL_LAYER_2 = `It's complicated. 😅 That's honestly all I can say.`;
export const SPECIAL_LAYER_3 = `He keeps that one close to his heart. 🤫 Are you sure you want to know?`;
export const SPECIAL_NAME = `Alright, you've earned it — her name is ${specialPerson.name}. 💙`;
export const SPECIAL_WHO_IS = `She is ${specialPerson.whoSheIs}. 💙`;

const LAYERS = [SPECIAL_LAYER_1, SPECIAL_LAYER_2, SPECIAL_LAYER_3];

const norm = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9\s']/g, " ").replace(/\s+/g, " ").trim();

/** True if any whole word in `words`, or any substring in `phrases`, is present. */
function hits(text: string, tokens: Set<string>, words: string[], phrases: string[] = []): boolean {
  return words.some((w) => tokens.has(w)) || phrases.some((p) => text.includes(p));
}

// Opening probe: "is he single?", "someone special?", "girlfriend?", etc.
const SPECIAL_WORDS = ["girlfriend", "partner", "dating", "relationship", "lover", "crush", "spouse", "wife", "married", "single"];
const SPECIAL_PHRASES = ["someone special", "somebody special", "anyone special", "special someone", "special person", "special girl", "special woman", "special lady", "love life", "significant other", "seeing someone", "girl friend"];

// A short "who / who is she / what's her name" style follow-up.
const WHO_WORDS = ["who", "whom", "whos", "who's", "she", "her"];
const WHO_PHRASES = ["her name"];

// The visitor pushing for more after a deflection. Kept broad — we only test it
// when we already know we're mid-flow, so breadth can't hijack other questions.
const PUSH_WORDS = ["who", "whom", "whos", "who's", "name", "again", "tell", "please", "really", "seriously", "just", "she", "her", "someone", "special", "girlfriend", "partner", "relationship", "dating", "yes", "sure", "why"];
const PUSH_PHRASES = ["come on", "cmon", "c'mon", "go on"];

/**
 * Returns the scripted reply for the special-person flow, or null if the
 * question isn't part of it (so the normal engine handles everything else).
 */
export function answerSpecialPerson(rawQuery: string, history: ChatTurn[] = []): string | null {
  const q = norm(rawQuery);
  if (!q) return null;
  const tokens = new Set(q.split(" "));

  // Asked about her directly, by name → always say who she is.
  if (tokens.has("sampurna") || q.includes(specialPerson.name.toLowerCase())) {
    return SPECIAL_WHO_IS;
  }

  // The agent's most recent reply tells us which layer we're on. (history may
  // already include the current user turn at the tail — we skip past it.)
  const lastAssistant = [...history].reverse().find((t) => t.role === "assistant")?.content ?? "";

  // Mid-flow: if the last reply was a deflection layer and the visitor is still
  // pushing, peel back the next layer — refrain for layers 1→2→3, reveal on 4.
  const layerIdx = LAYERS.indexOf(lastAssistant);
  if (layerIdx !== -1 && hits(q, tokens, PUSH_WORDS, PUSH_PHRASES)) {
    return LAYERS[layerIdx + 1] ?? SPECIAL_NAME;
  }

  // After the name is out, "who is she?" → who she is.
  if (lastAssistant === SPECIAL_NAME && hits(q, tokens, WHO_WORDS, WHO_PHRASES)) {
    return SPECIAL_WHO_IS;
  }

  // Opening question → start the flow with the first (non-direct) layer.
  if (hits(q, tokens, SPECIAL_WORDS, SPECIAL_PHRASES)) return SPECIAL_LAYER_1;

  return null;
}
