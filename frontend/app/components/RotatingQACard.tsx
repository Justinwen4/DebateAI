"use client";

import { useEffect, useMemo, useState } from "react";

export type SampleQA = {
  question: string;
  answer: string;
};

type RotatingQACardProps = {
  items: SampleQA[];
  intervalMs?: number;
};

export default function RotatingQACard({ items, intervalMs = 8000 }: RotatingQACardProps) {
  const safeItems = useMemo(() => (items.length > 0 ? items : [{ question: "", answer: "" }]), [items]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (safeItems.length <= 1) return;

    let fadeTimer: number | undefined;
    const cycleTimer = window.setInterval(() => {
      setIsVisible(false);
      fadeTimer = window.setTimeout(() => {
        setActiveIndex((current) => (current + 1) % safeItems.length);
        setIsVisible(true);
      }, 180);
    }, intervalMs);

    return () => {
      window.clearInterval(cycleTimer);
      if (fadeTimer) {
        window.clearTimeout(fadeTimer);
      }
    };
  }, [intervalMs, safeItems.length]);

  const item = safeItems[activeIndex];

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-md)] sm:p-6">
      <p className="text-xl leading-snug text-foreground sm:text-2xl">{item.question}</p>

      <div
        className={`mt-5 rounded-2xl border border-border-subtle bg-background px-5 py-4 text-base leading-relaxed text-foreground transition-opacity duration-300 ${
          isVisible ? "qa-enter" : "qa-exit"
        }`}
      >
        {item.answer}
      </div>

      <div className="mt-5 flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <span
            key={rating}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-base font-medium text-muted"
            aria-hidden
          >
            {rating}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <input
          type="text"
          placeholder="Notes (optional)"
          readOnly
          className="h-11 w-full rounded-xl border border-border bg-background px-4 text-base text-muted outline-none"
        />
        <button
          type="button"
          disabled
          className="h-11 rounded-xl bg-border px-6 text-base font-semibold text-background disabled:cursor-not-allowed disabled:opacity-80"
        >
          Send
        </button>
      </div>
    </section>
  );
}
