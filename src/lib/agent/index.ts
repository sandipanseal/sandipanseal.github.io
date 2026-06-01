/**
 * Unified entry point for the "Ask about Sandipan" agent.
 *
 *   askAgent(question, history) → Promise<AgentReply>
 *
 * By default it uses the built-in local engine (no key, free, private, works
 * on GitHub Pages). If a Hugging Face token is configured via env, it upgrades
 * to free-form LLM replies grounded on the profile data — and silently falls
 * back to the local engine on any error, timeout, or empty response.
 *
 * ── Optional LLM upgrade (Hugging Face) ──────────────────────────────────
 * Create a `.env.local` (NOT committed) with:
 *     VITE_HF_TOKEN=hf_xxx
 *     VITE_HF_MODEL=meta-llama/Llama-3.1-8B-Instruct   # optional, has a default
 *
 * ⚠️  SECURITY: anything starting with VITE_ is bundled into the public client
 * JS. On a static GitHub Pages deploy that token is therefore visible to
 * anyone. Only enable this for local use or when proxied behind a backend that
 * injects the token server-side. Left unset (the default), the site ships with
 * the safe, key-free local engine.
 */
import { answerLocally, type EngineResult } from "./localEngine";
import { groundingContext, firstName } from "./knowledgeBase";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type AgentReply = {
  answer: string;
  /** Which brain produced the answer — useful for a subtle UI badge. */
  source: "local" | "llm";
  suggestions: string[];
};

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN as string | undefined;
const HF_MODEL = (import.meta.env.VITE_HF_MODEL as string | undefined) || "meta-llama/Llama-3.1-8B-Instruct";
const HF_ENDPOINT = "https://router.huggingface.co/v1/chat/completions";

/**
 * SECURE PATH (recommended for the deployed site): the URL of your own proxy
 * (e.g. a Cloudflare Worker — see proxy/cloudflare-worker.js) that holds the
 * real API key server-side. When set, the browser calls the proxy with NO key,
 * so nothing secret ships in the bundle. Takes precedence over VITE_HF_TOKEN.
 */
// `|| undefined` so an unset repo variable (which Vite bakes as "") is treated
// as absent — otherwise `"" ?? HF_ENDPOINT` would keep the empty URL.
const PROXY_URL = (import.meta.env.VITE_AGENT_PROXY_URL as string | undefined) || undefined;

const SYSTEM_PROMPT =
  `You are the friendly AI assistant for ${firstName} Seal. Speak about him in the third person.\n\n` +
  `ANSWERING RULES (important):\n` +
  `1. Answer ONLY what was asked — be precise and to the point. Do NOT dump unrelated facts.\n` +
  `2. If asked about a specific thing (one company, one degree, one country, one project, one skill area), ` +
  `answer ONLY about that — including the exact specifics (role, company, location, and dates from-when-to-when where relevant).\n` +
  `3. Only list everything in a category when the question is general (e.g. "his projects", "his education").\n` +
  `4. Keep it short: usually 1–3 sentences. Use bullets only for genuine lists.\n` +
  `5. Use ONLY the facts below — never invent or guess. If a detail isn't here, say you don't have it ` +
  `and suggest contacting ${firstName} directly.\n` +
  `6. When you mention a person or item that has a link in the facts (shown as [Name](url)), keep it as ` +
  `that exact markdown link in your answer so it stays clickable.\n\n` +
  `=== FACTS ABOUT ${firstName.toUpperCase()} ===\n${groundingContext}`;

/**
 * Try the LLM (via your proxy if configured, else the HF router directly).
 * Resolves to null on any failure so the caller falls back to the local engine.
 * Both paths speak the OpenAI chat-completions shape, so the response parsing
 * is identical — only the URL and auth differ.
 */
async function tryLLM(question: string, history: ChatTurn[]): Promise<string | null> {
  if (!PROXY_URL && !HF_TOKEN) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-6), // keep the prompt small
      { role: "user", content: question },
    ];

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    // Only attach the key when calling HF directly. The proxy holds its own key.
    if (!PROXY_URL && HF_TOKEN) headers.Authorization = `Bearer ${HF_TOKEN}`;

    const res = await fetch(PROXY_URL ?? HF_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: HF_MODEL,
        messages,
        max_tokens: 320,
        temperature: 0.4,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content?.trim();
    return text && text.length > 0 ? text : null;
  } catch {
    return null; // network error, CORS, abort, rate-limit — fall back gracefully
  } finally {
    clearTimeout(timeout);
  }
}

export async function askAgent(question: string, history: ChatTurn[] = []): Promise<AgentReply> {
  // The local engine always runs — it gives us guaranteed suggestions and a
  // guaranteed answer to fall back to.
  const local: EngineResult = answerLocally(question);

  const llmText = await tryLLM(question, history);
  if (llmText) {
    return { answer: llmText, source: "llm", suggestions: local.suggestions };
  }

  return { answer: local.answer, source: "local", suggestions: local.suggestions };
}

/** Whether the optional LLM path is configured (for an optional UI hint). */
export const llmEnabled = Boolean(PROXY_URL || HF_TOKEN);
