/**
 * Content for the individual project pages (#/project/<slug>).
 * Names, stacks and links come from profile.ts; this file adds the long
 * description, architecture layers and screenshots (served from public/projects/<slug>/).
 */
import { projects, thesis } from "./profile";

/** One row of the architecture diagram; arrows run from each layer to the next. */
export type ArchLayer = { label: string; nodes: string[] };

export type ProjectEntry = {
  slug: string;
  name: string;
  title: string;
  description: string;
  points: string[];
  stack: string[];
  architecture: ArchLayer[];
  screenshots: { src: string; caption: string }[];
  github?: string;
  demo?: string;
};

export const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const THESIS_SLUG = "master-thesis";

type Extra = Pick<ProjectEntry, "description" | "architecture" | "screenshots">;

// Keyed by slugify(project.name).
const extras: Record<string, Extra> = {
  "inferops-ai": {
    description:
      "A production-grade LLM gateway that sits between applications and model providers. Every request passes safety checks (prompt-injection blocking, PII redaction), budget and rate limits, optional RAG retrieval and a response cache before a routing engine picks the cheapest model that fits the task. A built-in evaluation layer (deterministic checks, LLM-as-judge, RAGAS) and full observability keep quality and cost measurable.",
    architecture: [
      { label: "Clients", nodes: ["Next.js dashboard", "API clients"] },
      { label: "FastAPI gateway: safety & limits", nodes: ["Prompt-injection block", "PII redaction", "Budget guardrails", "Redis rate limit"] },
      { label: "Retrieval & cache", nodes: ["Qdrant top-k RAG", "SentenceTransformers embeddings", "Redis response cache"] },
      { label: "Routing", nodes: ["Complexity / priority / privacy router", "Fallback chain"] },
      { label: "Model providers", nodes: ["Local Ollama", "Ollama Cloud", "OpenAI", "vLLM (optional)"] },
      { label: "Observability & evals", nodes: ["Postgres request logs", "Prometheus + Grafana", "LLM-as-judge", "RAGAS"] },
    ],
    screenshots: [
      { src: "/projects/inferops-ai/dashboard.jpg", caption: "Dashboard" },
      { src: "/projects/inferops-ai/chat-console.jpg", caption: "Chat console" },
      { src: "/projects/inferops-ai/evaluation-center.jpg", caption: "Evaluation center" },
    ],
  },
  "aegisops-ai": {
    description:
      "An agentic incident commander for production systems. Specialist agents collect evidence from logs, metrics, Kubernetes state and deployment history, a root-cause agent synthesises it with a confidence explanation, and every suggested runbook is risk-scored and approval-gated before anything runs. The LLM backend routes through the InferOps gateway, falls back to OpenAI, and finally to a deterministic RCA.",
    architecture: [
      { label: "Command center", nodes: ["Next.js UI"] },
      { label: "Backend", nodes: ["FastAPI", "PostgreSQL"] },
      { label: "Evidence agents", nodes: ["Log analysis", "Metrics analysis", "Kubernetes state", "Deployment history", "RAG memory"] },
      { label: "Reasoning", nodes: ["Prompt-injection guard", "RCA synthesis", "Confidence explanation"] },
      { label: "Model routing", nodes: ["InferOps gateway", "OpenAI fallback", "Deterministic RCA fallback"] },
      { label: "Incident operations", nodes: ["Lifecycle state machine", "SLA tracking", "Runbook risk scoring", "Safety-gated runbooks"] },
      { label: "Observability", nodes: ["Prometheus", "Loki", "Grafana"] },
    ],
    screenshots: [
      { src: "/projects/aegisops-ai/command-center.jpg", caption: "Command center" },
      { src: "/projects/aegisops-ai/dependencies.jpg", caption: "Service dependency graph" },
    ],
  },
  "deliverylens-ai": {
    description:
      "An AWS-native delivery intelligence platform that connects Jira work items with GitLab merge requests and CI pipelines. It ingests events through a queue-backed pipeline into a serverless data lake, computes auditable flow metrics, diagnoses bottlenecks, recommends approval-gated interventions with ROI estimates, and answers questions through a guarded Text2SQL layer over read-only Athena views.",
    architecture: [
      { label: "Sources", nodes: ["Jira Cloud REST + webhooks", "GitLab GraphQL + webhooks"] },
      { label: "Edge & API", nodes: ["CloudFront", "S3 frontend", "API Gateway", "FastAPI Lambda"] },
      { label: "Ingestion", nodes: ["SQS queue + DLQ", "Worker Lambda", "S3 raw event lake", "DynamoDB event index"] },
      { label: "Analytics", nodes: ["EventBridge Scheduler", "Glue PySpark ETL", "S3 curated Parquet", "Athena read-only views"] },
      { label: "Intelligence", nodes: ["Guarded Text2SQL", "Step Functions approval workflow"] },
    ],
    screenshots: [],
  },
  "ai-automation-testing-tool": {
    description:
      "A multi-agent QA system built on CrewAI. Given a web app and a plain-language requirement, an explorer agent navigates the app with Playwright, a writer agent produces structured test scenarios, a generator turns them into a Playwright spec, and a runner executes the tests and repairs failures. A React UI streams live progress over Server-Sent Events.",
    architecture: [
      { label: "Frontend", nodes: ["Vite + React UI"] },
      { label: "Backend", nodes: ["FastAPI bridge (POST /api/run)", "SSE live logs"] },
      { label: "CrewAI pipeline", nodes: ["Explorer (Playwright MCP)", "Test case writer", "Script generator", "Runner / fixer"] },
      { label: "Runtime & storage", nodes: ["Playwright", "output/ reports", "tests/*.spec.ts"] },
    ],
    screenshots: [
      { src: "/projects/ai-automation-testing-tool/new-test.jpg", caption: "New test" },
      { src: "/projects/ai-automation-testing-tool/test-plan.jpg", caption: "Generated test plan" },
      { src: "/projects/ai-automation-testing-tool/test-detail.jpg", caption: "Test detail" },
    ],
  },
  "ai-compliance-gatekeeper": {
    description:
      "An AI-powered compliance gate for documents. An n8n workflow watches a Gmail label, sends each attachment to a FastAPI service that classifies PII and policy risk, and routes the file by decision: allow, redact, quarantine, send for approval, or block. Approvals happen through email links, and every step is written to an audit log.",
    architecture: [
      { label: "Trigger", nodes: ["Gmail inbox (GATEKEEP label)"] },
      { label: "Orchestration", nodes: ["n8n Cloud workflow"] },
      { label: "AI service (Render)", nodes: ["/analyze: decision + labels + confidence", "/redact: redacted content"] },
      { label: "Decision routing", nodes: ["ALLOW", "REDACT", "QUARANTINE", "APPROVAL_REQUIRED", "BLOCK"] },
      { label: "Storage & audit", nodes: ["Google Drive folders", "Postgres (Supabase) audit log", "SMTP notifications"] },
    ],
    screenshots: [{ src: "/projects/ai-compliance-gatekeeper/n8n-workflow.jpg", caption: "n8n workflow" }],
  },
  "mine-tenji": {
    description:
      "A team project that extends TENJI, a parliamentary-debate search platform, with personalised speech recommendations. Speeches sourced from Bundestagsmine are filtered and ranked with Hugging Face NLP models using each user's search history and preferences, on a React frontend with Supabase for authentication and data.",
    architecture: [
      { label: "Frontend", nodes: ["React (Vite)"] },
      { label: "Backend", nodes: ["Supabase auth + database"] },
      { label: "Recommendation", nodes: ["Hugging Face NLP ranking", "Search-history preferences"] },
      { label: "Data", nodes: ["Bundestagsmine parliamentary speeches"] },
    ],
    screenshots: [],
  },
};

