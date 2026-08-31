from __future__ import annotations

from dataclasses import dataclass
from typing import FrozenSet


@dataclass(frozen=True)
class CapabilityDiff:
    added: FrozenSet[str]
    removed: FrozenSet[str]

    @property
    def changed(self) -> bool:
        return bool(self.added or self.removed)


def compare_capabilities(
    baseline: set[str],
    observed: set[str],
) -> CapabilityDiff:
    return CapabilityDiff(
        added=frozenset(observed - baseline),
        removed=frozenset(baseline - observed),
    )
