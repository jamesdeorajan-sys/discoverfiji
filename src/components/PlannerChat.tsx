"use client";

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };
type ReferralBtn = { url: string; label: string } | null;

const EXAMPLES = [
  "5-day honeymoon on Denarau",
  "Family week with two kids",
  "Adventure trip, Coral Coast",
  "Yasawa Islands, 4 days",
];

/** Lagi's responses use simple markdown (**bold**, occasional [text](url)
 *  links). The Worker's own widget renders this with a custom parser —
 *  this mirrors that lightly rather than pulling in a full markdown library
 *  for a few patterns. */
function renderLagiText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function PlannerChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [referralBtn, setReferralBtn] = useState<ReferralBtn>(null);
  const [sessionId] = useState(
    () => `discoverfiji_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, isLoading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setIsLoading(true);
    setReferralBtn(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, session_id: sessionId }),
      });
      const data = await res.json();

      const replyText: string =
        data.message ?? "Sorry, I didn't catch that — could you try again?";

      setMessages((cur) => [...cur, { role: "assistant", content: replyText }]);
      if (data.referral_btn) setReferralBtn(data.referral_btn);
    } catch {
      setMessages((cur) => [
        ...cur,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Please WhatsApp us at +61 478 886 145.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-10 w-full max-w-2xl rounded-lg border border-paper/20 bg-depth-light/60 p-2 backdrop-blur">
      {messages.length > 0 && (
        <div
          ref={scrollRef}
          className="mb-2 max-h-80 space-y-3 overflow-y-auto rounded-md bg-depth/40 p-4"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-lg bg-coral px-3 py-2 text-sm text-cream"
                  : "mr-auto max-w-[85%] rounded-lg border-l-2 border-reef-light bg-paper/10 px-3 py-2 text-sm text-paper"
              }
            >
              {m.role === "assistant" ? renderLagiText(m.content) : m.content}
            </div>
          ))}
          {isLoading && (
            <div className="mr-auto flex max-w-[85%] gap-1 rounded-lg border-l-2 border-reef-light bg-paper/10 px-3 py-2">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-reef-light"
                  style={{ animationDelay: `${d * 0.15}s` }}
                />
              ))}
            </div>
          )}
          {referralBtn && (
            <a
              href={referralBtn.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mr-auto block w-fit rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              {referralBtn.label}
            </a>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-3 rounded-md bg-paper px-4 py-4 sm:py-5"
      >
        <CompassIcon className="h-5 w-5 flex-shrink-0 text-depth/70" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What would you like to do in Fiji?"
          disabled={isLoading}
          className="w-full bg-transparent font-body text-base text-inkline placeholder:text-inkline/50 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex-shrink-0 rounded-md bg-coral px-4 py-2 font-display text-sm font-medium text-cream transition hover:bg-coral-light disabled:opacity-50"
        >
          Plan it
        </button>
      </form>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 px-2 pt-3 pb-1">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => send(ex)}
              className="rounded-full border border-paper/25 px-3 py-1.5 font-mono text-xs text-paper/80 transition hover:border-coral hover:text-coral-light"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 4 L13.3 11 L20 12 L13.3 13 L12 20 L10.7 13 L4 12 L10.7 11 Z"
        fill="currentColor"
      />
    </svg>
  );
}
