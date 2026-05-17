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
  const [isPaused, setIsPaused] = useState(false);

  const setCardIndex = (index: number) => {
    setIsVisible(false);
    window.setTimeout(() => {
      setActiveIndex(index);
      setIsVisible(true);
    }, 120);
  };

  useEffect(() => {
    if (safeItems.length <= 1 || isPaused) return;

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
  }, [intervalMs, isPaused, safeItems.length]);

  const item = safeItems[activeIndex];

  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-md)] sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {safeItems.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setIsPaused(true);
                setCardIndex(index);
              }}
              className={`h-8 min-w-8 rounded-lg border px-2 text-xs font-semibold transition-colors ${
                activeIndex === index
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted hover:bg-surface-hover"
              }`}
              aria-label={`Show sample ${index + 1}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIsPaused((value) => !value)}
          className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-hover"
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>

      <p className="text-lg leading-snug text-foreground sm:text-xl">{item.question}</p>

      <div
        className={`mt-4 rounded-2xl border border-border-subtle bg-background px-4 py-3 text-sm leading-relaxed text-foreground/90 transition-opacity duration-300 sm:text-base ${
          isVisible ? "qa-enter" : "qa-exit"
        }`}
      >
        {item.answer}
      </div>

      <div className="mt-4 flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <span
            key={rating}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-sm font-medium text-muted"
            aria-hidden
          >
            {rating}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Notes (optional)"
          readOnly
          className="h-10 flex-1 rounded-xl border border-border bg-background px-3.5 text-sm text-muted outline-none"
        />
        <button
          type="button"
          disabled
          className="h-10 rounded-xl bg-border px-5 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-80"
        >
          Send
        </button>
        <span className="text-sm font-medium text-foreground/80">Cancel</span>
      </div>
    </section>
  );
}
