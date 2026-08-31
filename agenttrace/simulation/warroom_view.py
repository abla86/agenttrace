from __future__ import annotations

from dataclasses import asdict
from typing import Any

from .state import SimulationSnapshot


def to_warroom_view(snapshot: SimulationSnapshot) -> dict[str, Any]:
    """Build a read-only UI view from authoritative simulation state.

    The War-Room consumes this representation for rendering. It does not
    contain policy decisions and cannot mutate the underlying simulation.
    """
    return {
        "tick": snapshot.tick,
        "worms": [asdict(worm) for worm in snapshot.worms],
        "defenses": [asdict(defense) for defense in snapshot.defenses],
        "drift": asdict(snapshot.drift),
        "recent_events": [asdict(event) for event in snapshot.events[-50:]],
    }
