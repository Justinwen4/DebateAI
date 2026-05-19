#!/usr/bin/env python3
"""
Pattern-based audit of dataset.tutor.jsonl.

Flags entries with known quality issues: conclusion labels, question restatements,
filler phrases, and structural problems. Outputs a CSV sorted by flag count so the
worst entries are at the top.

Usage (from repo root):
    python ml/audit_dataset.py
    python ml/audit_dataset.py --input ml/dataset.tutor.jsonl --out ml/audit_report.csv
    python ml/audit_dataset.py --flagged-only   # omit clean entries
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# Pattern definitions
# Each check is (id, description, fn(output_text) -> bool  [True = flagged])
# ---------------------------------------------------------------------------

def _first_sentence(text: str) -> str:
    """Return the first sentence of text."""
    m = re.split(r"(?<=[.!?])\s", text.strip(), maxsplit=1)
    return m[0] if m else text.strip()


def _last_sentence(text: str) -> str:
    parts = re.split(r"(?<=[.!?])\s", text.strip())
    return parts[-1] if parts else text.strip()


CONCLUSION_LABELS: list[str] = [
    "this undermines",
    "this ensures",
    "this demonstrates",
    "this shows that",
    "this allows",
    "this highlights",
    "this means that",
    "which outweighs",
    "outweighs on scope",
    "outweighs on magnitude",
    "outweighs on probability",
    "fostering better clash",
    "fostering better understanding",
    "provides better",
    "which is best for",
    "making it nearly impossible",
    "thus outweighs",
    "therefore outweighs",
]

FILLER_PHRASES: list[str] = [
    "it is important to note",
    "it's important to note",
    "ultimately,",
    "in other words",
    "this highlights",
    "this demonstrates",
    "this is because",
    "in conclusion",
    "overall,",
    "as a result,",
    "in summary",
]

RESTATEMENT_OPENERS: list[re.Pattern] = [
    re.compile(r"^we should(n'?t)?\b", re.I),
    re.compile(r"^the (aff|neg|affirmative|negative) should(n'?t)?\b", re.I),
    re.compile(r"^(pics?|conditionality|counterplans?|topicality|theory|permutations?) (are|is) (good|bad|legitimate|illegitimate|important) because\b", re.I),
    re.compile(r"^(judge ?kick|intrinsic perms?|process (cps?|counterplans?)) (is|are) (legitimate|illegitimate|good|bad) because\b", re.I),
]


def check_conclusion_label(output: str) -> tuple[bool, str]:
    low = output.lower()
    hits = [p for p in CONCLUSION_LABELS if p in low]
    return bool(hits), "; ".join(hits)


def check_filler(output: str) -> tuple[bool, str]:
    low = output.lower()
    hits = [p for p in FILLER_PHRASES if p in low]
    return bool(hits), "; ".join(hits)


def check_restatement_opener(output: str) -> tuple[bool, str]:
    first = _first_sentence(output)
    for pat in RESTATEMENT_OPENERS:
        if pat.match(first.strip()):
            return True, first[:80]
    return False, ""


def check_terminal_label(output: str) -> tuple[bool, str]:
    """Last sentence is pure assertion with no mechanism (short and contains no 'because'/'so'/'which means')."""
    last = _last_sentence(output).strip()
    is_short = len(last.split()) <= 12
    has_no_mechanism = not re.search(r"\b(because|since|so that|which means|meaning|so the|that means)\b", last, re.I)
    # Only flag if short AND no mechanism AND ends with a label-ish phrase
    label_endings = re.search(
        r"(outweighs|undermines debate|for fairness|better education|neg (flex|ground)|for neg|for aff|and understanding|and clarity)[\.\s]*$",
        last, re.I
    )
    flagged = is_short and has_no_mechanism and bool(label_endings)
    return flagged, last[:80] if flagged else ""


def check_word_count(output: str) -> tuple[bool, str]:
    wc = len(output.split())
    if wc < 35:
        return True, f"{wc} words (too sparse)"
    if wc > 140:
        return True, f"{wc} words (possibly padded)"
    return False, f"{wc} words"


def check_defines_basic_terms(output: str) -> tuple[bool, str]:
    """Flags outputs that define terms the student should already know."""
    low = output.lower()
    definitions = [
        "which means ", "which is when ", "defined as ", "refers to ",
        "is a type of ", "is a form of ", "is when the neg ", "is when the aff ",
        "(also known as", "(sometimes called",
    ]
    hits = [d for d in definitions if d in low]
    return bool(hits), "; ".join(hits)


CHECKS: list[tuple[str, str, callable]] = [
    ("conclusion_label",    "Conclusion label (no mechanism)",       check_conclusion_label),
    ("filler_phrase",       "Filler phrase",                         check_filler),
    ("restatement_opener",  "Opens by restating the question",       check_restatement_opener),
    ("terminal_label",      "Last sentence is a bare assertion",     check_terminal_label),
    ("word_count",          "Word count out of range",               check_word_count),
    ("defines_basic_terms", "Defines terms student should know",     check_defines_basic_terms),
]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def audit(input_path: Path) -> list[dict]:
    rows = []
    with input_path.open() as f:
        for lineno, raw in enumerate(f, start=1):
            raw = raw.strip()
            if not raw:
                continue
            try:
                entry = json.loads(raw)
            except json.JSONDecodeError:
                rows.append({
                    "line": lineno,
                    "input": raw[:80],
                    "output": "",
                    "flag_count": 1,
                    "flags": "PARSE_ERROR",
                    "details": raw[:120],
                    "word_count": 0,
                })
                continue

            output = entry.get("output", "")
            inp = entry.get("input", "")
            results: list[str] = []
            detail_parts: list[str] = []

            for check_id, label, fn in CHECKS:
                flagged, detail = fn(output)
                if flagged:
                    results.append(check_id)
                    if detail:
                        detail_parts.append(f"[{check_id}] {detail}")

            # word count always captured for the report even if not flagged
            wc = len(output.split())

            rows.append({
                "line": lineno,
                "input": inp,
                "output": output,
                "flag_count": len(results),
                "flags": "; ".join(results),
                "details": " | ".join(detail_parts),
                "word_count": wc,
            })

    return rows


def write_csv(rows: list[dict], out_path: Path, flagged_only: bool) -> None:
    rows = sorted(rows, key=lambda r: -r["flag_count"])
    if flagged_only:
        rows = [r for r in rows if r["flag_count"] > 0]

    fieldnames = ["line", "flag_count", "flags", "word_count", "details", "input", "output"]
    with out_path.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def print_summary(rows: list[dict]) -> None:
    total = len(rows)
    flagged = [r for r in rows if r["flag_count"] > 0]
    multi = [r for r in flagged if r["flag_count"] > 1]

    print(f"\nDataset entries : {total}")
    print(f"Flagged         : {len(flagged)}  ({100*len(flagged)/total:.1f}%)")
    print(f"Multi-flag      : {len(multi)}  ({100*len(multi)/total:.1f}%)")

    from collections import Counter
    counter: Counter = Counter()
    for r in flagged:
        for flag in r["flags"].split("; "):
            if flag:
                counter[flag] += 1

    print("\nFlag breakdown:")
    for flag, count in counter.most_common():
        label = next((l for cid, l, _ in CHECKS if cid == flag), flag)
        print(f"  {count:4d}  {label}")

    print("\nTop 10 worst entries:")
    for r in sorted(flagged, key=lambda x: -x["flag_count"])[:10]:
        q = r["input"][:70]
        print(f"  line {r['line']:4d}  [{r['flag_count']} flags]  {q}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Pattern-audit dataset.tutor.jsonl")
    parser.add_argument("--input", default="ml/dataset.tutor.jsonl")
    parser.add_argument("--out", default="ml/audit_report.csv")
    parser.add_argument("--flagged-only", action="store_true", help="Omit clean entries from CSV")
    args = parser.parse_args()

    input_path = Path(args.input)
    out_path = Path(args.out)

    if not input_path.exists():
        sys.exit(f"Input not found: {input_path}")

    rows = audit(input_path)
    write_csv(rows, out_path, flagged_only=args.flagged_only)
    print_summary(rows)
    print(f"\nFull report written to: {out_path}")


if __name__ == "__main__":
    main()
