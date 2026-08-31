from __future__ import annotations

from dataclasses import asdict
from typing import Any

from .state import SimulationState


def to_warroom_view(state: SimulationState) -> dict[str, Any]:
    """Build a read-only UI view from authoritative simulation state.

    The War-Room consumes this representation for rendering. It does not
    contain policy decisions and cannot mutate the underlying simulation.
    """
    return {
        "tick": state.tick,
        "worms": list(state.worms),
        "defenses": list(state.defenses),
        "drift": asdict(state.drift),
        "recent_events": list(state.events[-50:]),
    }
