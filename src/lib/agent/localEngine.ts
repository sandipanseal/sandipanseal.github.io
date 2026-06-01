/**
 * The built-in agent brain — a lightweight retrieval + intent engine that
 * answers questions about Sandipan with zero network calls and no API key.
 *
 * How it works:
 *   1. Normalise + tokenise the question (lowercase, strip punctuation, drop
 *      stopwords, crude stemming).
 *   2. Score every knowledge-base entry by weighted keyword/phrase overlap.
 *   3. Handle small-talk (greetings, thanks, identity) before retrieval.
 *   4. Return the best answer, or a friendly fallback with suggestions when
 *      nothing scores above a confidence threshold.
 */
import { knowledgeBase, firstName, type KBEntry } from "./knowledgeBase";

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being", "of",
  "to", "in", "on", "at", "for", "with", "and", "or", "but", "if", "then",
  "so", "do", "does", "did", "can", "could", "would", "should", "will", "shall",
  "his", "her", "him", "he", "she", "they", "them", "their", "it", "its",
  "you", "your", "i", "me", "my", "we", "us", "our", "this", "that", "these",
  "those", "what", "which", "whose", "whom", "there", "here", "about", "as",
  "from", "by", "have", "has", "had", "tell", "know", "want", "please", "give",
]);

/**
 * Crude stemmer — strips common suffixes so "projects" ≈ "project".
 * Only a single trailing "s" is removed (after the ies→y rule) so that plurals
 * like "databases"/"languages" converge with their singular forms
 * ("database"/"language") instead of over-stripping to "databas"/"languag".
 */
function stem(word: string): string {
  return word
    .replace(/('s|s')$/, "")
    .replace(/ies$/, "y")
    .replace(/(ing|ed)$/, "")
    .replace(/s$/, "")
    .trim();
}

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s']/g, " ").replace(/\s+/g, " ").trim();
}

function tokenize(text: string): string[] {
  return normalise(text)
    .split(" ")
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(stem)
    .filter(Boolean);
}

// Pre-stem each entry's keywords once at module load.
const indexed = knowledgeBase.map((entry) => ({
  entry,
  stems: new Set(entry.keywords.map(stem)),
}));

const GREETING = /\b(hi|hello|hey|yo|hiya|howdy|greetings|sup|good (morning|afternoon|evening))\b/;
const THANKS = /\b(thanks|thank you|thx|cheers|appreciate|ty)\b/;
const BOT_IDENTITY = /\b(who are you|what are you|are you (a )?(bot|ai|robot|human|real)|your name)\b/;
const HOWAREYOU = /\b(how are you|how's it going|how are things|what's up|whats up)\b/;

export type EngineResult = {
  answer: string;
  /** 0–1 — how confident the match was. Used only for telemetry/debug. */
  confidence: number;
  /** Follow-up suggestion chips to show under the answer. */
  suggestions: string[];
};

const DEFAULT_SUGGESTIONS = [
  "What does Sandipan do?",
  "Show me his projects",
  "What are his skills?",
  "What are his hobbies?",
];

function pickSuggestions(excludeTopic?: string): string[] {
  const pool = [
    "What are his hobbies?",
    "Tell me about his projects",
    "Where is he based?",
    "What's his experience?",
    "What sports does he play?",
    "Is he available to hire?",
    "What did he study?",
    "What is he passionate about?",
  ];
  // Light shuffle without Date/random: rotate by topic length for variety.
  const offset = excludeTopic ? excludeTopic.length % pool.length : 0;
  return [...pool.slice(offset), ...pool.slice(0, offset)].slice(0, 3);
}

function score(queryStems: string[], queryText: string, item: (typeof indexed)[number]): number {
  let s = 0;
  for (const qs of queryStems) {
    if (item.stems.has(qs)) s += 1;
  }
  // Phrase hits are strong signals.
  for (const phrase of item.entry.phrases ?? []) {
    if (queryText.includes(phrase)) s += 2.5;
  }
  // Normalise a little by how many query tokens matched (favours focused hits).
  return s;
}

/**
 * Answer a question using only the local knowledge base. Always returns
 * something — never throws.
 */
export function answerLocally(rawQuery: string): EngineResult {
  const queryText = normalise(rawQuery);

  if (!queryText) {
    return {
      answer: `Ask me anything about ${firstName} — his work, projects, skills, or what he's like off the clock. 🙂`,
      confidence: 1,
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }

  // ---- small talk (checked before retrieval) ----
  if (BOT_IDENTITY.test(queryText)) {
    return {
      answer:
        `I'm ${firstName}'s AI assistant — a friendly guide that knows his work, ` +
        `projects, skills, and the human side of him too. Ask me anything about ${firstName}!`,
      confidence: 1,
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }
  if (HOWAREYOU.test(queryText)) {
    return {
      answer: `Doing great, thanks for asking! 😄 I'm here to tell you all about ${firstName}. What would you like to know?`,
      confidence: 1,
      suggestions: pickSuggestions(),
    };
  }
  if (GREETING.test(queryText) && tokenize(rawQuery).length <= 3) {
    return {
      answer: `Hey there! 👋 I'm ${firstName}'s AI assistant. Ask me about his projects, skills, experience — or what he's into outside of work.`,
      confidence: 1,
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }
  if (THANKS.test(queryText)) {
    return {
      answer: `You're very welcome! 🙌 Anything else you'd like to know about ${firstName}?`,
      confidence: 1,
      suggestions: pickSuggestions(),
    };
  }

  // ---- retrieval ----
  const queryStems = tokenize(rawQuery);
  let best: { item: (typeof indexed)[number]; s: number } | null = null;

  for (const item of indexed) {
    const s = score(queryStems, queryText, item);
    if (s > 0 && (!best || s > best.s)) best = { item, s };
  }

  if (!best || best.s < 1) {
    return {
      answer:
        `Hmm, I don't have a great answer for that one. I'm best at questions about ${firstName}'s ` +
        `work, projects, skills, background, or hobbies. Try one of these:`,
      confidence: 0,
      suggestions: pickSuggestions(),
    };
  }

  const entry: KBEntry = best.item.entry;
  // Confidence is a soft ratio of matched tokens; purely informational.
  const confidence = Math.min(1, best.s / Math.max(2, queryStems.length));

  return {
    answer: entry.answer,
    confidence,
    suggestions: pickSuggestions(entry.topic),
  };
}
