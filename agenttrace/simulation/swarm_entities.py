from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable

from .engines import DeterministicRng
from .models import SimulationEvent, WormState


@dataclass
class Territory:
    id: str
    x: float
    y: float
    radius: float
    owner_colony: str | None = None
    pressure: float = 0.0
    stability: float = 1.0


@dataclass
class Colony:
    id: str
    members: list[str] = field(default_factory=list)
    cohesion: float = 0.0
    aggression: float = 0.0
    stealth: float = 0.0
    adaptability: float = 0.0
    territory_control: float = 0.0


@dataclass
class Civilization:
    id: str
    colonies: list[str] = field(default_factory=list)
    tech_level: float = 0.0
    military_level: float = 0.0
    stealth_doctrine: float = 0.0
    expansion_doctrine: float = 0.0
    evolution_bias: float = 0.0


class TerritoryEngine:
    def tick(self, territories: list[Territory], defense_load: float, autonomy_level: float) -> list[SimulationEvent]:
        events: list[SimulationEvent] = []
        for territory in territories:
            territory.pressure = max(0.0, min(1.0, territory.pressure + defense_load * 0.01))
            territory.stability = max(0.0, min(1.0, territory.stability + autonomy_level * 0.02 - territory.pressure * 0.005))
            events.append(
                SimulationEvent(
                    0,
                    "TERRITORY_UPDATED",
                    details={
                        "territory_id": territory.id,
                        "pressure": territory.pressure,
                        "stability": territory.stability,
                        "owner_colony": territory.owner_colony,
                    },
                )
            )
        return events


class ColonyEngine:
    def tick(self, colonies: list[Colony], worms: list[WormState], territories: list[Territory]) -> list[SimulationEvent]:
        by_id = {worm.id: worm for worm in worms}
        events: list[SimulationEvent] = []
        total_worms = max(1, len(worms))
        for colony in colonies:
            members = [by_id[w] for w in colony.members if w in by_id]
            if not members:
                colony.cohesion = colony.aggression = colony.stealth = colony.adaptability = 0.0
                colony.territory_control = 0.0
                continue
            n = len(members)
            colony.cohesion = min(1.0, n / total_worms)
            colony.aggression = sum(w.aggression for w in members) / n
            colony.stealth = sum(w.stealth for w in members) / n
            colony.adaptability = sum(w.mutation_level for w in members) / n
            owned = sum(1 for t in territories if t.owner_colony == colony.id)
            colony.territory_control = min(1.0, owned / max(1, len(territories)))
            events.append(
                SimulationEvent(
                    0,
                    "COLONY_UPDATED",
                    details={
                        "colony_id": colony.id,
                        "members": len(members),
                        "cohesion": colony.cohesion,
                        "territory_control": colony.territory_control,
                    },
                )
            )
        return events


class CivilizationEngine:
    def tick(
        self,
        civilizations: list[Civilization],
        colonies: Iterable[Colony],
        drift_score: float,
        infection_rate: float,
        defense_load: float,
        autonomy_level: float,
    ) -> list[SimulationEvent]:
        colony_by_id = {c.id: c for c in colonies}
        events: list[SimulationEvent] = []
        for civ in civilizations:
            owned = [colony_by_id[cid] for cid in civ.colonies if cid in colony_by_id]
            colony_adapt = sum(c.adaptability for c in owned) / max(1, len(owned))
            civ.tech_level = min(100.0, civ.tech_level + autonomy_level * 0.03)
            civ.military_level = min(100.0, civ.military_level + drift_score * 0.02)
            civ.expansion_doctrine = min(100.0, civ.expansion_doctrine + infection_rate * 0.01)
            civ.stealth_doctrine = min(100.0, civ.stealth_doctrine + defense_load * 0.02)
            civ.evolution_bias = min(100.0, (civ.tech_level + civ.stealth_doctrine + colony_adapt) * 0.5)
            events.append(
                SimulationEvent(
                    0,
                    "CIVILIZATION_UPDATED",
                    details={
                        "civilization_id": civ.id,
                        "tech_level": civ.tech_level,
                        "military_level": civ.military_level,
                        "evolution_bias": civ.evolution_bias,
                    },
                )
            )
        return events


class AutonomyEvolutionEngine:
    def evolve(self, worms: list[WormState], autonomy_level: float) -> list[SimulationEvent]:
        events: list[SimulationEvent] = []
        factor = max(0.0, min(1.0, autonomy_level / 100.0))
        for worm in worms:
            worm.aggression = min(1.0, worm.aggression + factor * 0.002)
            worm.stealth = min(1.0, worm.stealth + factor * 0.003)
            worm.mutation_level = min(1.0, worm.mutation_level + factor * 0.004)
            events.append(
                SimulationEvent(
                    0,
                    "AUTONOMY_EVOLUTION",
                    worm.id,
                    details={"factor": factor},
                )
            )
        return events


class SwarmWorldEngine:
    """Coordinates higher-order social simulation without owning policy approval."""

    def __init__(self, seed: int = 1) -> None:
        self.rng = DeterministicRng(seed ^ 0x77AA)
        self.territories: list[Territory] = []
        self.colonies: list[Colony] = []
        self.civilizations: list[Civilization] = []
        self.territory_engine = TerritoryEngine()
        self.colony_engine = ColonyEngine()
        self.civilization_engine = CivilizationEngine()
        self.autonomy_evolution = AutonomyEvolutionEngine()

    def tick(
        self,
        worms: list[WormState],
        drift_score: float,
        defense_load: float,
        infection_rate: float,
        autonomy_level: float,
    ) -> list[SimulationEvent]:
        events = self.colony_engine.tick(self.colonies, worms, self.territories)
        events.extend(self.territory_engine.tick(self.territories, defense_load, autonomy_level))
        events.extend(
            self.civilization_engine.tick(
                self.civilizations,
                self.colonies,
                drift_score,
                infection_rate,
                defense_load,
                autonomy_level,
            )
        )
        events.extend(self.autonomy_evolution.evolve(worms, autonomy_level))
        return events
