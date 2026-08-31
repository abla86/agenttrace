from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .models import SimulationEvent


@dataclass(frozen=True)
class VisualEvent:
    sequence: int
    kind: str
    subject_id: str | None
    target_id: str | None
    intensity: float
    details: dict[str, Any]


def to_visual_event(event: SimulationEvent) -> VisualEvent:
    """Translate authoritative simulation events into render-friendly data."""
    mapping = {
        "WORM_MOVED": "worm_move",
        "WORM_MUTATED": "worm_mutation",
        "DEFENSE_TRIGGERED": "defense_trigger",
        "DEFENSE_TRAP_TRIGGERED": "defense_trap",
        "PROPAGATION_SIMULATED": "propagation",
    }
    kind = mapping.get(event.type, "security_event")
    intensity = 1.0
    if kind == "worm_move":
        intensity = 0.2
    elif kind == "worm_mutation":
        intensity = 0.7
    elif kind.startswith("defense"):
        intensity = 0.9
    elif kind == "propagation":
        intensity = 0.8
    return VisualEvent(
        sequence=event.sequence,
        kind=kind,
        subject_id=event.worm_id,
        target_id=event.defense_id,
        intensity=intensity,
        details=dict(event.details),
    )


def visual_event_stream(events: list[SimulationEvent]) -> tuple[VisualEvent, ...]:
    return tuple(to_visual_event(event) for event in events)
