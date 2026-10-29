/**
 * Content for the individual project pages (#/project/<slug>).
 * Names, stacks and links come from profile.ts; this file adds the long
 * description, Mermaid architecture diagram and screenshots (served from public/projects/<slug>/).
 */
import { projects, thesis } from "./profile";

export type ProjectEntry = {
  slug: string;
  name: string;
  title: string;
  description: string;
  points: string[];
  stack: string[];
  /** Mermaid flowchart source for the system-architecture diagram. */
  diagram: string;
  screenshots: { src: string; caption: string }[];
  github?: string;
  demo?: string;
};

export const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const THESIS_SLUG = "master-thesis";

type Extra = Pick<ProjectEntry, "description" | "diagram" | "screenshots">;

// Keyed by slugify(project.name).
const extras: Record<string, Extra> = {
  "inferops-ai": {
    description:
      "A production-grade LLM gateway that sits between applications and model providers. Every request passes safety checks (prompt-injection blocking, PII redaction), budget and rate limits, optional RAG retrieval and a response cache before a routing engine picks the cheapest model that fits the task. A built-in evaluation layer (deterministic checks, LLM-as-judge, RAGAS) and full observability keep quality and cost measurable.",
    diagram: `flowchart TB
  U["Next.js dashboard / API clients"] --> G["FastAPI gateway"]
  G --> S["Safety layer<br/>prompt-injection block · PII redaction"]
  S --> L["Budget guardrails · Redis rate limit"]
  L --> R["RAG retrieval<br/>top-k chunks with citations"]
  R <--> Q[("Qdrant<br/>vector store")]
  R --> C["Redis response cache"]
  C --> RT["Routing engine<br/>complexity · priority · privacy"]
  RT --> P1["Local Ollama"]
  RT --> P2["Ollama Cloud"]
  RT --> P3["OpenAI"]
  RT --> P4["vLLM"]
  G --> E["Evaluation layer<br/>deterministic · LLM-as-judge · RAGAS"]
  RT --> O["Metrics + structured logs"]
  O --> PG[("Postgres<br/>request logs")]
  O --> PM["Prometheus"] --> GF["Grafana"]`,
    screenshots: [
      { src: "/projects/inferops-ai/dashboard.jpg", caption: "Dashboard" },
      { src: "/projects/inferops-ai/chat-console.jpg", caption: "Chat console" },
      { src: "/projects/inferops-ai/evaluation-center.jpg", caption: "Evaluation center" },
    ],
  },
  "aegisops-ai": {
    description:
      "An agentic incident commander for production systems. Specialist agents collect evidence from logs, metrics, Kubernetes state and deployment history, a root-cause agent synthesises it with a confidence explanation, and every suggested runbook is risk-scored and approval-gated before anything runs. The LLM backend routes through the InferOps gateway, falls back to OpenAI, and finally to a deterministic RCA.",
    diagram: `flowchart TB
  UI["Next.js command center"] --> API["FastAPI backend"]
  API --> DB[("PostgreSQL")]
  API --> AG["Agentic RCA workflow"]
  subgraph EV["Evidence agents"]
    LG["Log analysis"]
    MT["Metrics analysis"]
    K8["Kubernetes state"]
    DP["Deployment history"]
    RG["RAG memory"]
  end
  AG --> LG & MT & K8 & DP & RG
  LG --> GD["Prompt-injection guard"]
  GD --> RCA["RCA synthesis<br/>+ confidence explanation"]
  MT --> RCA
  K8 --> RCA
  DP --> RCA
  RG --> RCA
  RCA --> GW["InferOps AI gateway"]
  GW -. "fallback" .-> OA["OpenAI direct"]
  OA -. "fallback" .-> DT["Deterministic RCA"]
  API --> OPS["Incident operations"]
  OPS --> LC["Lifecycle state machine"] --> SLA["SLA tracking"]
  OPS --> RK["Runbook risk scoring"] --> SG["Approval-gated runbooks"]
  API --> OB["Prometheus · Loki"] --> GF["Grafana"]`,
    screenshots: [
      { src: "/projects/aegisops-ai/command-center.jpg", caption: "Command center" },
      { src: "/projects/aegisops-ai/dependencies.jpg", caption: "Service dependency graph" },
    ],
  },
  "deliverylens-ai": {
    description:
      "An AWS-native delivery intelligence platform that connects Jira work items with GitLab merge requests and CI pipelines. It ingests events through a queue-backed pipeline into a serverless data lake, computes auditable flow metrics, diagnoses bottlenecks, recommends approval-gated interventions with ROI estimates, and answers questions through a guarded Text2SQL layer over read-only Athena views.",
    diagram: `flowchart TB
  J["Jira Cloud<br/>REST + webhooks"] --> GW["API Gateway"]
  GL["GitLab<br/>GraphQL + webhooks"] --> GW
  B["Browser"] --> CF["CloudFront"]
  CF --> FE[("S3 frontend")]
  CF --> GW
  GW --> API["FastAPI Lambda"]
  API --> Q["SQS ingestion queue"]
  Q --> W["Worker Lambda"]
  Q -. "3 failed attempts" .-> DLQ["SQS dead-letter queue"]
  W --> RAW[("S3 raw event lake")]
  W --> DDB[("DynamoDB event index")]
  SCH["EventBridge Scheduler"] --> GLUE["Glue PySpark ETL"]
  RAW --> GLUE
  GLUE --> GOLD[("S3 curated Parquet")]
  GOLD --> ATH["Athena read-only views"]
  API --> T2["Guarded Text2SQL"] --> ATH
  API --> SF["Step Functions<br/>approval workflow"] --> AQ["SQS approval queue"]`,
    screenshots: [],
  },
  "ai-automation-testing-tool": {
    description:
      "A multi-agent QA system built on CrewAI. Given a web app and a plain-language requirement, an explorer agent navigates the app with Playwright, a writer agent produces structured test scenarios, a generator turns them into a Playwright spec, and a runner executes the tests and repairs failures. A React UI streams live progress over Server-Sent Events.",
    diagram: `flowchart TB
  UI["Vite + React UI<br/>create tests · view runs · edit spec"] -- "POST /api/run" --> API["FastAPI bridge"]
  API -- "SSE live logs" --> UI
  API --> CA["CrewAI orchestrator"]
  subgraph PIPE["Sequential agent pipeline"]
    A1["Explorer<br/>Playwright MCP"] --> A2["Test case writer"] --> A3["Script generator"] --> A4["Runner / fixer"]
  end
  CA --> A1
  A1 --> OUT[("output/<br/>exploration · test cases · reports")]
  A3 --> TS[("tests/*.spec.ts")]
  A4 --> PW["Playwright run"]
  PW -. "repair + re-run on failure" .-> A4
  A4 --> OUT`,
    screenshots: [
      { src: "/projects/ai-automation-testing-tool/new-test.jpg", caption: "New test" },
      { src: "/projects/ai-automation-testing-tool/test-plan.jpg", caption: "Generated test plan" },
      { src: "/projects/ai-automation-testing-tool/test-detail.jpg", caption: "Test detail" },
    ],
  },
  "ai-compliance-gatekeeper": {
    description:
      "An AI-powered compliance gate for documents. An n8n workflow watches a Gmail label, sends each attachment to a FastAPI service that classifies PII and policy risk, and routes the file by decision: allow, redact, quarantine, send for approval, or block. Approvals happen through email links, and every step is written to an audit log.",
    diagram: `flowchart TB
  GM["Gmail inbox<br/>GATEKEEP label"] --> N8["n8n Cloud workflow"]
  N8 --> AN["AI Gatekeeper API on Render<br/>POST /analyze"]
  AN --> D{"Decision"}
  D -- "ALLOW" --> AP["Drive: Approved"]
  D -- "REDACT" --> RD["POST /redact"] --> RF["Drive: Redacted"]
  D -- "QUARANTINE" --> QF["Drive: Quarantine<br/>+ notify sender"]
  D -- "APPROVAL_REQUIRED" --> QA["Drive: Quarantine-for-Approval"] --> EM["Email approver<br/>approve / reject links"]
  D -- "BLOCK" --> BL["Notify sender"]
  EM --> WH["n8n production webhook"] -- "approved" --> AP
  N8 --> AUD[("Postgres / Supabase<br/>audit log")]`,
    screenshots: [{ src: "/projects/ai-compliance-gatekeeper/n8n-workflow.jpg", caption: "n8n workflow" }],
  },
  "mine-tenji": {
    description:
      "A team project that extends TENJI, a parliamentary-debate search platform, with personalised speech recommendations. Speeches sourced from Bundestagsmine are filtered and ranked with Hugging Face NLP models using each user's search history and preferences, on a React frontend with Supabase for authentication and data.",
    diagram: `flowchart TB
  U["User"] --> FE["React (Vite) frontend"]
  FE --> SB["Supabase<br/>authentication + database"]
  SB --> H[("Search history<br/>+ preferences")]
  H --> REC["Recommendation logic"]
  BM[("Bundestagsmine<br/>parliamentary speeches")] --> HF["Hugging Face NLP models<br/>filtering + ranking"]
  REC --> HF
  HF --> FE`,
    screenshots: [],
  },
};

