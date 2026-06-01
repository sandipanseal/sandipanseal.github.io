/**
 * Single source of truth for the whole site.
 * Edit values here and every section updates automatically.
 */

export const profile = {
  name: "Sandipan Seal",
  role: "AI / Machine Learning Engineer",
  tagline: "LLM & Agentic Systems",
  // Short hero line
  headline: "I turn frontier AI into reliable, measurable systems.",
  location: "Magdeburg, Germany",
  origin: "Kolkata, India",
  status: "Open to Forward-Deployed / AI Engineer roles",
  yearsExperience: "3+",

  // CV PDF (bundled in public/).
  cvUrl: "/Sandipan_Seal_CV.pdf",

  // Avatar clip with a near-black background. The hero crushes that background to
  // true black with a contrast filter and keys it out with mix-blend-mode: screen
  // (see Hero.tsx), so the avatar floats with no visible box.
  heroVideo: "/avatar-dark.mp4",
  // Shown if the video is missing / can't play.
  heroImageFallback: "/profile.png",

  summary:
    "AI/ML engineer with 4 years building production LLM and agentic systems — RAG pipelines, multi-agent applications, and safety-guarded LLM gateways deployed on AWS and Kubernetes. My master’s research drove LLM-based reasoning to 99.4% jamming-regime classification accuracy, beating classical ML baselines by 20+ points while keeping every explanation fully grounded. Now focused on Forward-Deployed / AI Engineer roles, partnering directly with customers to take ambiguous GenAI use cases from prototype to production.",
};

export const contact = {
  email: "sandipanseal68@gmail.com",
  phone: "+49 1556 0068976",
  github: "https://github.com/sandipanseal",
  githubHandle: "sandipanseal",
  linkedin: "https://www.linkedin.com/in/sandipan-seal-68198b216/",
  linkedinHandle: "sandipan-seal",
  hackerrank: "https://www.hackerrank.com/profile/sandipanseal68",
  hackerrankHandle: "sandipanseal68",
};

export type SkillGroup = {
  domain: string;
  blurb: string;
  skills: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    domain: "LLM / GenAI",
    blurb: "Designing, grounding, and guarding generative systems.",
    skills: [
      "RAG pipelines",
      "Multi-agent & agentic systems",
      "Prompt engineering",
      "Tool use / function calling",
      "Human-in-the-loop",
      "Fine-tuning",
      "Embeddings & vector search",
      "Eval (LLM-as-judge, RAGAS)",
      "Guardrails (PII redaction, prompt-injection defense)",
      "DSPy optimization",
      "Claude Agent SDK",
      "MCP (Model Context Protocol)",
      "AI risk & data privacy (GDPR)",
      "LLMOps",
    ],
  },
  {
    domain: "LLM Frameworks & Providers",
    blurb: "The toolkit I reach for to ship GenAI.",
    skills: [
      "LangChain",
      "CrewAI",
      "Hugging Face",
      "sentence-transformers",
      "OpenAI (GPT-4o)",
      "Ollama / vLLM",
    ],
  },
  {
    domain: "ML / Data Science",
    blurb: "Classical ML, deep learning, and the math underneath.",
    skills: [
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
      "pandas",
      "NumPy",
      "Computer vision",
      "NLP",
      "CNNs",
      "Reinforcement learning",
      "Recommender systems",
      "Information retrieval",
      "Explainable AI (XAI)",
      "Signal processing",
      "Clustering (PCA / UMAP)",
    ],
  },
  {
    domain: "Backend & Web",
    blurb: "Production APIs and polished front-ends.",
    skills: [
      "FastAPI",
      "Pydantic",
      "SQLAlchemy",
      "Node.js",
      "React.js",
      "Next.js",
      "Tailwind CSS",
      "REST APIs",
      "Microservices",
    ],
  },
  {
    domain: "Databases",
    blurb: "Relational, vector, graph, and document stores.",
    skills: ["PostgreSQL", "Redis", "Qdrant (vector DB)", "Neo4j", "MongoDB", "Supabase"],
  },
  {
    domain: "Cloud, DevOps & Observability",
    blurb: "Shipping and watching systems in production.",
    skills: [
      "AWS (Lambda, API Gateway, CloudFront, S3, SQS)",
      "AWS Step Functions / Glue / Athena",
      "Terraform (IaC)",
      "Docker",
      "Kubernetes",
      "CI/CD (GitHub Actions)",
      "Prometheus",
      "Grafana",
      "OpenTelemetry",
      "Langfuse",
      "SonarQube",
    ],
  },
  {
    domain: "Security & Compliance",
    blurb: "Keeping systems and data safe — by design.",
    skills: [
      "Certified Ethical Hacker (CEH)",
      "Penetration testing",
      "Computer forensics",
      "LLM security",
      "Prompt-injection mitigation",
      "AI risk & GDPR",
    ],
  },
  {
    domain: "Languages & Testing",
    blurb: "Programming languages and how I keep things correct.",
    skills: [
      "Python",
      "TypeScript",
      "JavaScript",
      "Go",
      "C++",
      "SQL",
      "Playwright",
      "pytest",
      "Locust",
      "n8n",
    ],
  },
];

