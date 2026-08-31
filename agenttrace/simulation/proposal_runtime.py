from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from .autonomy import AutonomyEngine, DefenseProposal
from .proposals import EnrichedProposal, ProposalEngine
from .state import SimulationState


@dataclass(frozen=True)
class ProposalDecision:
    proposal: EnrichedProposal
    validated: bool
    approved: bool


class ProposalRuntime:
    """Coordinates proposal creation and validation without implicit promotion."""

    def __init__(
        self,
        autonomy: AutonomyEngine | None = None,
        proposals: ProposalEngine | None = None,
    ) -> None:
        self.autonomy = autonomy or AutonomyEngine()
        self.proposals = proposals or ProposalEngine()

    def evaluate(
        self,
        state: SimulationState,
        policy: Callable[[DefenseProposal], bool],
    ) -> list[ProposalDecision]:
        drift = self.autonomy.observe(state)
        analysis = self.autonomy.analyze(drift)
        proposal = self.autonomy.propose(state, analysis)
        if proposal is None:
            return []

        validated = self.autonomy.validate(proposal, policy)
        enriched = self.proposals.create(state, validated)
        return [
            ProposalDecision(
                proposal=enriched,
                validated=validated.validated,
                approved=validated.approved,
            )
        ]
