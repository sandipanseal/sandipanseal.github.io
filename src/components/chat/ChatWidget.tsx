import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Send, X } from "lucide-react";
import { askAgent, type ChatTurn } from "../../lib/agent";
import { firstName } from "../../lib/agent/knowledgeBase";

/* ------------------------------------------------------------------ types */

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const INTRO: Message = {
  id: 0,
  role: "assistant",
  content:
    `Hi! 👋 I'm ${firstName}'s AI assistant. Ask me anything about his work, ` +
    `projects, skills — or what he's like outside of code.`,
};

const STARTERS = [
  "What does Sandipan do?",
  "Show me his projects",
  "What are his hobbies?",
  "Is he available to hire?",
];

// Rotating greetings the bot "says" from its speech bubble while idle.
const GREETINGS = [
  `Hi there! 👋`,
  `Ask me about ${firstName}!`,
  `Curious about his work? 🤖`,
  `I'm here to help! 💬`,
];

/* -------------------------------------------------------- rich text rendering */

// Matches either a markdown link [label](url) or a bare http(s) URL.
const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;

/**
 * Turns an answer string into React nodes, converting markdown links and bare
 * URLs into clickable anchors (e.g. the brothers' profile links). Plain text —
 * including newlines, preserved by `whitespace-pre-line` — passes through.
 */
function renderRich(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;

  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));

    const isMarkdown = Boolean(m[1]);
    let href = isMarkdown ? m[2] : m[3];
    let trailing = "";
    if (!isMarkdown) {
      // Don't swallow sentence punctuation that follows a bare URL.
      const t = href.match(/[.,);!?]+$/);
      if (t) {
        trailing = t[0];
        href = href.slice(0, -trailing.length);
      }
    }

    nodes.push(
      <a
        key={key++}
        href={href}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-accent-soft underline decoration-accent/40 underline-offset-2 transition-colors hover:text-white"
      >
        {isMarkdown ? m[1] : href}
      </a>,
    );
    if (trailing) nodes.push(trailing);
    last = m.index + m[0].length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/* ------------------------------------------------------- animated bot mascot */

/**
 * A little SVG robot that feels alive: the head gently bobs, the antenna tip
 * pulses, and the eyes blink on a loop. Used in the toggle, header, and message
 * avatars so the assistant has one consistent, friendly face.
 */
function AnimatedBot({ size = 30, lively = false }: { size?: number; lively?: boolean }) {
  const blink = {
    animate: { ry: [2.4, 2.4, 0.3, 2.4, 2.4] },
    transition: {
      duration: 3.6,
      repeat: Infinity,
      times: [0, 0.9, 0.94, 0.98, 1],
      ease: "easeInOut" as const,
    },
  };
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      // When lively (the resting toggle), the bot bobs AND periodically does a
      // little "wave" head-tilt so it looks like it's greeting you. Otherwise it
      // just gently bobs.
      animate={lively ? { y: [0, -2, 0, 0, 0], rotate: [0, 0, -16, 14, 0] } : { y: [0, -1.4, 0] }}
      transition={
        lively
          ? { duration: 3, repeat: Infinity, repeatDelay: 1.2, times: [0, 0.25, 0.45, 0.65, 1], ease: "easeInOut" }
          : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
      }
      style={{ transformOrigin: "16px 22px" }}
    >
      {/* antenna */}
      <line x1="16" y1="3.5" x2="16" y2="7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <motion.circle
        cx="16"
        cy="3"
        r="1.7"
        fill="currentColor"
        animate={{ opacity: [1, 0.35, 1], scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "16px 3px" }}
      />
      {/* head */}
      <rect x="5" y="7.5" width="22" height="17.5" rx="6" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.7" />
      {/* ears */}
      <rect x="2.4" y="13.5" width="2.6" height="6" rx="1.3" fill="currentColor" />
      <rect x="27" y="13.5" width="2.6" height="6" rx="1.3" fill="currentColor" />
      {/* eyes (blink) */}
      <motion.ellipse cx="12" cy="16" rx="2.3" ry="2.4" fill="currentColor" {...blink} />
      <motion.ellipse cx="20" cy="16" rx="2.3" ry="2.4" fill="currentColor" {...blink} />
      {/* mouth */}
      <rect x="11.5" y="20.4" width="9" height="1.8" rx="0.9" fill="currentColor" fillOpacity="0.85" />
    </motion.svg>
  );
}

/* ----------------------------------------------------- floating toggle FAB */

function ToggleButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  // 3D tilt toward the cursor on the button itself.
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [12, -12]), { stiffness: 200, damping: 15 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-12, 12]), { stiffness: 200, damping: 15 });
  const ref = useRef<HTMLButtonElement>(null);

  // Cycle the speech-bubble greeting while the chat is closed.
  const [greet, setGreet] = useState(0);
  useEffect(() => {
    if (open) return;
    const id = setInterval(() => setGreet((g) => (g + 1) % GREETINGS.length), 3800);
    return () => clearInterval(id);
  }, [open]);

  function onMove(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }
  function reset() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={reset}
      aria-label={open ? "Close chat" : `Ask about ${firstName}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.6 }}
      whileTap={{ scale: 0.9 }}
      style={{ rotateX, rotateY, transformPerspective: 600, transformStyle: "preserve-3d" }}
      className="group relative flex h-16 w-16 items-center justify-center rounded-full"
    >
      {/* pulsing aura */}
      <span className="absolute inset-0 animate-ping rounded-full bg-accent/30 [animation-duration:2.4s]" />
      <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-accent via-teal to-violet opacity-60 blur-md transition-opacity group-hover:opacity-90" />

      {/* glass core */}
      <span
        style={{ transform: "translateZ(24px)" }}
        className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-accent via-accent-glow to-violet shadow-xl shadow-accent/40"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={26} className="text-white" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-white drop-shadow">
                <AnimatedBot size={32} lively />
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      {/* "saying hi" speech bubble — cycles greetings while closed */}
      <AnimatePresence mode="wait">
        {!open && (
          <motion.span
            key={greet}
            initial={{ opacity: 0, x: 14, y: 6, scale: 0.7 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 14, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="pointer-events-none absolute right-[4.6rem] hidden whitespace-nowrap rounded-2xl rounded-br-sm border border-white/10 bg-ink-700/95 px-3.5 py-1.5 text-sm font-medium text-white/90 shadow-lg backdrop-blur-md sm:block"
          >
            {GREETINGS[greet]}
            {/* little tail pointing at the bot */}
            <span className="absolute -right-1 bottom-2 h-2.5 w-2.5 rotate-45 border-b border-r border-white/10 bg-ink-700/95" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ------------------------------------------------------ typing indicator */

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-white/60"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* --------------------------------------------------------- single bubble */

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`flex w-full items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <span className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-accent to-violet text-white">
          <AnimatedBot size={17} />
        </span>
      )}
      <div
        className={`max-w-[82%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[0.9rem] leading-relaxed shadow-sm ${
          isUser
            ? "rounded-br-md bg-gradient-to-br from-accent to-accent-glow text-white"
            : "rounded-bl-md border border-white/10 bg-white/[0.06] text-white/90 backdrop-blur-md"
        }`}
      >
        {renderRich(message.content)}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------ chat window */

function ChatWindow({ onClose }: { onClose: () => void }) {
  // In-memory only — never persisted. A browser refresh starts a fresh chat,
  // and one visitor's conversation is never visible to another (there's no
  // backend and nothing is stored).
  const [messages, setMessages] = useState<Message[]>([INTRO]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(STARTERS);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(1);

  // Auto-scroll to the newest message / typing indicator.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  // Focus the input when the window opens.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  async function send(text: string) {
    const q = text.trim();
    if (!q || thinking) return;

    const userMsg: Message = { id: idRef.current++, role: "user", content: q };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSuggestions([]);
    setThinking(true);

    // Build history from current messages (excluding the intro) for LLM context.
    const history: ChatTurn[] = messages
      .filter((m) => m.id !== 0)
      .map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: "user", content: q });

    try {
      const reply = await askAgent(q, history);
      setMessages((m) => [
        ...m,
        { id: idRef.current++, role: "assistant", content: reply.answer },
      ]);
      setSuggestions(reply.suggestions);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: idRef.current++,
          role: "assistant",
          content: `Sorry, something went wrong on my end. You can reach ${firstName} directly via the contact section.`,
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <motion.div
      // Springs open from the toggle's corner with a subtle 3D tilt.
      initial={{ opacity: 0, scale: 0.85, y: 30, rotateX: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: 8 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      style={{ transformPerspective: 1200, transformOrigin: "bottom right" }}
      className="flex h-[min(42rem,calc(100vh-7rem))] w-[min(28rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink-800/80 shadow-2xl shadow-black/60 backdrop-blur-2xl"
    >
      {/* animated gradient top edge */}
      <div className="h-1 w-full bg-[linear-gradient(90deg,#6d8bff,#3fd9c8,#b388ff,#6d8bff)] bg-[length:200%_100%] animate-shimmer" />

      {/* header */}
      <header className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="relative">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-white shadow-lg shadow-accent/30">
            <AnimatedBot size={24} />
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-800 bg-teal" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">Ask about {firstName}</p>
          <p className="flex items-center gap-1 text-xs text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" /> Online · AI assistant
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>
      </header>

      {/* messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4 [scrollbar-width:thin]"
      >
        {messages.map((m) => (
          <Bubble key={m.id} message={m} />
        ))}

        {thinking && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-2"
          >
            <span className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-accent to-violet text-white">
              <AnimatedBot size={17} />
            </span>
            <div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] backdrop-blur-md">
              <TypingDots />
            </div>
          </motion.div>
        )}

        {/* suggestion chips */}
        <AnimatePresence>
          {!thinking && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-wrap gap-2 pt-1"
            >
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs text-accent-soft transition-colors hover:border-accent/60 hover:bg-accent/20 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-white/10 bg-white/[0.03] p-3"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${firstName}…`}
          aria-label="Type your message"
          className="flex-1 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:border-accent/50 focus:bg-white/[0.08]"
        />
        <button
          type="submit"
          disabled={!input.trim() || thinking}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-glow text-white shadow-lg shadow-accent/30 transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          <Send size={17} />
        </button>
      </form>
    </motion.div>
  );
}

/* ---------------------------------------------------------- public widget */

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  // Close on Escape for accessibility.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-4 md:bottom-7 md:right-7">
      <AnimatePresence>
        {open && <ChatWindow key="window" onClose={() => setOpen(false)} />}
      </AnimatePresence>
      <ToggleButton open={open} onClick={() => setOpen((o) => !o)} />
    </div>
  );
}
