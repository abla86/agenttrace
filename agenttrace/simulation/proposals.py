from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .autonomy import DefenseProposal
from .drift import DriftState
from .state import SimulationState


@dataclass(frozen=True)
class EnrichedProposal:
    proposal: DefenseProposal
    code: str
    tags: tuple[str, ...]
    risk_level: str


class ProposalEngine:
    """Adds stable display/evaluation metadata without changing simulation policy."""

    @staticmethod
    def create(state: SimulationState, proposal: DefenseProposal) -> EnrichedProposal:
        drift = proposal.metrics_snapshot
        prefix = "DEF" if proposal.action.startswith("increase_") else "REVIEW"
        risk_level = ProposalEngine._risk(drift.score)
        code = f"{prefix}_{risk_level.upper()}_{state.tick:06d}_{proposal.proposal_id}"
        tags = ["autonomy_proposal", proposal.action]
        if drift.score >= 70:
            tags.append("high_drift")
        if drift.propagation_events > 0:
            tags.append("propagation_observed")
        if drift.defense_triggers == 0:
            tags.append("no_defense_triggers")
        return EnrichedProposal(proposal=proposal, code=code, tags=tuple(tags), risk_level=risk_level)

    @staticmethod
    def _risk(score: float) -> str:
        if score >= 70:
            return "high"
        if score >= 40:
            return "medium"
        return "low"

    @staticmethod
    def as_dict(item: EnrichedProposal) -> dict[str, Any]:
        p = item.proposal
        return {
            "proposal_id": p.proposal_id,
            "tick": p.metrics_snapshot.active_worms,
            "action": p.action,
            "parameters": dict(p.parameters),
            "reason": p.reason,
            "code": item.code,
            "tags": list(item.tags),
            "risk_level": item.risk_level,
            "validated": p.validated,
            "approved": p.approved,
            "requires_explicit_promotion": p.requires_explicit_promotion,
        }
