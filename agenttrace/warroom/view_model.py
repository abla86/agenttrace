from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from agenttrace.simulation.controller import ControllerStep
from agenttrace.simulation.proposals import EnrichedProposal, ProposalEngine


@dataclass(frozen=True)
class WarRoomViewModel:
    """Read-only presentation model backed by the simulation controller state."""

    tick: int
    arena: dict[str, Any]
    drift: dict[str, Any]
    worms: tuple[dict[str, Any], ...]
    defenses: tuple[dict[str, Any], ...]
    proposals: tuple[dict[str, Any], ...]
    recent_events: tuple[dict[str, Any], ...]


def build_warroom_view(step: ControllerStep, max_events: int = 100) -> WarRoomViewModel:
    state = step.state

    proposals = tuple(
        ProposalEngine.as_dict(
            EnrichedProposal(
                proposal=decision.proposal.proposal,
                tick=decision.proposal.tick,
                code=decision.proposal.code,
                tags=decision.proposal.tags,
                risk_level=decision.proposal.risk_level,
            )
        )
        for decision in step.proposals
    )

    worms = tuple(state.worms)
    defenses = tuple(state.defenses)

    recent_events = tuple(state.events[-max_events:]) if max_events > 0 else ()

    return WarRoomViewModel(
        tick=state.tick,
        arena={
            "worm_count": len(worms),
            "defense_count": len(defenses),
        },
        drift={
            "score": state.drift.score,
            "status": state.drift.status,
            "active_worms": state.drift.active_worms,
            "defense_triggers": state.drift.defense_triggers,
            "propagation_events": state.drift.propagation_events,
            "incident_rate": state.drift.incident_rate,
            "health_index": state.drift.health_index,
        },
        worms=worms,
        defenses=defenses,
        proposals=proposals,
        recent_events=recent_events,
    )
