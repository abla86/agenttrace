from __future__ import annotations

from dataclasses import dataclass

from .drift import DriftState


@dataclass(frozen=True)
class DefenseProposal:
    proposal_id: str
    reason: str
    action: str
    parameters: dict[str, float]
    requires_explicit_promotion: bool = True


class AutonomyEngine:
    """Bounded autonomy: observe and propose; it never mutates production policy itself."""

    def __init__(self) -> None:
        self.sequence = 0

    def propose(self, drift: DriftState) -> list[DefenseProposal]:
        proposals: list[DefenseProposal] = []
        if drift.score >= 70:
            self.sequence += 1
            proposals.append(
                DefenseProposal(
                    proposal_id=f"P-{self.sequence:06d}",
                    reason="Simulation drift is high.",
                    action="increase_simulation_defense_coverage",
                    parameters={"coverage_delta": 0.10},
                )
            )
        elif drift.score >= 40:
            self.sequence += 1
            proposals.append(
                DefenseProposal(
                    proposal_id=f"P-{self.sequence:06d}",
                    reason="Simulation drift is elevated.",
                    action="review_simulation_defense_coverage",
                    parameters={"review_threshold": drift.score},
                )
            )
        return proposals
