from __future__ import annotations

from dataclasses import dataclass
from typing import Callable
from uuid import uuid4

from .drift import DriftState
from .state import SimulationState


@dataclass(frozen=True)
class DefenseProposal:
    proposal_id: str
    reason: str
    action: str
    parameters: dict[str, float]
    metrics_snapshot: DriftState
    validated: bool = False
    approved: bool = False
    requires_explicit_promotion: bool = True


class AutonomyEngine:
    """Bounded autonomy: observe, analyze and propose; never mutates policy implicitly."""

    def __init__(self) -> None:
        self.sequence = 0

    def observe(self, state: SimulationState) -> DriftState:
        return state.drift

    def analyze(self, drift: DriftState) -> dict[str, object] | None:
        if drift.score >= 70:
            return {
                "action": "increase_simulation_defense_coverage",
                "parameters": {"coverage_delta": 0.10},
                "reason": "Simulation drift is high; review defense coverage.",
            }
        if drift.score >= 40:
            return {
                "action": "review_simulation_defense_coverage",
                "parameters": {"review_threshold": drift.score},
                "reason": "Simulation drift is elevated; review defense coverage.",
            }
        return None

    def propose(self, state: SimulationState, analysis: dict[str, object] | None) -> DefenseProposal | None:
        if analysis is None:
            return None
        self.sequence += 1
        return DefenseProposal(
            proposal_id=f"P-{self.sequence:06d}",
            reason=str(analysis["reason"]),
            action=str(analysis["action"]),
            parameters=dict(analysis["parameters"]),
            metrics_snapshot=state.drift,
        )

    def validate(
        self,
        proposal: DefenseProposal,
        policy: Callable[[DefenseProposal], bool],
    ) -> DefenseProposal:
        approved = bool(policy(proposal))
        return DefenseProposal(
            proposal_id=proposal.proposal_id,
            reason=proposal.reason,
            action=proposal.action,
            parameters=dict(proposal.parameters),
            metrics_snapshot=proposal.metrics_snapshot,
            validated=True,
            approved=approved,
            requires_explicit_promotion=proposal.requires_explicit_promotion,
        )

    def promote(
        self,
        proposal: DefenseProposal,
        promote: Callable[[DefenseProposal], None],
    ) -> DefenseProposal:
        if not proposal.validated or not proposal.approved or not proposal.requires_explicit_promotion:
            raise PermissionError("Proposal must be validated and approved before explicit promotion")
        promote(proposal)
        return proposal

    @staticmethod
    def new_proposal_id() -> str:
        return str(uuid4())
