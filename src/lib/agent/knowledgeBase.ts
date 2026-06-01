/**
 * Knowledge base for the "Ask about Sandipan" agent.
 *
 * Everything here is derived from the single source of truth in
 * src/data/profile.ts — so when you edit your profile, the agent's brain
 * updates with it. Nothing is hard-coded twice.
 *
 * It exposes two things:
 *   1. `knowledgeBase` — discrete Q&A entries the local engine retrieves from.
 *   2. `groundingContext` — a compact text dump of all facts, used as context
 *      for the optional LLM (Hugging Face) path so its answers stay grounded.
 */
import {
  profile,
  personal,
  contact,
  skillGroups,
  experience,
  projects,
  thesis,
  publications,
  education,
  certificationGroups,
  awards,
  languages,
} from "../../data/profile";

export type KBEntry = {
  id: string;
  /** Words/stems that, if present in the question, score this entry. */
  keywords: string[];
  /** Multi-word phrases that strongly imply this entry (higher weight). */
  phrases?: string[];
  /** The answer — kept conversational and first/third-person friendly. */
  answer: string;
  /** Used to surface follow-up suggestion chips. */
  topic: string;
};

const firstName = profile.name.split(" ")[0]; // "Sandipan"

/* ------------------------------------------------------------------ helpers */

const list = (items: string[]) => items.join(", ");

const projectLine = (p: (typeof projects)[number]) =>
  `• ${p.name} — ${p.title}: ${p.summary}${p.github ? ` (code: ${p.github})` : ""}`;

/* --- experience helpers: precise "where / what / company / when" answers --- */

type Exp = (typeof experience)[number];

/** "Sep 2021 – Mar 2024" → "from Sep 2021 to Mar 2024"; "Jan 2025 – Present" → "since Jan 2025 (current)". */
function periodPhrase(period: string): string {
  const [start, end] = period.split("–").map((s) => s.trim());
  if (!end) return `since ${start}`;
  return /present/i.test(end) ? `since ${start} (current)` : `from ${start} to ${end}`;
}

/** A single, precise sentence fragment for one role. */
const jobLine = (e: Exp) => `${e.role} at ${e.company} (${e.location}), ${periodPhrase(e.period)}`;

/** Group roles by country (last comma-separated part of the location). */
const experienceByCountry = experience.reduce<Record<string, Exp[]>>((acc, e) => {
  const country = e.location.split(",").pop()?.trim() ?? e.location;
  (acc[country] ??= []).push(e);
  return acc;
}, {});

/* --------------------------------------------------------------- KB entries */

