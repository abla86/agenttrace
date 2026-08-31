from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .engines import ArenaEngine
from .drift import DriftState


@dataclass(frozen=True)
class SimulationState:
    """Authoritative read model for the War-Room simulation UI."""

    tick: int
    worms: tuple[dict[str, Any], ...]
    defenses: tuple[dict[str, Any], ...]
    drift: DriftState
    events: tuple[dict[str, Any], ...]


def build_simulation_state(arena: ArenaEngine, drift: DriftState) -> SimulationState:
    worms = tuple(
        {
            "id": worm.id,
            "x": worm.x,
            "y": worm.y,
            "health": worm.health,
            "energy": worm.energy,
            "strategy": worm.strategy,
            "aggression": worm.aggression,
            "stealth": worm.stealth,
            "mutation_level": worm.mutation_level,
            "spread_vector": worm.spread_vector,
            "mutations": tuple({"type": m.type, "magnitude": m.magnitude} for m in worm.mutations),
        }
        for worm in arena.worms.worms
    )
    defenses = tuple(
        {
            "id": wall.id,
            "kind": wall.kind,
            "x": wall.x,
            "y": wall.y,
            "strength": wall.strength,
        }
        for wall in arena.defense.walls
    )
    events = tuple(
        {
            "sequence": event.sequence,
            "type": event.type,
            "worm_id": event.worm_id,
            "defense_id": event.defense_id,
            "details": dict(event.details),
        }
        for event in arena.events
    )
    return SimulationState(
        tick=arena.sequence,
        worms=worms,
        defenses=defenses,
        drift=drift,
        events=events,
    )
