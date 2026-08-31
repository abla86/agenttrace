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
    defense_load: float = 0.0
    infection_rate: float = 0.0
    autonomy_level: float = 0.0


class DriftEngine:
    """Derives bounded simulation health metrics; it does not control policy."""

    def __init__(self) -> None:
        self.state = DriftState(0, 0, 0, 0, 0, 0, "STABLE")

    def update(
        self,
        worms: list[WormState],
        events: list[SimulationEvent],
        defense_count: int = 0,
        autonomy_level: float = 0.0,
    ) -> DriftState:
        active = [w for w in worms if w.health > 0]
        pressure = min(
            100.0,
            sum(max(0.0, 100.0 - w.health) for w in active) / max(1, len(active)),
        )
        injury_events = sum(1 for e in events if e.type.startswith("DEFENSE_"))
        injury_rate = min(100.0, injury_events * 5.0)
        propagation = sum(1 for e in events if e.type == "PROPAGATION_SIMULATED")
        defenses = injury_events
        infection_rate = min(100.0, propagation * 5.0)
        defense_load = min(100.0, defense_count * 5.0)
        autonomy = max(0.0, min(100.0, autonomy_level))
        score = round(
            min(
                100.0,
                pressure * 0.45
                + injury_rate * 0.20
                + infection_rate * 0.20
                + (100.0 - min(100.0, defense_load)) * 0.10
                + autonomy * 0.05,
            ),
            2,
        )
        status = "HIGH" if score >= 70 else "ELEVATED" if score >= 40 else "STABLE"
        self.state = DriftState(
            pressure,
            injury_rate,
            len(active),
            defenses,
            propagation,
            score,
            status,
            defense_load,
            infection_rate,
            autonomy,
        )
        return self.state
