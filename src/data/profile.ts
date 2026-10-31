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
  yearsExperience: "4+",

  // CV PDF (bundled in public/).
  cvUrl: "/Sandipan_Seal_CV.pdf",

  // Avatar clip with a near-black background. The hero crushes that background to
  // true black with a contrast filter and keys it out with mix-blend-mode: screen
  // (see Hero.tsx), so the avatar floats with no visible box.
  heroVideo: "/avatar-dark.mp4",
  // Shown if the video is missing / can't play.
  heroImageFallback: "/profile.png",

  summary:
    "AI Engineer at aiio GmbH with 4 years building production LLM and agentic systems (RAG, multi-agent, knowledge graphs), delivered directly to clients as a forward-deployed engineer. Master’s research on explainable, LLM-based RF-jamming analysis.",
};

/**
 * Personal / human side of Sandipan — used by the "Ask about Sandipan" chat
 * agent so it can answer warm, get-to-know-you questions, not just the resume.
 * This is intentionally kept separate from the professional data above.
 */
export const personal = {
  birthday: "27 September",
  height: "5.6 ft",
  weight: "67 kg",
  family: {
    father: "Ramendra Kumar Seal",
    fatherOccupation: "businessman",
    mother: "Soma Seal",
    motherOccupation: "homemaker",
    grandfather: "Panchu Prasad Seal",
    grandmother: "Debi Rani Seal",
    brothers: [
      { name: "Partha Sarathi Banerjee", role: "an Account Executive", url: "https://www.linkedin.com/in/partha-sarathi-banerjee-520516164/" },
      { name: "Sayan Malick", role: "a Cashier at a bank", url: "https://www.facebook.com/sayan.malick.7" },
    ],
    uncle: {
      name: "Ranendra Kumar Seal",
      relation: "paternal uncle",
      detail: "an Electrical Engineer at Uranium Corporation of India",
    },
    aunt: {
      name: "Rama Mukherjee",
      relation: "paternal aunt (his father's sister)",
      detail: "holds an M.A. in Bengali literature and was a teacher at a government school",
    },
  },
  // Close friends (in Germany).
  friends: [
    { name: "Ishmita Basu", url: "https://www.linkedin.com/in/ishmita-basu/" },
    { name: "Imon Ghose", url: "https://www.linkedin.com/in/imon-ghose-467a4722a/" },
  ],
  // Public on purpose. Who he is close to is a secret held server-side by proxy/cloudflare-worker.js.
  relationship: { status: "single" },
  hobbies: ["Sketching","Playing the guitar", "Reading books", "Video games", "Cooking"],
  sports: {
    plays: ["Football"],
    practices: ["Martial arts"],
    skills: ["Swimming (quite well)"],
  },
  // Things he genuinely loves doing.
  passions: ["Travelling", "Coding", "Cooking"],
  favorites: {
    color: "blue",
    foods: ["Kebab", "Biriyani"],
    animals: ["Dogs", "Horses"],
    places: ["Mountains", "Forests"],
    footballer: "Lionel Messi",
    batsman: "Sachin Tendulkar",
    bowler: "Mitchell Starc",
    bands: {
      english: ["One Direction", "Eagles"],
      bengali: ["Fossils", "Prithibi"],
    },
    actor: "Shah Rukh Khan",
    directors: ["Christopher Nolan", "Satyajit Ray"],
  },
  interests: {
    // Topics he loves researching beyond AI.
    research: ["human psychology", "neuroscience", "ancient history", "world mythologies"],
    reading: ["comics", "manga", "good stories", "poems by good authors"],
    riding: ["riding motorbikes", "driving cars"],
  },
  leadership: {
    summary:
      "Comfortable leading teams — he has led on several occasions and is fluent in running a team with DevOps and Jira under the Scrum methodology.",
    highlights: [
      "Acted as the Kolkata-branch liaison for his own project team at Persistent Systems (India).",
      "Led the team on the AMS project — Evaluation of Embedded Hardware and Cone Detection.",
      "Led a simulation-based project that simulated traffic in a given area and proposed solutions to its problems.",
    ],
  },
  // Salary expectations by region.
  salaryExpectation: {
    india: "₹40–50 LPA",
    germany: "€70,000–€80,000 per year",
  },
  // Academic results by level.
  academics: {
    secondary: "86%", // 10th boards
    higherSecondary: "80%", // 12th boards
    bachelor: "87%", // B.Tech
    masters: "87–90%", // M.Sc., ongoing
  },
};

