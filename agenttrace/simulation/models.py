from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

Strategy = Literal["seek", "aggressive", "erratic"]

@dataclass
class Mutation:
    type: str
    magnitude: float = 1.0

@dataclass
class WormState:
    id: str
    x: float = 10.0
    y: float = 10.0
    health: float = 100.0
    energy: float = 50.0
    strategy: Strategy = "seek"
    aggression: float = 0.5
    stealth: float = 0.5
    mutation_level: float = 0.0
    spread_vector: str = "memory"
    mutations: list[Mutation] = field(default_factory=list)

@dataclass(frozen=True)
class DefenseWall:
    id: str
    kind: Literal["firewall", "trap"]
    x: float
    y: float
    strength: float = 1.0

@dataclass(frozen=True)
class SimulationEvent:
    sequence: int
    type: str
    worm_id: str | None = None
    defense_id: str | None = None
    details: dict[str, object] = field(default_factory=dict)
