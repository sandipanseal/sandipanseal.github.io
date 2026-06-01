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

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