export const contact = {
  email: "sandipanseal68@gmail.com",
  phone: "+49 1556 0068976",
  phoneIndia: "+91 79804 06735",
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
      "Knowledge graphs",
      "Embeddings & vector search",
      "Eval (LLM-as-judge, RAGAS)",
      "Guardrails (PII redaction, prompt-injection defense)",
      "DSPy optimization",
      "Claude Agent SDK",
      "MCP (Model Context Protocol)",
      "AI risk & data privacy (GDPR)",
      "LLMOps",
      "n8n",
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
      "Jina embeddings",
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
    skills: ["PostgreSQL", "Redis", "Qdrant (vector DB)", "FalkorDB (graph DB)", "Cypher", "Neo4j", "MongoDB", "Supabase"],
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
      "Render",
      "Vercel",
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
    role: "AI Research Engineer",
    company: "aiio GmbH",
    location: "Magdeburg, Germany",
    period: "Oct 2026 – Present",
    current: true,
    points: [
      "Gave clients 70–80% more clean, usable data by building and deploying end-to-end RAG-enabled multi-agent systems that ingest process data, extract workflows, and use LLMs to build knowledge graphs and chatbots.",
      "Cut clients' consulting spend by researching and shipping software products that act as an automated consultant, so they no longer need to hire multiple consultants.",
      "Turned ambiguous client problems into working solutions by acting as a forward-deployed engineer: gathering requirements directly with clients, then designing, building, and deploying the full system.",
    ],
    tags: ["RAG", "Multi-agent", "LLMs", "Knowledge graphs", "Chatbots", "Python", "FastAPI", "Forward-deployed"],
  },
  {
    role: "Working Student — AI/ML Software Development",
    company: "aiio GmbH",
    location: "Magdeburg, Germany",
    period: "Jan 2025 – Sep 2026",
    points: [
      "Added AI suggestions, recommendations, and AI-generated descriptions to aiio’s main process-data product and Polaris by building LLM-based features into the live products.",
      "Accelerated delivery of customer-facing AI tools by building responsive React.js / Next.js front-ends integrated with production models.",
    ],
    tags: ["LLMs", "AI features", "Python", "React.js", "Next.js"],
  },
  {
    role: "Research Assistant — EEG Signal Analysis",
    company: "Leibniz Institute for Neurobiology",
    location: "Magdeburg, Germany",
    period: "Mar 2025 – Jul 2026",
    points: [
      "Built Python signal-processing and analysis pipelines for EEG data to support the institute's research.",
    ],
    tags: ["EEG", "Signal processing", "Python", "Unity"],
  },
  {
    role: "Senior Software Engineer",
    company: "Persistent Systems Ltd",
    location: "Kolkata, India",
    period: "Sep 2021 – Mar 2024",
    points: [
      "Raised healthcare-diagnostic prediction accuracy ~20% for client Adaptive Biotechnologies by designing and deploying predictive ML models into production.",
      "Delivered enterprise features end to end for PerkinElmer by owning React, .NET/C# and MongoDB work from API design to production deployment.",
      "Cut regression-test cycle time ~30% by building automated QA suites (Selenium, API testing); twice awarded the High Five Team Award.",
    ],
    tags: ["ML in production","Python", "React", ".NET / C#", "MongoDB", "QA automation"],
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
      "Cut LLM inference cost and blocked unsafe requests by building a gateway with cost-aware model routing, RAG (Qdrant/pgvector), PII redaction and prompt-injection guardrails, verified by a deterministic + LLM-as-judge + RAGAS eval suite at >80% test coverage.",
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
      "Reduced incident-triage effort by building multi-agent root-cause analysis with safety-classified actions and human-in-the-loop, approval-gated runbooks.",
      "Made incident impact visible by adding SLA tracking, a lifecycle state machine and service-dependency / blast-radius analysis.",
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
      "Surfaced engineering workflow bottlenecks and measured intervention ROI by connecting Jira and GitLab to an AWS serverless data lake.",
      "Made delivery data safely queryable by adding guarded Text2SQL analytics (DSPy) with human-in-the-loop safeguards.",
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
      "Cut manual test creation by building explorer, scenario-writer, script-generator and auto-repairing-runner agents that produce executable Playwright tests.",
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
  title: "From RF Embeddings to Semantic Reasoning: Explainable Jamming Analysis via LLM-Based Evidence Interpretation",
  org: "Master’s Thesis · OVGU Magdeburg",
  points: [
    "An experimental study, not a deployable detector, of how LLMs (as evidence interpreters) and conventional ML (as classifiers) perform on RF-jamming data from WiFi captures. Jamming is synthetic (barrage, tone, sweep and intermittent noise at three JNR levels) injected into clean IQ packets, then mapped to 256-d embeddings and windowed with a date-held-out split. The LLMs never see raw signals: they receive compact statistical evidence and must return a structured JSON verdict that cites it. Five LLMs (gpt-4o-mini, Gemini 2.5 Flash, Claude Haiku 4.5, two Nemotron models) were run under one identical protocol, and the conventional baselines re-scored on the same windows.",
    "Three research questions. RQ1: the first design, salience-ranked top-10 embedding dimensions, sat at chance (19–22%, also under a neutral prompt), and oracle classifiers showed the failure was the representation. A supervised four-axis LDA evidence lifted gpt-4o-mini to 56%, and a zero-cost deterministic correction rule to 73% (best of five hybrids: 78%). RQ2: citations were 100% grounded, yet paired perturbation tests (masking, sufficiency, necessity, counterfactuals, matched random controls, McNemar with Holm correction, group-aware bootstrap) showed the effect on decisions is real but smaller and model-dependent, so grounded did not mean causally faithful. RQ3: the same four LDA features with no LLM reach 80–81%, above every hybrid and the 768-feature logistic regression (74%).",
    "Conclusion: the representation, not the language model, does most of the work. What the LLM adds is a per-decision written explanation, at the cost of flagging 38–43% of clean windows as jammed, so none of the hybrids is deployment-ready. Results were checked against a fresh 500-window confirmation sample, temperature-0 repeatability and a synthetic parameter-shift test; limits are synthetic jamming only, one band, six devices and one held-out date.",
  ],
};

