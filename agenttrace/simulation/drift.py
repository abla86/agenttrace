from __future__ import annotations

from dataclasses import dataclass

from .models import SimulationEvent, WormState


@dataclass(frozen=True)
class DriftState:
    pressure: float
    injury_rate: float
    active_worms: int
    defense_triggers: int
    propagation_events: int
    score: float
    status: str


class DriftEngine:
    """Derives bounded simulation health metrics; it does not control policy."""

    def __init__(self) -> None:
        self.state = DriftState(0, 0, 0, 0, 0, 0, "STABLE")

    def update(self, worms: list[WormState], events: list[SimulationEvent]) -> DriftState:
        active = [w for w in worms if w.health > 0]
        pressure = min(100.0, sum(max(0.0, 100.0 - w.health) for w in active) / max(1, len(active)))
        injury_rate = min(100.0, sum(1 for e in events if e.type.startswith("DEFENSE_")) * 5.0)
        propagation = sum(1 for e in events if e.type == "PROPAGATION_SIMULATED")
        defenses = sum(1 for e in events if e.type.startswith("DEFENSE_"))
        score = round(min(100.0, pressure * 0.55 + injury_rate * 0.25 + propagation * 5.0), 2)
        status = "HIGH" if score >= 70 else "ELEVATED" if score >= 40 else "STABLE"
        self.state = DriftState(pressure, injury_rate, len(active), defenses, propagation, score, status)
        return self.state
