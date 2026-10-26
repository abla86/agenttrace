from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CapabilityDiff:
    added: frozenset[str]
    removed: frozenset[str]

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
