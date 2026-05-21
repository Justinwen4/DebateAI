"use client";

import Link from "next/link";
import ThemeToggle from "@/app/components/ThemeToggle";
import RotatingQACard, { type SampleQA } from "@/app/components/RotatingQACard";

const samplePairs: SampleQA[] = [
  {
    question: "Why shouldn't we evaluate the plan text in a vacuum?",
    answer:
      "Plan text in a vacuum creates a moral hazard: it allows any aff to be topical just by including the topic in the plan text. That justifies reading affs from previous topics, destroying debate, and forces every 2NR to be split between T and substance just to hold the aff to a stable advocacy. That sets the threshold for a negative win too high.",
  },
  {
    question: "Why are PICs good?",
    answer:
      "PICs are good for three reasons. First, logic and clash: PICs show a part of the plan is flawed and should be excluded. Arbitrarily excluding legitimate neg offense is unpredictable and a slippery slope to excluding all counterplans. Second, neg flex: the aff chooses the plan and gets first and last speech advantage. That's also terminal defense because we can only negate what the aff chooses to defend. Third, real world education: PICs mirror real-world policymaking, where bills are often amended, fostering better clash and understanding which is the only portable impact.",
  },
  {
    question: "Why does 1NC theory outweigh?",
    answer:
      "1NC theory outweighs because it's lexically prior: any neg abuse is a reaction to aff abuse. Additionally, both sides have 2 speeches to rigorously test 1NC theory whereas the negative only has one speech to test 1AR theory. That proves 1AR theory is structurally aff-biased, making it impossible to assess the legitimacy of their abuse story.",
  },
];

const valueProps = [
  {
    label: "Founder Logic",
    heading: "Circuit Experience",
    body: "Built by debaters with deep TOC-level experience.",
  },
  {
    label: "Coverage",
    heading: "Conceptual Grasp",
    body: "Moral philosophy, Kritiks, T/Theory - the technical vocabulary, not generic AI hand-waving.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-full bg-background text-foreground">
      <header className="border-b border-border-subtle bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-[12px] font-semibold text-background">
              D
            </div>
            <span className="text-[15px] font-semibold tracking-tight">DebateAI</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-14 md:grid-cols-[1.05fr_1fr] md:items-center md:py-20">
        <div className="space-y-7">
          <p className="inline-flex items-center rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Trained on circuit-level rounds
          </p>

          <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl">
            The AI that's <span className="text-accent">actually intelligent.</span>
          </h1>

          <p className="max-w-xl text-[1.1rem] leading-relaxed text-foreground/80">
            DebateAI is fluent in Lincoln-Douglas debate, trained on data from top circuit debaters so it actually
            thinks like one.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-foreground px-6 py-3 text-base font-semibold text-background transition-opacity hover:opacity-90"
            >
              Get early access
            </Link>
          </div>
        </div>

        <div id="how-it-thinks">
          <RotatingQACard items={samplePairs} />
        </div>
      </section>

      <section className="border-y border-border-subtle bg-surface/60">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-16 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Improvement Loop</p>
            <h2 className="max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-tight tracking-tight text-foreground sm:text-[3.2rem]">
              Rate responses so the AI improves for future answers.
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-foreground/80">
            Every response can be rated with quick feedback. Those ratings shape what DebateAI prioritizes next, so
            the model steadily improves for you and future debaters.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-14 md:grid-cols-2 md:gap-10">
          {valueProps.map((section) => (
            <article key={section.heading} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{section.label}</p>
              <h3 className="font-[family-name:var(--font-display)] text-5xl leading-[0.95] tracking-tight text-foreground">
                {section.heading}
              </h3>
              <p className="max-w-md text-[1.1rem] leading-relaxed text-foreground/80 sm:text-[1.25rem]">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
