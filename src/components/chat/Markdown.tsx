import type { ReactNode } from "react";

/**
 * A small, dependency-free markdown renderer for the chat assistant's replies.
 *
 * The agent (especially the optional LLM path) answers in markdown — headings,
 * **bold**, *italic*, `code`, fenced code blocks, bullet/numbered lists, block
 * quotes, and [links](url). This turns that into nicely styled React nodes that
 * match the dark-glass chat theme, instead of showing raw `*`/`#`/`` ` `` chars.
 *
 * It is intentionally lightweight (no parser dependency): it handles the block
 * and inline constructs a short chat reply realistically uses, and falls back to
 * rendering anything it doesn't recognise as plain text — so it never breaks.
 */

/* ----------------------------------------------------------------- inline */

// Inline tokens, checked in priority order. Code spans come first so markdown
// inside them isn't re-parsed; links before emphasis so URLs stay intact.
//
// Kept as a source string (not a shared RegExp): `inline()` recurses into the
// text of **bold**/*italic* spans, and a single global-flag RegExp shares one
// mutable `lastIndex` across those nested calls. The inner call resets it to 0,
// so the outer loop re-matches the same token forever — an infinite loop that
// exhausts memory. A fresh RegExp per call gives each level its own state.
const INLINE_SRC =
  "(`[^`]+`)|(\\*\\*([^*]+)\\*\\*|__([^_]+)__)|(\\*([^*\\n]+)\\*|_([^_\\n]+)_)|(\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\s)]+)\\))|(https?:\\/\\/[^\\s]+)";

function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-accent-soft underline decoration-accent/40 underline-offset-2 transition-colors hover:text-white"
    >
      {children}
    </a>
  );
}

/** Parse inline markdown (emphasis, code, links, bare URLs) into React nodes. */
function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  // Fresh instance per call so recursive calls don't clobber a shared lastIndex.
  const re = new RegExp(INLINE_SRC, "g");

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));

    if (m[1]) {
      // `inline code`
      nodes.push(
        <code
          key={key++}
          className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.82em] text-accent-soft"
        >
          {m[1].slice(1, -1)}
        </code>,
      );
    } else if (m[2]) {
      // **bold** / __bold__
      nodes.push(
        <strong key={key++} className="font-semibold text-white">
          {inline(m[3] ?? m[4] ?? "")}
        </strong>,
      );
    } else if (m[5]) {
      // *italic* / _italic_
      nodes.push(
        <em key={key++} className="italic">
          {inline(m[6] ?? m[7] ?? "")}
        </em>,
      );
    } else if (m[8]) {
      // [label](url)
      nodes.push(
        <Link key={key++} href={m[10]}>
          {m[9]}
        </Link>,
      );
    } else if (m[11]) {
      // bare http(s) URL — keep trailing sentence punctuation outside the link
      let href = m[11];
      let trailing = "";
      const t = href.match(/[.,);!?]+$/);
      if (t) {
        trailing = t[0];
        href = href.slice(0, -trailing.length);
      }
      nodes.push(
        <Link key={key++} href={href}>
          {href}
        </Link>,
      );
      if (trailing) nodes.push(trailing);
    }

    last = m.index + m[0].length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/* ------------------------------------------------------------------ block */

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "code"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; lines: string[] }
  | { type: "p"; text: string };

/** Group raw lines into block-level constructs. */
function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // blank line — block separator
    if (!line.trim()) {
      i++;
      continue;
    }

    // fenced code block ```
    const fence = line.match(/^\s*```/);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) body.push(lines[i++]);
      i++; // skip closing fence
      blocks.push({ type: "code", text: body.join("\n") });
      continue;
    }

    // heading # .. ######
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2].trim() });
      i++;
      continue;
    }

    // unordered list (- , * , + )
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // ordered list (1. , 2) )
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // blockquote
    if (/^\s*>\s?/.test(line)) {
      const qlines: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        qlines.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", lines: qlines });
      continue;
    }

    // paragraph — consecutive non-blank, non-block lines (soft-wrapped)
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*```/.test(lines[i]) &&
      !/^#{1,6}\s+/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", text: para.join("\n") });
  }

  return blocks;
}

const HEADING_CLASS: Record<number, string> = {
  1: "text-base font-semibold text-white",
  2: "text-[0.95rem] font-semibold text-white",
  3: "text-sm font-semibold text-white/95",
  4: "text-sm font-semibold text-white/90",
  5: "text-sm font-semibold text-white/85",
  6: "text-sm font-semibold text-white/80",
};

/** Render markdown text into themed React nodes for a chat bubble. */
export default function Markdown({ text }: { text: string }) {
  const blocks = parseBlocks(text);

  return (
    <div className="space-y-2">
      {blocks.map((b, idx) => {
        switch (b.type) {
          case "heading":
            return (
              <p key={idx} className={HEADING_CLASS[b.level]}>
                {inline(b.text)}
              </p>
            );
          case "code":
            return (
              <pre
                key={idx}
                className="overflow-x-auto rounded-lg border border-white/10 bg-black/30 p-3 [scrollbar-width:thin]"
              >
                <code className="font-mono text-[0.8rem] leading-relaxed text-white/85">
                  {b.text}
                </code>
              </pre>
            );
          case "ul":
            return (
              <ul key={idx} className="ml-1 list-disc space-y-1 pl-4 marker:text-accent/70">
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={idx} className="ml-1 list-decimal space-y-1 pl-4 marker:text-accent/70">
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it)}</li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote
                key={idx}
                className="border-l-2 border-accent/50 pl-3 text-white/75 italic"
              >
                {b.lines.map((l, j) => (
                  <p key={j}>{inline(l)}</p>
                ))}
              </blockquote>
            );
          default:
            return (
              <p key={idx} className="whitespace-pre-line">
                {inline(b.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
