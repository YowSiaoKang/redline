import { useEffect, useRef, useState } from "react";
import { buildAskPrompt } from "../lib/ask";
import { copyToClipboard } from "../lib/clipboard";
import type { Clause } from "../state/types";

export function ClauseChat({ clause }: { clause: Clause }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const lastSeenCount = useRef(clause.chat.length);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (clause.chat.length > lastSeenCount.current) {
      setOpen(true);
    }
    lastSeenCount.current = clause.chat.length;
  }, [clause.chat.length]);

  const ask = async () => {
    const done = await copyToClipboard(buildAskPrompt(clause));
    if (!done) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="chat">
      <div className="chat__bar">
        <button
          type="button"
          className="chat__toggle"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open
            ? "Hide discussion"
            : clause.chat.length > 0
              ? `Discussion (${clause.chat.length})`
              : "Discussion"}
        </button>
        <button
          type="button"
          className="chat__ask"
          aria-live="polite"
          onClick={ask}
        >
          {copied ? "Copied" : "Ask about this"}
        </button>
      </div>
      {open && (
        <ul className="chat__thread">
          {clause.chat.length === 0 && (
            <li className="chat__empty">
              No notes yet &mdash; your agent&rsquo;s notes and your verdicts land here.
            </li>
          )}
          {clause.chat.map((message, index) => (
            <li key={index} className={`chat__msg chat__msg--${message.role}`}>
              <span className="chat__role">{message.role === "agent" ? "Agent" : "You"}</span>
              <span className="chat__text">{message.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
