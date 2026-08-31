from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
from typing import Any


@dataclass(frozen=True)
class IntentSnapshot:
    intent_id: str
    normalized_intent: str
    hash: str


@dataclass(frozen=True)
class IntentComparison:
    same_intent: bool
    drift_score: float
    original_hash: str
    observed_hash: str


def snapshot(intent: str) -> IntentSnapshot:
    normalized = " ".join(intent.lower().split())
    digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
    return IntentSnapshot(
        intent_id=digest[:12],
        normalized_intent=normalized,
        hash=digest,
    )


def compare(original: IntentSnapshot, observed: str) -> IntentComparison:
    current = snapshot(observed)
    same = current.hash == original.hash

    # This is exact identity comparison, not semantic similarity.
    drift = 0.0 if same else 1.0

    return IntentComparison(
        same_intent=same,
        drift_score=drift,
        original_hash=original.hash,
        observed_hash=current.hash,
    )