export type Experience = {
  role: string;
  company: string;
  location: string;
  period: string;
  current?: boolean;
  points: string[];
  tags: string[];
};

export const experience: Experience[] = [
  {
    role: "Working Student — AI/ML Software Development",
    company: "aiio GmbH",
    location: "Magdeburg, Germany",
    period: "Jan 2025 – Present",
    current: true,
    points: [
      "Engineered LLM-powered, RAG-enabled multi-agent systems (Python, FastAPI) that automated the test-generation lifecycle, cutting manual test-authoring effort ~40% by converting natural-language requirements into executable test suites.",
      "Accelerated delivery of customer-facing AI tools by building responsive React.js / Next.js front-ends integrated with production models.",
      "Automated company segmentation across 1,000+ companies with a clustering pipeline (TF-IDF, multilingual MiniLM-BERT embeddings, PCA/UMAP, K-means/DBSCAN), validated with silhouette/purity metrics and German WZ2008 sector reporting.",
    ],
    tags: ["Python", "FastAPI", "RAG", "Multi-agent", "Next.js", "Clustering"],
  },
  {
    role: "Research Assistant — Brain–Machine Interface & EEG",
    company: "Leibniz Institute for Neurobiology",
    location: "Magdeburg, Germany",
    period: "Mar 2025 – Present",
    current: true,
    points: [
      "Research on Brain–Machine Interface (BMI) and EEG-based neural-feedback systems.",
      "Built signal-processing and analysis pipelines for neural data to support real-time feedback experiments.",
    ],
    tags: ["EEG", "Brain–Machine Interface", "Neural feedback", "Signal processing", "Python"],
  },
  {
    role: "Senior Software Engineer",
    company: "Persistent Systems Ltd",
    location: "Kolkata, India",
    period: "Sep 2021 – Mar 2024",
    points: [
      "Raised healthcare-diagnostic prediction accuracy ~20% for client Adaptive Biotechnologies by designing and deploying predictive ML models into production.",
      "Delivered end-to-end full-stack solutions for enterprise clients (PerkinElmer) across React, .NET/C#, and MongoDB — owning features from API design to production deployment.",
      "Cut regression-test cycle time ~30% by building automated QA suites (Selenium, API testing); twice awarded the High Five Team Award.",
    ],
    tags: ["ML in production", "React", ".NET / C#", "MongoDB", "QA automation"],
  },
];