const thesisExtra: Extra = {
  description:
    "An experimental study, not a deployable detector, of how LLMs (as evidence interpreters) and conventional ML (as classifiers) perform on RF-jamming data derived from WiFi captures. The LLMs never see raw signals: they receive compact statistical evidence computed from RF embeddings and must return a structured JSON verdict that cites it. Five LLMs run under one identical protocol, and their explanations are tested causally, not just checked for grounding.",
  architecture: [
    { label: "Data", nodes: ["WiFi IQ packets", "Synthetic jamming augmentation (3 JNR levels)"] },
    { label: "Representation", nodes: ["256-d RF embeddings", "32-packet windows, date-held-out split"] },
    { label: "Models", nodes: ["Conventional ML baselines", "Evidence builder (four LDA axes)", "LLM interpreter: JSON verdict + citations"] },
    { label: "Analysis", nodes: ["Deterministic correction rule", "Perturbation faithfulness suite", "McNemar / Holm / group bootstrap"] },
  ],
  screenshots: [],
};

const thesisPoints = [
  "Regime accuracy rose from chance (19%) to 56% with a supervised four-axis LDA evidence, and 73% with a deterministic correction rule.",
  "Citations were 100% grounded but not always causally faithful, shown with paired perturbation tests.",
  "The same four LDA features without any LLM reach 80–81%: the representation, not the model, does most of the work.",
];

export function getProjectEntry(slug: string): ProjectEntry | undefined {
  if (slug === THESIS_SLUG) {
    return {
      slug,
      name: "Master’s Thesis",
      title: thesis.title,
      points: thesisPoints,
      stack: ["LLMs", "Explainable AI", "LDA", "Statistics", "Python"],
      ...thesisExtra,
    };
  }
  const p = projects.find((x) => slugify(x.name) === slug);
  const extra = extras[slug];
  if (!p || !extra) return undefined;
  return { slug, name: p.name, title: p.title, points: p.points, stack: p.stack, github: p.github, demo: p.demo, ...extra };
}
