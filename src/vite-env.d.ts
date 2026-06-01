/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional Hugging Face token for the chat agent's LLM upgrade. See src/lib/agent/index.ts. */
  readonly VITE_HF_TOKEN?: string;
  /** Optional Hugging Face model id. Defaults to a Llama-3.1 instruct model. */
  readonly VITE_HF_MODEL?: string;
  /** Optional URL of your own LLM proxy (holds the key server-side). Preferred for production. */
  readonly VITE_AGENT_PROXY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