export type Project = {
  name: string;
  title: string;
  summary: string;
  points: string[];
  stack: string[];
  github?: string;
  demo?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    name: "InferOps-AI",
    title: "Production LLM Gateway",
    summary:
      "A production-grade LLM gateway that cuts inference cost and blocks unsafe requests — cost-aware model routing, RAG, PII redaction, and prompt-injection guardrails.",
    points: [
      "Cost-aware model routing + RAG (Qdrant/pgvector), PII redaction, and prompt-injection guardrails, verified by a deterministic + LLM-as-judge + RAGAS eval suite at >80% test coverage.",
      "Shipped to production on AWS serverless (Lambda, API Gateway, CloudFront, S3) via Terraform, with Langfuse tracing and Prometheus/Grafana observability.",
    ],
    stack: [
      "FastAPI",
      "LangChain (ReAct)",
      "PostgreSQL",
      "Redis",
      "Qdrant",
      "Ollama/OpenAI/vLLM",
      "AWS",
      "Terraform",
      "Docker/Kubernetes",
    ],
    github: "https://github.com/sandipanseal/InferOps-AI",
    demo: "https://d2iduozpu4hqbk.cloudfront.net",
    featured: true,
  },
  {
    name: "AegisOps-AI",
    title: "Agentic Incident Commander",
    summary:
      "A multi-agent system that performs automated root-cause analysis over logs, metrics, and Kubernetes state — with confidence scoring and approval-gated runbooks.",
    points: [
      "Reduced incident-triage effort via multi-agent RCA with safety-classified actions and human-in-the-loop, approval-gated runbooks.",
      "Implemented SLA tracking, a lifecycle state machine, and service-dependency / blast-radius analysis.",
    ],
    stack: ["FastAPI", "Next.js 15", "OpenTelemetry", "Prometheus", "Grafana", "Kubernetes", "pytest + Playwright"],
    github: "https://github.com/sandipanseal/AegisOps-AI",
    featured: true,
  },
  {
    name: "DeliveryLens-AI",
    title: "Delivery Intelligence Platform",
    summary:
      "AWS-native delivery intelligence that connects Jira and GitLab, diagnoses engineering workflow bottlenecks, runs guarded Text2SQL analytics, and measures intervention ROI.",
    points: [
      "Connects Jira + GitLab to surface workflow bottlenecks and measure the ROI of interventions.",
      "Guarded Text2SQL analytics over a serverless data lake with human-in-the-loop safeguards.",
    ],
    stack: ["Python", "DSPy", "GraphQL", "AWS Glue/Athena/Step Functions", "PySpark", "Databricks", "Terraform"],
    github: "https://github.com/sandipanseal/DeliveryLens-AI",
    featured: true,
  },
  {
    name: "AI-Automation-Testing-Tool",
    title: "Multi-Agent QA (CrewAI)",
    summary:
      "A CrewAI multi-agent system that converts natural-language requirements into executable Playwright tests, with live SSE streaming.",
    points: [
      "Explorer, scenario writer, script generator, and an auto-repairing runner work together to cut manual test creation.",
      "Live SSE streaming surfaces agent progress in real time.",
    ],
    stack: ["CrewAI", "OpenAI", "FastAPI", "Playwright", "Vite + React"],
    github: "https://github.com/sandipanseal/AI-Automation-Testing-Tool-using-CrewAi",
  },
  {
    name: "AI-Compliance-Gatekeeper",
    title: "Compliance & Governance (n8n)",
    summary:
      "An AI-powered compliance system that analyzes policies, documents, and workflows to detect regulatory risks and prevent data leakage.",
    points: [
      "PII / policy classification and data-leakage prevention with auto-approval workflows.",
      "Built on n8n + FastAPI for governance, audit, and regtech use cases.",
    ],
    stack: ["n8n", "FastAPI", "Python", "Document analysis"],
    github: "https://github.com/sandipanseal/AI-Compliance-Gatekeeper-n8n",
  },
  {
    name: "Mine@TENJI",
    title: "Parliamentary Speech Recommender",
    summary:
      "A recommendation system for parliamentary speeches that enhances legal/legislative search.",
    points: [
      "Semantic retrieval over parliamentary data using SentenceTransformers + FAISS.",
      "Integrates speech recommendation into a legal-search experience.",
    ],
    stack: ["SentenceTransformers", "FAISS", "NLP", "Information retrieval", "TypeScript"],
    github: "https://github.com/sandipanseal/Mine-TENJI-Integrating-Speech-Recommendation-into-Legal-Search",
  },
];

export type ThesisItem = {
  title: string;
  org: string;
  points: string[];
};

export const thesis: ThesisItem = {
  title: "Explainable Jamming Analysis via LLM-Based Evidence Interpretation",
  org: "Master’s Thesis · OVGU Magdeburg",
  points: [
    "Achieved 99.4% regime and 99.9% binary jamming-detection accuracy on a balanced held-out set — outperforming Logistic Regression (79%) and Random Forest (65%) — by using an LLM as an evidence interpreter over engineered RF embeddings, not a raw classifier.",
    "Guaranteed 100% valid JSON output and 100% evidence-grounding by enforcing a strict output contract validated with grounding and perturbation-based faithfulness tests.",
  ],
};

