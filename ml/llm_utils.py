#!/usr/bin/env python3
"""Shared OpenAI call helper with exponential-backoff retry."""
from __future__ import annotations

import sys
import time


def chat_completion(client, *, max_retries: int = 3, base_delay: float = 2.0, **kwargs):
    """Call client.chat.completions.create with exponential-backoff retry on transient errors."""
    from openai import APIConnectionError, APIStatusError, APITimeoutError, RateLimitError

    last_exc: BaseException | None = None
    for attempt in range(max_retries + 1):
        try:
            return client.chat.completions.create(**kwargs)
        except (RateLimitError, APIConnectionError, APITimeoutError) as e:
            last_exc = e
            if attempt < max_retries:
                delay = base_delay * (2**attempt)
                print(
                    f"  ! OpenAI {type(e).__name__}, retrying in {delay:.0f}s"
                    f" (attempt {attempt + 1}/{max_retries})…",
                    file=sys.stderr,
                )
                time.sleep(delay)
        except APIStatusError as e:
            if e.status_code == 429 and attempt < max_retries:
                last_exc = e
                delay = base_delay * (2**attempt)
                print(
                    f"  ! Rate limited (429), retrying in {delay:.0f}s"
                    f" (attempt {attempt + 1}/{max_retries})…",
                    file=sys.stderr,
                )
                time.sleep(delay)
            else:
                raise
    assert last_exc is not None
    raise last_exc


def anthropic_message(
    client,
    *,
    model: str,
    system: str,
    user: str,
    temperature: float,
    max_tokens: int,
    max_retries: int = 3,
    base_delay: float = 2.0,
) -> str:
    """Call Anthropic messages API with exponential-backoff retry."""
    from anthropic import APIConnectionError, APIStatusError, APITimeoutError, RateLimitError

    last_exc: BaseException | None = None
    for attempt in range(max_retries + 1):
        try:
            msg = client.messages.create(
                model=model,
                max_tokens=max_tokens,
                system=system,
                messages=[{"role": "user", "content": user}],
                temperature=temperature,
            )
            parts = [b.text for b in msg.content if b.type == "text"]
            return "".join(parts).strip()
        except (RateLimitError, APIConnectionError, APITimeoutError) as e:
            last_exc = e
            if attempt < max_retries:
                delay = base_delay * (2**attempt)
                print(
                    f"  ! Anthropic {type(e).__name__}, retrying in {delay:.0f}s"
                    f" (attempt {attempt + 1}/{max_retries})…",
                    file=sys.stderr,
                )
                time.sleep(delay)
        except APIStatusError as e:
            if e.status_code == 429 and attempt < max_retries:
                last_exc = e
                delay = base_delay * (2**attempt)
                print(
                    f"  ! Rate limited (429), retrying in {delay:.0f}s"
                    f" (attempt {attempt + 1}/{max_retries})…",
                    file=sys.stderr,
                )
                time.sleep(delay)
            else:
                raise
    assert last_exc is not None
    raise last_exc
