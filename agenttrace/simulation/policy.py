from __future__ import annotations

from .autonomy import DefenseProposal


class SimulationPolicy:
    """Conservative policy for simulated defense proposals."""

    MAX_COORDINATE = 100.0
    MAX_COVERAGE_DELTA = 0.25

    def validate(self, proposal: DefenseProposal) -> bool:
        if not proposal.requires_explicit_promotion:
            return False
        if proposal.action not in {
            "increase_simulation_defense_coverage",
            "review_simulation_defense_coverage",
        }:
            return False
        return all(
            value >= 0.0
            for value in proposal.parameters.values()
            if isinstance(value, (int, float))
        )

    def validate_coverage_delta(self, delta: float) -> bool:
        return 0.0 <= delta <= self.MAX_COVERAGE_DELTA
