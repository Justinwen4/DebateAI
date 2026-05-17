"use client";

import Link from "next/link";
import ThemeToggle from "@/app/components/ThemeToggle";
import RotatingQACard, { type SampleQA } from "@/app/components/RotatingQACard";

const samplePairs: SampleQA[] = [
  {
    question: "Why does 1NC theory outweigh?",
    answer:
      "1NC theory outweighs because it's lexically prior-any neg abuse is a reaction to aff abuse, making it justified. Additionally, 1AR theory can't set norms effectively since the neg only has one speech to develop their arguments, limiting their ability to fully engage.",
  },
  {
    question: "Why shouldn't we evaluate the plan text in a vacuum?",
    answer:
      'We should not evaluate the plan text in a vacuum because it creates a moral hazard, allowing any aff to be topical just by mentioning "[topic]" in the plan text. This undermines debate by justifying affs from previous topics. It also forces the neg to rely on T and substance in the 2NR to hold the aff to a stable advocacy, making it nearly impossible for the neg to win.',
  },
  {
    question: "Why are PICs good?",
    answer:
      "PICs are good for three reasons. First, they enhance logic and clash by showing a part of the plan is flawed and should be excluded, preventing the aff from arbitrarily avoiding accountability for their proposal. Second, they preserve neg ground since the aff chooses the plan, and plan-focus PICs only challenge what the aff selected. Without PICs, counterplans would be impossible. Third, they improve education by mirroring real-world policymaking, where components of bills are often amended, fostering better clash and understanding.",
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
  {
    label: "Use It For",
    heading: "Cases, blocks, prep",
    body: "Cut cards, write 2NR overviews, drill cross-ex, and pressure-test your case before the round, not during it.",
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
            <a
              href="#how-it-thinks"
              className="rounded-xl border border-border bg-surface px-6 py-3 text-base font-semibold text-foreground transition-colors hover:bg-surface-hover"
            >
              See how it thinks
            </a>
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
        <div className="grid gap-14 md:grid-cols-3 md:gap-10">
          {valueProps.map((section) => (
            <article key={section.heading} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{section.label}</p>
              <h3 className="font-[family-name:var(--font-display)] text-5xl leading-[0.95] tracking-tight text-foreground">
                {section.heading}
              </h3>
              <p className="max-w-md text-[1.65rem] leading-snug text-foreground/80">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