export const knowledgeBase: KBEntry[] = [
  /* ---- identity / about ---- */
  {
    id: "about",
    topic: "About",
    // Deliberately avoids generic catch-alls like "who"/"about"/"tell" so that
    // specific questions ("who is his father", "tell me about InferOps") match
    // the right entry instead of falling into this broad one. Phrases cover the
    // common bio openers.
    keywords: ["sandipan", "intro", "introduce", "yourself", "summary", "bio", "biography"],
    phrases: ["who is he", "who is sandipan", "tell me about him", "about him", "about sandipan", "tell me about sandipan"],
    answer:
      `${profile.name} is an ${profile.role} focused on ${profile.tagline}. ` +
      `${profile.summary} He's based in ${profile.location} (originally from ${profile.origin}) ` +
      `and is currently ${profile.status.toLowerCase()}.`,
  },
  {
    id: "role",
    topic: "Role",
    keywords: ["role", "title", "job", "do", "work", "profession", "engineer", "position", "career"],
    phrases: ["what does he do", "what is his job", "current role"],
    answer:
      `${firstName} is an ${profile.role} specialising in ${profile.tagline}. ` +
      `In his words: "${profile.headline}" He builds production RAG, multi-agent, and ` +
      `safety-guarded LLM systems — taking them from prototype all the way to production.`,
  },
  {
    id: "location",
    topic: "Location",
    keywords: ["where", "location", "live", "lives", "based", "city", "country", "from", "origin", "germany", "india", "kolkata", "magdeburg"],
    phrases: ["where does he live", "where is he based", "where from"],
    answer: `${firstName} is based in ${profile.location}, and is originally from ${profile.origin}.`,
  },
  {
    id: "status",
    topic: "Availability",
    keywords: ["available", "availability", "hire", "hiring", "open", "looking", "roles", "opportunity", "opportunities", "freelance", "job"],
    phrases: ["is he available", "open to work", "can i hire"],
    answer:
      `Yes — ${firstName} is ${profile.status}. He's especially interested in partnering ` +
      `directly with customers to take ambiguous GenAI use cases from prototype to production. ` +
      `The best way to reach him is email: ${contact.email}.`,
  },
  {
    id: "experience-years",
    topic: "Experience",
    // No bare "experience" keyword — that belongs to the work-history entry so
    // "his experience" lists the jobs. This entry fires on "how long / how many
    // years" style questions via its keywords + phrases.
    keywords: ["years", "long", "seniority"],
    phrases: ["how many years", "how much experience", "years of experience"],
    answer:
      `${firstName} has ${profile.yearsExperience} years of experience building production ` +
      `LLM and agentic systems, plus earlier full-stack and ML engineering work.`,
  },

  /* ---- contact ---- */
  {
    id: "contact",
    topic: "Contact",
    keywords: ["contact", "email", "reach", "phone", "call", "linkedin", "github", "hackerrank", "connect", "social", "links", "cv", "resume"],
    phrases: ["how to contact", "get in touch", "reach him", "contact details"],
    answer:
      `You can reach ${firstName} here:\n` +
      `• Email: ${contact.email}\n` +
      `• Phone: ${contact.phone}\n` +
      `• GitHub: ${contact.github}\n` +
      `• LinkedIn: ${contact.linkedin}\n` +
      `• HackerRank: ${contact.hackerrank}\n` +
      `His CV is also downloadable from the site.`,
  },

  /* ---- skills ---- */
  {
    id: "skills",
    topic: "Skills",
    keywords: ["skill", "skills", "tech", "stack", "technologies", "tools", "expertise", "know", "languages", "programming", "frameworks", "good", "specialise", "specialize"],
    phrases: ["what can he do", "tech stack", "what technologies", "programming languages"],
    answer:
      `${firstName}'s toolkit spans the full GenAI stack:\n` +
      skillGroups.map((g) => `• ${g.domain}: ${list(g.skills.slice(0, 8))}`).join("\n") +
      `\nAsk about any one area (e.g. "LLM skills", "cloud", "databases") for the full list.`,
  },
  ...skillGroups.map((g) => ({
    id: `skill-${g.domain.toLowerCase().replace(/[^a-z]+/g, "-")}`,
    topic: "Skills",
    // Domain words + "skill(s)" so "his LLM skills" outscores the generic
    // skills list (which only has the bare "skill" keyword). A bare "skills"
    // question still ties → the earlier generic entry wins → shows everything.
    keywords: [...g.domain.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean), "skill", "skills"],
    answer: `${g.domain} — ${g.blurb}\n${list(g.skills)}`,
  })),

  /* ---- experience ----
     Generic list has NO company names (those live on the per-company entries
     below) so "tell me about aiio" hits the specific role, not this list. */
  {
    id: "experience",
    topic: "Experience",
    keywords: ["experience", "worked", "companies", "employer", "history", "jobs", "career", "professional"],
    phrases: ["work experience", "where has he worked", "professional experience", "work history"],
    answer:
      `${firstName}'s professional journey:\n` +
      experience
        .map((e) => `• ${e.role} @ ${e.company} (${e.period})${e.current ? " — current" : ""}`)
        .join("\n") +
      `\nAsk about any role for what he did there.`,
  },
  {
    // Precise "what is he doing now / current job" — phrases only, so it never
    // collides with the "studying now" (education) entry on keywords.
    id: "exp-current",
    topic: "Experience",
    keywords: [],
    phrases: ["current job", "current role", "currently working", "where does he work now", "where is he working", "present job", "his current job", "his current role", "where does he work currently", "what is his job now"],
    answer:
      `Currently, ${firstName} is ${experience.filter((e) => e.current).map(jobLine).join(", and ")}.`,
  },
  ...experience.map((e, i) => ({
    id: `exp-${i}`,
    topic: "Experience",
    keywords: [
      ...e.company.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
      ...e.role.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3),
    ],
    // Leads with a precise one-liner (role · company · location · dates), then detail.
    answer: `${firstName} worked as ${jobLine(e)}:\n${e.points.map((p) => `• ${p}`).join("\n")}`,
  })),
  // Location-filtered: "where/which company did he work in India / Germany?"
  ...Object.entries(experienceByCountry).map(([country, jobs]) => {
    const c = country.toLowerCase();
    const cityWords = jobs.flatMap((j) => j.location.toLowerCase().split(/[^a-z]+/).filter(Boolean));
    return {
      id: `exp-country-${c}`,
      topic: "Experience",
      keywords: [c, ...cityWords],
      phrases: [`in ${c}`, `work in ${c}`, `worked in ${c}`, `working in ${c}`, `company in ${c}`, `job in ${c}`],
      answer:
        jobs.length === 1
          ? `In ${country}, ${firstName} worked as ${jobLine(jobs[0])}.`
          : `In ${country}, ${firstName} has worked at ${jobs.length} places:\n` +
            jobs.map((j) => `• ${jobLine(j)}`).join("\n"),
    };
  }),

  /* ---- projects ---- */
  {
    id: "projects",
    topic: "Projects",
    keywords: ["project", "projects", "built", "build", "portfolio", "work", "made", "created", "apps", "showcase"],
    phrases: ["what has he built", "show me projects", "his projects"],
    answer:
      `Here are ${firstName}'s key projects:\n` + projects.map(projectLine).join("\n") +
      `\nAsk about any one by name for details.`,
  },
  ...projects.map((p) => ({
    id: `project-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    topic: "Projects",
    keywords: [
      ...p.name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
      ...p.title.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3),
    ],
    answer:
      `${p.name} — ${p.title}\n${p.summary}\n${p.points.map((pt) => `• ${pt}`).join("\n")}\n` +
      `Stack: ${list(p.stack)}.${p.github ? `\nCode: ${p.github}` : ""}${p.demo ? `\nLive: ${p.demo}` : ""}`,
  })),

  /* ---- thesis / research ---- */
  {
    id: "thesis",
    topic: "Research",
    // Note: "study"/"studied" intentionally belong to the education entry, not here.
    keywords: ["thesis", "research", "master", "masters", "jamming", "explainable", "paper", "accuracy", "llm-based"],
    phrases: ["master thesis", "his research", "what is his thesis"],
    answer: `${thesis.title} — ${thesis.org}.\n${thesis.points.map((p) => `• ${p}`).join("\n")}`,
  },
  {
    id: "publications",
    topic: "Research",
    keywords: ["publication", "publications", "published", "papers", "journal", "ssrn", "conference", "patent"],
    phrases: ["has he published", "research papers"],
    answer:
      `${firstName} has published several papers:\n` +
      publications.map((p) => `• "${p.title}" — ${p.venue} (${p.date})`).join("\n"),
  },

  /* ---- education (specific entries first, generic catch-all last) ---- */
  {
    // "What is he studying now?" → only the latest / current degree.
    id: "education-current",
    topic: "Education",
    keywords: ["studying", "study", "now", "currently", "current", "pursuing", "master", "masters", "msc", "ovgu"],
    phrases: ["what is he studying", "studying now", "currently studying", "his masters", "master's degree", "masters degree", "what is he doing now"],
    answer:
      `Right now, ${firstName} is pursuing his ${education[0].degree} at ${education[0].school}, ${education[0].location} (${education[0].period}).`,
  },
  {
    // "What's his bachelor?" → only the bachelor degree.
    id: "education-bachelor",
    topic: "Education",
    keywords: ["bachelor", "bachelors", "btech", "undergraduate", "undergrad", "ece", "electronics", "narula"],
    phrases: ["his bachelor", "bachelor degree", "bachelor's degree", "undergraduate degree"],
    answer: `${firstName} did his ${education[1].degree} at ${education[1].school}, ${education[1].location} (${education[1].period}).`,
  },
  {
    // "Where did he go to school?" → only schooling.
    id: "education-school",
    topic: "Education",
    keywords: ["school", "schooling", "secondary", "highschool", "12th", "10th"],
    phrases: ["his schooling", "high school", "where did he go to school", "school education"],
    answer: `For schooling, ${firstName} attended ${education[2].school}, ${education[2].location} — ${education[2].degree} (${education[2].period}).`,
  },
  {
    // Generic — only when no specific level is asked: show everything.
    id: "education",
    topic: "Education",
    keywords: ["education", "studied", "degree", "degrees", "university", "college", "academic", "academics", "qualification", "qualifications", "studies"],
    phrases: ["his education", "educational background", "where did he study"],
    answer:
      `${firstName}'s education:\n` +
      education.map((e) => `• ${e.degree} — ${e.school}, ${e.location} (${e.period})`).join("\n"),
  },

  /* ---- certifications ----
     Generic entry FIRST: when only a bare "certifications" word is asked it
     ties the per-group entries at score 1 and, being earlier, wins → lists all.
     When a category/issuer word is also present, the matching per-group entry
     scores higher (≥2) and wins → shows only that group. */
  {
    id: "certifications",
    topic: "Certifications",
    keywords: ["certification", "certifications", "certificate", "certified", "courses", "credential", "credentials", "cert", "certs"],
    phrases: ["what certifications", "his certs", "his certifications"],
    answer:
      `${firstName} holds certifications across several areas:\n` +
      certificationGroups
        .map((g) => `• ${g.category}: ${list(g.items.slice(0, 5).map((i) => i.name))}${g.items.length > 5 ? ", …" : ""}`)
        .join("\n"),
  },
  ...certificationGroups.map((g) => ({
    id: `cert-${g.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    topic: "Certifications",
    // Category words + every issuer name + the "cert" words, so e.g.
    // "security certifications" or "anthropic certs" hit the right group.
    keywords: [
      ...g.category.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
      ...g.items.flatMap((i) => i.issuer.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)),
      "certification", "certifications", "certificate", "certified", "cert", "certs",
    ],
    answer:
      `${g.category} certifications:\n` +
      g.items.map((i) => `• ${i.name} — ${i.issuer}${i.date ? ` (${i.date})` : ""}`).join("\n"),
  })),

  /* ---- awards ---- */
  {
    id: "awards",
    topic: "Awards",
    keywords: ["award", "awards", "achievement", "achievements", "honor", "honour", "patent", "hackathon", "scholarship", "recognition", "won"],
    phrases: ["what awards", "his achievements", "has he won"],
    answer: `${firstName}'s awards & achievements:\n` + awards.map((a) => `• ${a}`).join("\n"),
  },

  /* ---- languages ---- */
  {
    id: "languages-spoken",
    topic: "Languages",
    keywords: ["language", "languages", "speak", "speaks", "bengali", "english", "german", "ielts", "fluent", "multilingual"],
    phrases: ["what languages", "languages he speaks", "does he speak"],
    answer:
      `${firstName} speaks: ` + languages.map((l) => `${l.name} (${l.level})`).join(", ") + `.`,
  },

  /* ============================ PERSONAL SIDE ============================ */
  {
    // Asking about his father (by relationship OR by name) → name + who he is.
    id: "father",
    topic: "Personal",
    keywords: ["father", "dad", "papa", "daddy", "baba", ...personal.family.father.toLowerCase().split(/\s+/)],
    phrases: ["father's name", "his father", "who is his father", "name of his father"],
    answer: `${personal.family.father} is ${firstName}'s father — a ${personal.family.fatherOccupation} by profession.`,
  },
  {
    // Asking about his mother (by relationship OR by name) → name + who she is.
    id: "mother",
    topic: "Personal",
    keywords: ["mother", "mom", "mum", "mommy", "mummy", "maa", ...personal.family.mother.toLowerCase().split(/\s+/)],
    phrases: ["mother's name", "his mother", "who is his mother", "name of his mother"],
    answer: `${personal.family.mother} is ${firstName}'s mother — a ${personal.family.motherOccupation} (housewife).`,
  },
  {
    // Asking about brothers generally → both names as clickable profile links.
    id: "brothers",
    topic: "Personal",
    keywords: ["brother", "brothers", "sibling", "siblings", "bro"],
    phrases: ["his brother", "his brothers", "how many brothers", "does he have a brother"],
    answer:
      `${firstName} has two brothers:\n` +
      personal.family.brothers.map((b) => `• [${b.name}](${b.url}) — ${b.role}`).join("\n"),
  },
  // Recognise each brother BY NAME → "who is Partha Sarathi Banerjee?".
  ...personal.family.brothers.map((b, i) => ({
    id: `brother-${i}`,
    topic: "Personal",
    keywords: b.name.toLowerCase().split(/\s+/),
    answer: `[${b.name}](${b.url}) is one of ${firstName}'s two brothers — ${b.role}.`,
  })),
  {
    // Generic "family" / "parents" → a short overview tying it together.
    id: "family",
    topic: "Personal",
    keywords: ["family", "parents", "parent"],
    phrases: ["his family", "his parents", "about his family"],
    answer:
      `${firstName}'s family: his father ${personal.family.father} (a ${personal.family.fatherOccupation}), ` +
      `his mother ${personal.family.mother} (a ${personal.family.motherOccupation}), ` +
      `and his two brothers ${personal.family.brothers.map((b) => `[${b.name}](${b.url})`).join(" and ")}.`,
  },
  {
    id: "birthday",
    topic: "Personal",
    keywords: ["birthday", "born", "birth", "birthdate", "age", "september", "dob", "celebrate"],
    phrases: ["when is his birthday", "date of birth", "when was he born"],
    answer: `${firstName}'s birthday is on the ${personal.birthday}. 🎂`,
  },
  {
    id: "hobbies",
    topic: "Personal",
    keywords: ["hobby", "hobbies", "free", "fun", "leisure", "spare", "sketch", "sketching", "draw", "drawing", "guitar", "music", "play", "reading", "read", "books", "book", "game", "games", "gaming", "video", "pastime", "outside"],
    phrases: ["his hobbies", "free time", "for fun", "outside of work"],
    answer:
      `Outside of engineering, ${firstName} enjoys ${list(personal.hobbies.map((h) => h.toLowerCase()))}. ` +
      `🎨🎸📚🎮 A nice mix of the creative and the playful.`,
  },
  {
    id: "sports",
    topic: "Personal",
    keywords: ["sport", "sports", "football", "soccer", "martial", "arts", "karate", "swim", "swimming", "fitness", "physical", "athletic", "exercise"],
    phrases: ["does he play sports", "what sports", "is he sporty"],
    answer:
      `${firstName} is into sports too — he likes ${list(personal.sports.plays)}, ` +
      `practices ${list(personal.sports.practices).toLowerCase()}, and ${list(personal.sports.skills).toLowerCase()}. ⚽🥋🏊`,
  },
  {
    id: "passions",
    topic: "Personal",
    keywords: ["love", "loves", "passion", "passionate", "travel", "travelling", "traveling", "trips", "coding", "code", "programming", "enjoy", "enjoys"],
    phrases: ["what does he love", "his passions", "what is he passionate about"],
    answer:
      `Things ${firstName} genuinely loves: ${list(personal.passions.map((p) => p.toLowerCase()))}. ` +
      `He'll happily code for hours, is always up for exploring a new place, and loves cooking. ✈️💻🍳`,
  },
  {
    // Cooking specifically.
    id: "cooking",
    topic: "Personal",
    keywords: ["cook", "cooking", "cooks", "chef", "kitchen", "recipe", "recipes"],
    phrases: ["does he cook", "his cooking"],
    answer: `${firstName} loves cooking — it's one of his favourite things to do. 🍳`,
  },

  /* ---- extended family (by relationship or by name) ---- */
  {
    id: "uncle",
    topic: "Personal",
    keywords: ["uncle", "kaku", "jethu", ...personal.family.uncle.name.toLowerCase().split(/\s+/)],
    phrases: ["his uncle", "paternal uncle", "who is his uncle"],
    answer: `${personal.family.uncle.name} is ${firstName}'s ${personal.family.uncle.relation} — ${personal.family.uncle.detail}.`,
  },
  {
    id: "aunt",
    topic: "Personal",
    keywords: ["aunt", "aunty", "pishi", "bua", ...personal.family.aunt.name.toLowerCase().split(/\s+/)],
    phrases: ["his aunt", "paternal aunt", "who is his aunt", "father's sister"],
    answer: `${personal.family.aunt.name} is ${firstName}'s ${personal.family.aunt.relation} — she ${personal.family.aunt.detail}.`,
  },

  /* ---- friends (general + by name) ---- */
  {
    id: "friends",
    topic: "Personal",
    keywords: ["friend", "friends", "buddy", "buddies", "bestie"],
    phrases: ["his friends", "best friends", "his best friend", "who are his friends"],
    answer:
      `Two of ${firstName}'s best friends in Germany are ` +
      personal.friends.map((f) => `[${f.name}](${f.url})`).join(" and ") + `.`,
  },
  ...personal.friends.map((f, i) => ({
    id: `friend-${i}`,
    topic: "Personal",
    keywords: f.name.toLowerCase().split(/\s+/),
    answer: `[${f.name}](${f.url}) is one of ${firstName}'s best friends (in Germany).`,
  })),

  /* ---- favourites (generic first, then specific) ---- */
  {
    id: "favorites",
    topic: "Personal",
    keywords: ["favorite", "favourite", "favorites", "favourites"],
    phrases: ["his favourites", "his favorites", "what are his favourites"],
    answer:
      `A few of ${firstName}'s favourites — colour: ${personal.favorites.color}; ` +
      `food: ${list(personal.favorites.foods)}; animals: ${list(personal.favorites.animals)}; ` +
      `and he loves ${list(personal.favorites.places.map((p) => p.toLowerCase()))} more than anywhere.`,
  },
  {
    id: "favorite-color",
    topic: "Personal",
    keywords: ["color", "colour", "colors", "colours", "favorite", "favourite"],
    phrases: ["favourite colour", "favorite color"],
    answer: `${firstName}'s favourite colour is ${personal.favorites.color}. 💙`,
  },
  {
    id: "favorite-food",
    topic: "Personal",
    keywords: ["food", "foods", "eat", "eats", "cuisine", "dish", "dishes", "kebab", "kabab", "biriyani", "biryani", "favorite", "favourite"],
    phrases: ["favourite food", "favorite food", "what does he eat", "favourite dish"],
    answer: `${firstName}'s favourite foods are ${list(personal.favorites.foods)}. 🍢`,
  },
  {
    id: "favorite-animal",
    topic: "Personal",
    keywords: ["animal", "animals", "pet", "pets", "dog", "dogs", "horse", "horses", "favorite", "favourite"],
    phrases: ["favourite animal", "favorite animal", "does he like animals"],
    answer: `${firstName}'s favourite animals are ${list(personal.favorites.animals.map((a) => a.toLowerCase()))}. 🐶🐴`,
  },
  {
    id: "favorite-places",
    topic: "Personal",
    keywords: ["mountain", "mountains", "forest", "forests", "nature", "place", "places", "outdoors", "hill", "hills", "favorite", "favourite"],
    phrases: ["favourite place", "mountains or", "nature"],
    answer: `${firstName} loves ${list(personal.favorites.places.map((p) => p.toLowerCase()))} more than anywhere else. 🏔️🌲`,
  },

  /* ---- intellectual & other interests ---- */
  {
    id: "research-interests",
    topic: "Personal",
    keywords: ["research", "psychology", "neuroscience", "history", "ancient", "mythology", "mythologies", "myths", "curious", "topics", "learn"],
    phrases: ["what does he research", "other interests", "besides ai", "apart from ai"],
    answer:
      `Beyond AI, ${firstName} loves researching ${list(personal.interests.research)}. He's endlessly curious.`,
  },
  {
    id: "reading-interests",
    topic: "Personal",
    keywords: ["comic", "comics", "manga", "poem", "poems", "poetry", "story", "stories", "novel", "novels", "author", "authors"],
    phrases: ["what does he read", "what does he like to read", "his reading"],
    answer: `${firstName} loves reading ${list(personal.interests.reading)}.`,
  },
  {
    id: "riding-driving",
    topic: "Personal",
    keywords: ["ride", "riding", "drive", "driving", "bike", "motorbike", "motorcycle", "car", "cars", "vehicle"],
    phrases: ["does he ride", "does he drive", "motorbike", "riding bikes"],
    answer: `${firstName} loves ${list(personal.interests.riding)}. 🏍️🚗`,
  },

  /* ---- leadership ---- */
  {
    id: "leadership",
    topic: "Leadership",
    keywords: ["lead", "leader", "leadership", "led", "team", "teams", "manage", "manager", "management", "managing", "scrum", "jira", "devops", "agile", "liaison", "ams", "cone", "traffic", "simulation"],
    phrases: ["leadership skills", "did he lead", "team lead", "manage a team", "lead a team", "led a team", "ams project", "cone detection", "traffic simulation", "embedded hardware"],
    answer:
      `${personal.leadership.summary}\n` +
      personal.leadership.highlights.map((h) => `• ${h}`).join("\n"),
  },

  {
    id: "personal-overview",
    topic: "Personal",
    keywords: ["personal", "human", "person", "life", "personality", "character", "real"],
    phrases: ["personal life", "the real sandipan", "as a person"],
    answer:
      `Beyond the resume: ${firstName} sketches, plays guitar, reads (comics, manga & poetry), games, and loves cooking. ` +
      `He plays football, practices martial arts, and swims well; loves the mountains, forests, dogs and horses; ` +
      `enjoys riding motorbikes and driving; and is endlessly curious about psychology, neuroscience, history and mythology. ` +
      `Born on the ${personal.birthday}.`,
  },
];

/* ------------------------------------------------ grounding context for LLM */

/**
 * A compact, plain-text fact sheet handed to the optional LLM so its answers
 * stay grounded in the real data. Kept terse to save tokens.
 */
export const groundingContext = [
  `NAME: ${profile.name}`,
  `ROLE: ${profile.role} — ${profile.tagline}`,
  `HEADLINE: ${profile.headline}`,
  `LOCATION: ${profile.location} (from ${profile.origin})`,
  `STATUS: ${profile.status}`,
  `EXPERIENCE: ${profile.yearsExperience} years`,
  `SUMMARY: ${profile.summary}`,
  ``,
  `CONTACT — email: ${contact.email}; phone: ${contact.phone}; github: ${contact.github}; linkedin: ${contact.linkedin}; hackerrank: ${contact.hackerrank}`,
  ``,
  `SKILLS:`,
  ...skillGroups.map((g) => `  - ${g.domain}: ${list(g.skills)}`),
  ``,
  `EXPERIENCE:`,
  ...experience.map((e) => `  - ${e.role} @ ${e.company} (${e.location}, ${e.period}): ${e.points.join(" ")}`),
  ``,
  `PROJECTS:`,
  ...projects.map((p) => `  - ${p.name} (${p.title}): ${p.summary} Stack: ${list(p.stack)}.`),
  ``,
  `THESIS: ${thesis.title} (${thesis.org}). ${thesis.points.join(" ")}`,
  ``,
  `PUBLICATIONS:`,
  ...publications.map((p) => `  - ${p.title} — ${p.venue} (${p.date})`),
  ``,
  `EDUCATION:`,
  ...education.map((e) => `  - ${e.degree}, ${e.school} (${e.period})`),
  ``,
  `CERTIFICATIONS:`,
  ...certificationGroups.map((g) => `  - ${g.category}: ${list(g.items.map((i) => i.name))}`),
  ``,
  `AWARDS: ${list(awards)}`,
  ``,
  `LANGUAGES: ${languages.map((l) => `${l.name} (${l.level})`).join(", ")}`,
  ``,
  `PERSONAL:`,
  `  - Birthday: ${personal.birthday}`,
  `  - Father: ${personal.family.father} (${personal.family.fatherOccupation}); Mother: ${personal.family.mother} (${personal.family.motherOccupation}, housewife)`,
  `  - Brothers (2): ${personal.family.brothers.map((b) => `${b.name} (${b.role}) <${b.url}>`).join("; ")}`,
  `  - Paternal uncle: ${personal.family.uncle.name} — ${personal.family.uncle.detail}`,
  `  - Paternal aunt (father's sister): ${personal.family.aunt.name} — ${personal.family.aunt.detail}`,
  `  - Best friends (in Germany): ${personal.friends.map((f) => `${f.name} <${f.url}>`).join("; ")}`,
  `  - Hobbies: ${list(personal.hobbies)}`,
  `  - Sports — plays: ${list(personal.sports.plays)}; practices: ${list(personal.sports.practices)}; skills: ${list(personal.sports.skills)}`,
  `  - Loves: ${list(personal.passions)}`,
  `  - Favourites — colour: ${personal.favorites.color}; food: ${list(personal.favorites.foods)}; animals: ${list(personal.favorites.animals)}; places: ${list(personal.favorites.places)}`,
  `  - Other interests — researches: ${list(personal.interests.research)}; reads: ${list(personal.interests.reading)}; enjoys: ${list(personal.interests.riding)}`,
  `  - Leadership: ${personal.leadership.summary} ${personal.leadership.highlights.join(" ")}`,
].join("\n");

export { firstName };
