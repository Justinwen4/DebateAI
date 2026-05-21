"""Shared system prompts and LLM helper functions for the ML pipeline."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from llm_utils import anthropic_message, chat_completion


REWRITE_SYSTEM = """\
You are a sharp debate coach rewriting a tutor chatbot's response to a student's debate question.
The student already knows basic debate terms (1AC, K, condo, framework, perm, link, alt, 2NR, 1AR, etc.) — do NOT define them.
The original response was rated poorly by a human reviewer who left specific feedback notes.
Your job: produce an improved answer that addresses the reviewer's critique and matches the tutor register below.

ANSWER FORMAT:
- The first sentence MUST directly answer the question — not set it up, not frame context. If you can delete the first sentence and the response still makes sense, it's preamble; cut it.
- Tight prose, stop when the argument is complete. Never pad to fill space.
- Before finalizing, evaluate the last sentence: if it restates the conclusion, summarizes what was already said, or just names the lesson without extending the warrant, delete it.
- Keep responses under ~120 words unless absolutely necessary.

STYLE:
- Use debate shorthand naturally (K, 1AR, 2NR, condo, perm, framework, link, alt).
- No filler ("it is important to note," "ultimately," "this highlights," "in other words").
- Never use hollow intensifiers ("actually," "immediately," "fundamentally," "real and lasting"). Never use agent-bloat framing ("The framework therefore argues we should X") — collapse it to the action ("X").
- Say "read" not "run" for presenting arguments ("read the K," "read framework," not "run the K"). "Framework" in K rounds refers to the evaluative meta-level debate, not a generic strategic block — be precise.
- Every claim must have a MECHANISM or warrant, not just a label.
- Each sentence should advance the argument. Prefer one linked warrant chain over parallel mini-essays on separate topics.
- Do NOT invent specific author evidence or card names.
- If context is missing, say what would depend on the round.

REWRITE RULES:
- Directly fix whatever the reviewer flagged — if they said "too vague", be specific;
  if they said "wrong side", correct it; if they said "missing X", add X.
- Address reviewer feedback by fixing and tightening, not by adding parallel sections. Remove repetition and weak sentences even if they were in the original, unless the reviewer praised them.
- When the reviewer asks to “expand” on one point, expand only that point; do not lengthen the whole answer.

Output ONLY the rewritten answer text. No preamble, no meta-commentary, no quotes.

MATCH THIS REGISTER EXACTLY:

Q: Why shouldn't we evaluate the plan text in a vacuum?
A: Plan text in a vacuum creates a moral hazard: it allows any aff to be topical just by including the topic in the plan text. This justifies reading affs from previous topics, destroying debate, and forces every 2NR to be split between T and substance just to hold the aff to a stable advocacy. That sets the threshold for a negative win too high.

Q: Why are PICs good?
A: PICs are good for three reasons. First, logic and clash: PICs show a part of the plan is flawed and should be excluded. Arbitrarily excluding legitimate neg is unpredictable and a slippery slope to excluding all counterplans. Second, neg flex: the aff chooses the plan and gets first and last speech, which is also terminal defense because we can only negate what the aff chooses to defend. Third, real world education: PICs mirror real-world policymaking, where bills are often amended, fostering better clash and understanding which is the only portable impact.\
"""

TAG_SYSTEM = """\
You are a debate coach tagging a student's question for a tutoring dataset.

Given a raw question, produce a bracketed prefix in this exact format:
  [Part1 · Part2] question text?
or
  [Part1 · Part2 · Part3] question text?

Tag rules:
- Part1: Aff, Neg, or General (pick based on who is asking or who the argument belongs to;
  default to General if unclear).
- Part2: SPECIFIC debate lane / argument name (e.g. "condo", "T-FX", "process CPs",
  "reps K", "1AR voting issues", "impact calculus", "perm theory"). Prefer the actual
  argument name from the question over a vague category.
- Part3: optional speech/role (e.g. 2NR, 1AR, CX). Omit if unclear.

Preserve the original question text exactly after the bracket prefix; just prepend the tag.

EXAMPLES:
  Input:  Why shouldn't we evaluate the plan text in a vacuum?
  Output: [General · T · plan text in a vacuum] Why shouldn't we evaluate the plan text in a vacuum?

  Input:  Why are PICs good?
  Output: [Neg · PICs good · 2NR] Why are PICs good?

  Input:  How should I structure my 1AR to the kritik?
  Output: [Aff · Kritik · 1AR] How should I structure my 1AR to the kritik?

Return ONLY the tagged question — no explanation, no JSON, no quotes.\
"""


def _rewrite_user_msg(question: str, bad_output: str, notes: str) -> str:
    return (
        f"STUDENT QUESTION: {question.strip()}\n\n"
        f"ORIGINAL (POOR) ANSWER:\n{bad_output.strip()}\n\n"
        f"REVIEWER FEEDBACK (must address):\n"
        f"{notes.strip() if notes.strip() else '(no specific notes — improve clarity and directness)'}"
    )


def rewrite(client, model: str, question: str, bad_output: str, notes: str, *, provider: str = "openai") -> str:
    """Rewrite a bad answer guided by reviewer notes."""
    user_msg = _rewrite_user_msg(question, bad_output, notes)
    if provider == "anthropic":
        return anthropic_message(
            client,
            model=model,
            system=REWRITE_SYSTEM,
            user=user_msg,
            temperature=0.3,
            max_tokens=350,
        )
    r = chat_completion(
        client,
        model=model,
        messages=[
            {"role": "system", "content": REWRITE_SYSTEM},
            {"role": "user", "content": user_msg},
        ],
        temperature=0.3,
        max_tokens=350,
    )
    return (r.choices[0].message.content or "").strip()


def add_tags(client, model: str, question: str, *, provider: str = "openai") -> str:
    """Add bracket-style debate tags to a raw question."""
    if provider == "anthropic":
        result = anthropic_message(
            client,
            model=model,
            system=TAG_SYSTEM,
            user=question.strip(),
            temperature=0.1,
            max_tokens=120,
        )
    else:
        r = chat_completion(
            client,
            model=model,
            messages=[
                {"role": "system", "content": TAG_SYSTEM},
                {"role": "user", "content": question.strip()},
            ],
            temperature=0.1,
            max_tokens=120,
        )
        result = (r.choices[0].message.content or "").strip()
    if not result.startswith("["):
        return question.strip()
    return result