export type Publication = {
  title: string;
  venue: string;
  date: string;
  description?: string;
  url: string;
};

export const publications: Publication[] = [
  {
    title: "Utilizing Convoluted Neural Networks to Predict COVID Infections in Individuals",
    venue: "Turkish Online Journal of Qualitative Inquiry · Vol. 12, Issue 6 (ISSN 1309-6591)",
    date: "Jul 2021",
    description:
      "A CNN-based approach for predicting COVID-19 infection in individuals from clinical/imaging signals.",
    url: "https://openurl.ebsco.com/EPDB%3Agcd%3A6%3A29327894/detailv2?sid=ebsco%3Aplink%3Ascholar&id=ebsco%3Agcd%3A160450336&crl=c&link_origin=scholar.google.de",
  },
  {
    title: "Classification of Emotions using Voice Signal — A Non-Linear Signal Processing Approach",
    venue: "SSRN",
    date: "Jan 2020",
    description:
      "Emotion recognition from voice using non-linear signal-processing features rather than purely linear spectral analysis.",
    url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3515127",
  },
  {
    title: "IoT Based Smart Farming System",
    venue:
      "Proc. National Conference on Science, Technology and Communication Skills · Ideal International E-Publication (ISBN 978-93-86675-47-7)",
    date: "Apr 2018",
    description:
      "Cloud-connected sensor network bringing real-time field data to agriculture — enabling efficient, automated irrigation and crop monitoring.",
    url: "https://drive.google.com/file/d/17tdPVlCW4InQuzMNveHkdxNp25ICcXVa/view",
  },
];

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
  { name: "German", level: "Conversational" },
];

export const navItems = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];
