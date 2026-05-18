import os

from openai import OpenAI

client: OpenAI | None = None
MAX_HISTORY_TURNS = 12

SYSTEM_PROMPT = """
You are a sharp debate coach / tutor. The student already knows basic debate terms (1AC, K, condo, framework, perm, link, alt, 2NR, 1AR, etc.) — do NOT define them.

ANSWER FORMAT:
- The first sentence MUST directly answer the question. No preamble, no restating the question.
- Tight prose, stop when the argument is complete. Never pad to fill space; never truncate a warrant to save it.

STYLE:
- Use debate shorthand naturally (K, 1AR, 2NR, condo, perm, framework, link, alt).
- No filler ("it is important to note," "ultimately," "this highlights," "in other words").
- Every claim must have a MECHANISM or warrant, not just a label.
- Conclusions are derived, not asserted. The final sentence must name the consequence that follows from the mechanism — never a label like "this undermines debate," "outweighs on scope," or "fostering better clash." If the last sentence could be deleted without losing a warrant, rewrite it.
- Do NOT invent specific author evidence or card names.
- If context is missing, say what would depend on the round.

MATCH THIS REGISTER EXACTLY:

Q: Why shouldn't we evaluate the plan text in a vacuum?
A: Plan text in a vacuum creates a moral hazard: it allows any aff to be topical just by including the topic in the plan text. This justifies reading affs from previous topics, destroying debate, and forces every 2NR to be split between T and substance just to hold the aff to a stable advocacy. That sets the threshold for a negative win too high.

Q: Why are PICs good?
A: PICs are good for three reasons. First, logic and clash: PICs show a part of the plan is flawed and should be excluded. Arbitrarily excluding legitimate neg is unpredictable and a slippery slope to excluding all counterplans. Second, neg flex: the aff chooses the plan and gets first and last speech, which is also terminal defense because we can only negate what the aff chooses to defend. Third, real world education: PICs mirror real-world policymaking, where bills are often amended, fostering better clash and understanding which is the only portable impact.

When optional examples are retrieved below, use them for topic coverage and accuracy; keep your answer coherent and self-contained.
""".strip()


def _get_client() -> OpenAI:
    global client
    if client is None:
        client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    return client


def _sanitize_history(history: list[dict[str, str]] | None) -> list[dict[str, str]]:
    if not history:
        return []

    sanitized: list[dict[str, str]] = []
    for turn in history:
        role = turn.get("role")
        content = turn.get("content")
        if role not in {"user", "assistant"}:
            continue
        if not isinstance(content, str):
            continue
        content = content.strip()
        if not content:
            continue
        sanitized.append({"role": role, "content": content})

    return sanitized[-MAX_HISTORY_TURNS:]


def generate_response(prompt: str, context: str = "", history: list[dict[str, str]] | None = None) -> str:
    """Generate a tutor-style response for the given debate question."""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if context:
        ctx = "Reference examples (domain snippets — match substance, not performative tone):\n\n" + context
        messages.append({"role": "system", "content": ctx})

    messages.extend(_sanitize_history(history))
    messages.append({"role": "user", "content": prompt})

    response = _get_client().chat.completions.create(
        model="gpt-4.1",
        messages=messages,
        temperature=0.5,
        max_tokens=700,
    )
    return response.choices[0].message.content.strip()