const thesisExtra: Extra = {
  description:
    "An experimental study, not a deployable detector, of how LLMs (as evidence interpreters) and conventional ML (as classifiers) perform on RF-jamming data derived from WiFi captures. The LLMs never see raw signals: they receive compact statistical evidence computed from RF embeddings and must return a structured JSON verdict that cites it. Five LLMs run under one identical protocol, and their explanations are tested causally, not just checked for grounding.",
  diagram: `flowchart TB
  A["WiFi IQ packets<br/>channel 48 · 5240 MHz"] --> B["Synthetic jamming augmentation<br/>barrage · tone · sweep · intermittent<br/>JNR -5 / 0 / +5 dB"]
  B --> C["Pretrained extractor<br/>256-d RF embeddings"]
  C --> D["Windows T=32, stride 16<br/>date-held-out split"]
  D --> E["Conventional ML<br/>full-feature baselines · LDA-feature methods"]
  D --> F["Evidence builder<br/>salience top-10 or 4 LDA axes"]
  F --> G["LLM interpreter<br/>strict JSON verdict + citations"]
  G --> H["Deterministic correction rule<br/>= hybrid"]
  G --> I["Perturbation faithfulness suite<br/>mask · sufficiency · necessity · counterfactual"]
  E --> J["Evaluation and statistics<br/>McNemar · group bootstrap · Holm"]
  G --> J
  H --> J
  I --> J`,
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