export type EducationItem = {
  degree: string;
  school: string;
  location: string;
  period: string;
};

export const education: EducationItem[] = [
  {
    degree: "M.Sc. Digital Engineering (Computer Science)",
    school: "Otto-von-Guericke-University (OVGU) Magdeburg",
    location: "Germany",
    period: "Apr 2024 – Oct 2026 (expected)",
  },
  {
    degree: "B.Tech. Electronics & Communication Engineering",
    school: "Narula Institute of Technology",
    location: "Kolkata, India",
    period: "Aug 2017 – Jun 2021",
  },
  {
    degree: "Secondary & Higher Secondary — Science",
    school: "Govt. Sponsored Multipurpose School (Boys') — Taki House",
    location: "Kolkata, India",
    period: "Jan 2005 – May 2017",
  },
];

export type CertItem = { name: string; issuer: string; date?: string };
export type CertGroup = { category: string; items: CertItem[] };

export const certificationGroups: CertGroup[] = [
  {
    category: "GenAI / LLM / Agents",
    items: [
      { name: "Claude Code in Action", issuer: "Anthropic", date: "Apr 2026" },
      { name: "Claude Code 101", issuer: "Anthropic", date: "Apr 2026" },
      { name: "Introduction to Claude Cowork", issuer: "Anthropic", date: "Apr 2026" },
      { name: "AI Agent Fundamentals", issuer: "Databricks", date: "Feb 2026" },
      { name: "Generative AI Fundamentals", issuer: "Databricks", date: "Feb 2026" },
      { name: "AI Security Fundamentals", issuer: "Databricks", date: "Feb 2026" },
      { name: "Fine-tuning Large Language Models", issuer: "Hugging Face", date: "Feb 2026" },
      { name: "Fundamentals of LLMs", issuer: "Hugging Face", date: "Feb 2026" },
      { name: "Fundamentals of MCP", issuer: "Hugging Face", date: "Feb 2026" },
      { name: "Automation in Production", issuer: "Hugging Face", date: "Feb 2026" },
      { name: "AI Engineer for Data Scientists Associate", issuer: "DataCamp", date: "Jan 2026" },
    ],
  },
  {
    category: "Data · Engineering · Testing",
    items: [
      { name: "SQL Associate", issuer: "DataCamp", date: "Feb 2026" },
      { name: "Frontend Developer (React)", issuer: "HackerRank", date: "Feb 2026" },
      { name: "Problem Solving (Intermediate)", issuer: "HackerRank", date: "Feb 2026" },
      { name: "Machine Learning with Python — Level 1", issuer: "IBM", date: "Nov 2023" },
      { name: "Functionize AI Testing Certification", issuer: "Functionize" },
      { name: "Introduction to Programming in C", issuer: "NPTEL", date: "Oct 2018" },
    ],
  },
  {
    category: "Security · Foundations",
    items: [
      { name: "Certified Ethical Hacker (CEH)", issuer: "EC-Council", date: "Dec 2020" },
      { name: "Ethical Hacking", issuer: "ISOEH — Indian School of Ethical Hacking", date: "Dec 2020" },
      { name: ".NET Training", issuer: "Persistent Systems" },
    ],
  },
];

export const awards: string[] = [
  "Patent — Low-Cost Automated Bag-Valve-Mask Ventilation Machine (Indian Patent IN 202031037602 A, 2020)",
  "Conquer COVID-19 Hackathon Winner (2020)",
  "Best Paper ×2 — I3SET 2019, NCMR 2020",
  "High Five Team Award ×2 — Persistent Systems",
  "Swami Vivekananda Merit-Cum-Means Scholarship — State of West Bengal (2018–2021)",
];

export const languages: { name: string; level: string }[] = [
  { name: "Bengali", level: "Native · C2" },
  { name: "English", level: "IELTS · C1" },
  { name: "German", level: "A2" },
];

export const navItems = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];
