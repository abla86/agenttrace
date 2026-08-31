from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable
from uuid import uuid4

from ..engines import DeterministicRng
from ..models import WormState


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


class ColonyEngine:
    def update(self, colonies: Iterable[Colony], worms: list[WormState]) -> list[Colony]:
        by_id = {worm.id: worm for worm in worms}
        total = max(1, len(worms))
        result: list[Colony] = []
        for colony in colonies:
            members = [by_id[w_id] for w_id in colony.members if w_id in by_id]
            n = max(1, len(members))
            colony.members = [worm.id for worm in members]
            colony.cohesion = min(1.0, len(members) / total)
            colony.aggression = sum(w.aggression for w in members) / n
            colony.stealth = sum(w.stealth for w in members) / n
            colony.adaptability = sum(w.mutation_level for w in members) / n
            colony.territory_control = min(1.0, colony.cohesion * (0.5 + 0.5 * colony.adaptability))
            result.append(colony)
        return result


class TerritoryEngine:
    def update(self, territories: Iterable[Territory], defense_load: float, autonomy_level: float) -> list[Territory]:
        result: list[Territory] = []
        for territory in territories:
            territory.pressure = max(0.0, min(1.0, territory.pressure + defense_load * 0.01))
            territory.stability = max(0.0, min(1.0, territory.stability + autonomy_level * 0.02 - territory.pressure * 0.005))
            result.append(territory)
        return result


class CivilizationEngine:
    def update(
        self,
        civilizations: Iterable[Civilization],
        drift_score: float,
        infection_rate: float,
        defense_load: float,
        autonomy_level: float,
    ) -> list[Civilization]:
        drift = max(0.0, min(1.0, drift_score / 100.0))
        result: list[Civilization] = []
        for civilization in civilizations:
            civilization.tech_level = min(100.0, civilization.tech_level + autonomy_level * 0.03)
            civilization.military_level = min(100.0, civilization.military_level + drift * 0.02)
            civilization.expansion_doctrine = min(1.0, civilization.expansion_doctrine + infection_rate * 0.01)
            civilization.stealth_doctrine = min(1.0, civilization.stealth_doctrine + defense_load * 0.02)
            civilization.evolution_bias = (civilization.tech_level / 100.0 + civilization.stealth_doctrine) * 0.5
            result.append(civilization)
        return result


class AutonomyEvolutionEngine:
    def evolve(self, worms: list[WormState], autonomy_level: float) -> None:
        level = max(0.0, min(1.0, autonomy_level))
        for worm in worms:
            worm.mutation_level = min(1.0, worm.mutation_level + level * 0.02)
            worm.stealth = min(1.0, worm.stealth + level * 0.015)
            worm.aggression = min(1.0, worm.aggression + level * 0.01)


class CivilizationRuntime:
    def __init__(self, seed: int = 1) -> None:
        self.rng = DeterministicRng(seed ^ 0xC17A)
        self.colonies: list[Colony] = []
        self.territories: list[Territory] = []
        self.civilizations: list[Civilization] = []
        self.colony_engine = ColonyEngine()
        self.territory_engine = TerritoryEngine()
        self.civilization_engine = CivilizationEngine()
        self.evolution = AutonomyEvolutionEngine()

    def bootstrap(self, worms: list[WormState]) -> None:
        if worms and not self.colonies:
            self.colonies.append(Colony(id=str(uuid4()), members=[worm.id for worm in worms]))
        if not self.territories and worms:
            anchor = worms[0]
            self.territories.append(Territory(id=str(uuid4()), x=anchor.x, y=anchor.y, radius=10.0, owner_colony=self.colonies[0].id))
        if not self.civilizations and self.colonies:
            self.civilizations.append(Civilization(id=str(uuid4()), colonies=[self.colonies[0].id]))

    def tick(self, worms: list[WormState], drift_score: float, defense_load: float, infection_rate: float, autonomy_level: float) -> None:
        self.bootstrap(worms)
        self.evolution.evolve(worms, autonomy_level)
        self.colonies = self.colony_engine.update(self.colonies, worms)
        self.territories = self.territory_engine.update(self.territories, defense_load, autonomy_level)
        self.civilizations = self.civilization_engine.update(
            self.civilizations, drift_score, infection_rate, defense_load, autonomy_level
        )
