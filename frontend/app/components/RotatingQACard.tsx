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
  const [isAnimating, setIsAnimating] = useState(false);

  const setCardIndex = (index: number) => {
    if (isAnimating || index === activeIndex) return;
    setIsAnimating(true);
    setIsVisible(false);
    window.setTimeout(() => {
      setActiveIndex(index);
      setIsVisible(true);
      setIsAnimating(false);
    }, 180);
  };

  const goToPrevious = () => {
    const nextIndex = (activeIndex - 1 + safeItems.length) % safeItems.length;
    setCardIndex(nextIndex);
  };

  const goToNext = () => {
    const nextIndex = (activeIndex + 1) % safeItems.length;
    setCardIndex(nextIndex);
  };

  useEffect(() => {
    if (safeItems.length <= 1) return;
    const cycleTimer = window.setInterval(() => {
      setCardIndex((activeIndex + 1) % safeItems.length);
    }, intervalMs);

    return () => window.clearInterval(cycleTimer);
  }, [activeIndex, intervalMs, safeItems.length]);

  const item = safeItems[activeIndex];

  return (
    <section className="flex h-[540px] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-lg)] ring-1 ring-foreground/5">
      <div className="flex items-center justify-between border-b border-border bg-surface-hover/60 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-border" />
          <div className="h-2.5 w-2.5 rounded-full bg-border" />
          <div className="h-2.5 w-2.5 rounded-full bg-border" />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrevious}
            className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background text-muted transition-colors hover:border-accent/40 hover:text-accent"
            aria-label="Show previous sample response"
          >
            <span aria-hidden>&larr;</span>
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background text-muted transition-colors hover:border-accent/40 hover:text-accent"
            aria-label="Show next sample response"
          >
            <span aria-hidden>&rarr;</span>
          </button>
        </div>
      </div>

      <div className="flex h-full flex-col gap-4 bg-background p-5">
        <div className="flex-1 space-y-4">
          <p
            className={`px-1 text-[14px] leading-snug text-foreground transition-all duration-300 ${
              isVisible ? "qa-enter translate-x-0" : "qa-exit -translate-x-2"
            }`}
          >
            {item.question}
          </p>

          <div className="rounded-lg border border-border bg-surface p-5">
            <p
              className={`text-[13px] leading-relaxed text-foreground/90 transition-all duration-300 ${
                isVisible ? "qa-enter translate-x-0" : "qa-exit -translate-x-2"
              }`}
            >
              {item.answer}
            </p>

            <div className="mt-5 flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-md border border-border text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent"
                >
                  {rating}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                placeholder="Notes (optional)"
                readOnly
                className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-muted outline-none"
              />
              <button
                type="button"
                disabled
                className="h-11 rounded-md bg-border px-5 text-sm font-semibold text-background disabled:cursor-not-allowed"
              >
                Send
              </button>
              <span className="text-sm text-foreground/80">Cancel</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
          Ask a debate question...
        </div>
      </div>
    </section>
  );
}
