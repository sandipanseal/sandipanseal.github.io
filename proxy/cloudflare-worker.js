/**
 * Secure LLM proxy for the "Ask about Sandipan" chat — Cloudflare Worker.
 * ----------------------------------------------------------------------------
 * Why: GitHub Pages serves only static files, so any key in the site bundle is
 * public. This Worker keeps the key SERVER-SIDE. The browser calls this Worker
 * (no key), the Worker adds the key and forwards to Hugging Face or OpenAI.
 *
 * ── Deploy (free) ────────────────────────────────────────────────────────
 *   1. Install the CLI:           npm i -g wrangler
 *   2. Log in:                    wrangler login
 *   3. From this proxy/ folder:   wrangler deploy cloudflare-worker.js --name sandipan-agent
 *   4. Store your key as a secret (NOT in code):
 *        wrangler secret put LLM_API_KEY          # paste your hf_… or sk-… key
 *      Optional config (set as plain vars in the Cloudflare dashboard or wrangler):
 *        PROVIDER       = "hf" (default) | "openai"
 *        ALLOW_ORIGIN   = "https://sandipanseal.github.io"   # lock to your site
 *   5. Copy the deployed URL (e.g. https://sandipan-agent.<you>.workers.dev) into
 *      your site's build env as:  VITE_AGENT_PROXY_URL=<that url>
 *      Then rebuild/redeploy the site. Done — no key ships to the browser.
 *
 * It also serves POST /verify for the chat's private-life check (see verify()
 * below). Set its three secrets: wrangler secret put VERIFY_NAMES / VERIFY_CODES /
 * SECRET_ANSWER. Names are matched as whole lowercase words in the visitor's reply.
 *
 * The Worker accepts and returns the OpenAI chat-completions shape, which is
 * exactly what src/lib/agent/index.ts already sends and parses.
 */

const UPSTREAM = {
  hf: "https://router.huggingface.co/v1/chat/completions",
  openai: "https://api.openai.com/v1/chat/completions",
};

// Locked to the live site by default. Override with an ALLOW_ORIGIN env var
// (e.g. set it to "*" temporarily for local testing).
const DEFAULT_ALLOW_ORIGIN = "https://sandipanseal.github.io";

export default {
  async fetch(request, env) {
    const allowOrigin = env.ALLOW_ORIGIN || DEFAULT_ALLOW_ORIGIN;
    const cors = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: cors });
    }
    if (new URL(request.url).pathname === "/verify") return verify(request, env, cors);
    if (!env.LLM_API_KEY) {
      return json({ error: "Proxy missing LLM_API_KEY secret" }, 500, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, cors);
    }

    const provider = (env.PROVIDER || "hf").toLowerCase();
    const upstreamUrl = UPSTREAM[provider] || UPSTREAM.hf;

    // Forward the (already OpenAI-shaped) request, adding the key server-side.
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.LLM_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  },
};

// shortcut: counts live in this isolate's memory (reset on cold start, not shared
// across locations). Add a Cloudflare rate-limiting rule on /verify for a hard cap.
const MAX_FAILS = 3;
const WINDOW_MS = 10 * 60 * 1000;
const fails = new Map();

const csv = (v) => (v || "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
const words = (v) => String(v || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);

/**
 * Private-life check for the chat. Secrets (Cloudflare secrets, never in code):
 *   VERIFY_NAMES   comma list of names that may claim to be "them", e.g. a,b,c
 *   VERIFY_CODES   comma list of accepted codes
 *   SECRET_ANSWER  the default text revealed once name + code both match ("dearest person")
 *   ANSWER_SUBJECT / ANSWER_STATUS / ANSWER_GIRLFRIEND  optional answers for "who is <her>?",
 *                  "relationship status?" and "girlfriend?" (see pickAnswer); default SECRET_ANSWER
 *   SECRET_SUBJECT comma list of the secret person's names, for "who is …?" lookups
 * Body { who, code?, asked? } → { ok:false, reason:"who" } | { ok:false, reason:"code" }
 *                      | { ok:false, reason:"bad-code" } | { ok:false, reason:"locked" }
 *                      | { ok:true, answer }
 * Three wrong tries per IP lock it out for 10 minutes ("locked").
 */
async function verify(request, env, cors) {
  const names = csv(env.VERIFY_NAMES);
  const codes = csv(env.VERIFY_CODES);
  if (!env.SECRET_ANSWER || !names.length || !codes.length) {
    return json({ error: "Verification not configured" }, 500, cors);
  }

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const now = Date.now();
  const rec = fails.get(ip);
  const entry = rec && now - rec.t < WINDOW_MS ? rec : { n: 0, t: now };
  // After MAX_FAILS wrong tries nothing is accepted (not even the right code) until the window ends.
  const locked = entry.n >= MAX_FAILS;
  const lockedReply = () => json({ ok: false, reason: "locked" }, 200, cors);
  const fail = (reason) => {
    fails.set(ip, { n: entry.n + 1, t: entry.t });
    return json({ ok: false, reason }, 200, cors);
  };

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400, cors);
  }

  const who = words(body.who);
  const nameOk = names.some((n) => who.includes(n));
  const codeOk = words(body.code).some((w) => codes.includes(w));

  // Lookup: { question } — is it about the secret person? Never reveals anything: not about
  // her → {ok:false}; about her → reason "who" (start verification) or "locked".
  // Not counted as a failed try — it only starts the who-are-you → code flow.
  if (body.question) {
    const asked = words(body.question);
    if (!csv(env.SECRET_SUBJECT).some((n) => asked.includes(n))) return json({ ok: false }, 200, cors);
    return locked ? lockedReply() : json({ ok: false, reason: "who" }, 200, cors);
  }

  if (locked) return lockedReply();
  if (!nameOk) return fail("who");
  if (!body.code) return json({ ok: false, reason: "code" }, 200, cors);
  if (!codeOk) return fail("bad-code");
  return json({ ok: true, answer: pickAnswer(env, body.asked) }, 200, cors);
}

const STATUS_Q = /\b(relationship|status|single|taken|committed|married|marital)\b/;
const GIRLFRIEND_Q = /\b(girlfriends?|boyfriends?|partner|wife|spouse|lover|crush|dating|soulmate|bae|better half|special someone)\b|fianc/;

/**
 * Which secret answer fits the question that started the verification. Order matters:
 * asking about her by name → ANSWER_SUBJECT; relationship status → ANSWER_STATUS;
 * girlfriend/partner → ANSWER_GIRLFRIEND; anything else (e.g. "dearest person") → SECRET_ANSWER.
 * Each ANSWER_* falls back to SECRET_ANSWER when unset.
 */
function pickAnswer(env, asked) {
  const w = words(asked);
  const text = w.join(" ");
  if (csv(env.SECRET_SUBJECT).some((n) => w.includes(n))) return env.ANSWER_SUBJECT || env.SECRET_ANSWER;
  if (STATUS_Q.test(text)) return env.ANSWER_STATUS || env.SECRET_ANSWER;
  if (GIRLFRIEND_Q.test(text)) return env.ANSWER_GIRLFRIEND || env.SECRET_ANSWER;
  return env.SECRET_ANSWER;
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
