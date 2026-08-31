from __future__ import annotations

from dataclasses import dataclass
from math import hypot
from typing import Literal

from .engines import DeterministicRng
from .models import SimulationEvent, WormState

SwarmAction = Literal["probe", "evade", "attack", "replicate", "hide"]


@dataclass(frozen=True)
class WormGenome:
    aggression: float
    stealth: float
    adaptability: float
    resilience: float
    replication: float


@dataclass(frozen=True)
class WormPhenotype:
    speed: float
    detectability: float
    survivability: float
    mutation_rate: float


@dataclass(frozen=True)
class SwarmState:
    cohesion: float
    entropy: float
    pressure: float
    expansion: float
    stealth_bias: float
    aggression_bias: float


def genome_of(worm: WormState) -> WormGenome:
    return WormGenome(
        aggression=max(0.0, min(1.0, worm.aggression)),
        stealth=max(0.0, min(1.0, worm.stealth)),
        adaptability=max(0.0, min(1.0, worm.mutation_level)),
        resilience=max(0.0, min(1.0, worm.health / 100.0)),
        replication=max(1.0, 1.0 + worm.mutation_level * 9.0),
    )


def phenotype_of(genome: WormGenome) -> WormPhenotype:
    return WormPhenotype(
        speed=genome.aggression * 1.2 + genome.adaptability * 0.6,
        detectability=1.0 - genome.stealth,
        survivability=min(1.0, genome.resilience + genome.adaptability * 0.4),
        mutation_rate=min(1.0, genome.adaptability * 0.5 + genome.resilience * 0.1),
    )


class SwarmIntelligenceEngine:
    def compute(
        self,
        worms: list[WormState],
        drift_score: float,
        defense_load: float,
        infection_rate: float,
    ) -> SwarmState:
        if not worms:
            return SwarmState(
                cohesion=0.0,
                entropy=max(0.0, min(1.0, drift_score / 100.0)),
                pressure=max(0.0, min(1.0, defense_load)),
                expansion=max(0.0, min(1.0, infection_rate)),
                stealth_bias=0.0,
                aggression_bias=0.0,
            )

        genomes = [genome_of(w) for w in worms]
        avg_aggression = sum(g.aggression for g in genomes) / len(genomes)
        avg_stealth = sum(g.stealth for g in genomes) / len(genomes)
        avg_adaptability = sum(g.adaptability for g in genomes) / len(genomes)

        distances: list[float] = []
        for i, left in enumerate(worms):
            for right in worms[i + 1 :]:
                distances.append(hypot(left.x - right.x, left.y - right.y))

        cohesion = 1.0 if not distances else max(
            0.0,
            min(1.0, 1.0 - (sum(distances) / len(distances)) / 20.0),
        )

        return SwarmState(
            cohesion=cohesion,
            entropy=max(0.0, min(1.0, drift_score / 100.0)),
            pressure=max(0.0, min(1.0, defense_load)),
            expansion=max(0.0, min(1.0, infection_rate)),
            stealth_bias=avg_stealth,
            aggression_bias=avg_aggression * 0.7 + avg_adaptability * 0.3,
        )


class SwarmBehaviorPolicy:
    def decide(self, swarm: SwarmState) -> SwarmAction:
        if swarm.pressure > 0.70:
            return "evade"
        if swarm.entropy > 0.80:
            return "probe"
        if swarm.aggression_bias > 0.60:
            return "attack"
        if swarm.expansion > 0.50:
            return "replicate"
        return "hide"


class WormEvolutionEngine:
    def evolve(
        self,
        worms: list[WormState],
        swarm: SwarmState,
        rng: DeterministicRng,
    ) -> list[SimulationEvent]:
        events: list[SimulationEvent] = []
        pressure = max(0.0, min(1.0, swarm.pressure + swarm.entropy * 0.5))

        for worm in worms:
            chance = min(0.20, 0.02 + worm.mutation_level * 0.05 + pressure * 0.08)
            if rng.next() >= chance:
                continue

            before = {
                "aggression": worm.aggression,
                "stealth": worm.stealth,
                "mutation_level": worm.mutation_level,
            }

            if swarm.pressure > 0.70:
                worm.stealth = min(1.0, worm.stealth + 0.03)
            elif swarm.aggression_bias > 0.60:
                worm.aggression = min(1.0, worm.aggression + 0.03)
            else:
                worm.mutation_level = min(1.0, worm.mutation_level + 0.03)

            events.append(
                SimulationEvent(
                    0,
                    "WORM_EVOLVED",
                    worm.id,
                    details={
                        "before": before,
                        "after": {
                            "aggression": worm.aggression,
                            "stealth": worm.stealth,
                            "mutation_level": worm.mutation_level,
                        },
                    },
                )
            )

        return events


class SwarmEngine:
    def __init__(self, seed: int = 1) -> None:
        self.rng = DeterministicRng(seed ^ 0x51A7)
        self.intelligence = SwarmIntelligenceEngine()
        self.policy = SwarmBehaviorPolicy()
        self.evolution = WormEvolutionEngine()
        self.state = SwarmState(0.0, 0.0, 0.0, 0.0, 0.0, 0.0)

    def tick(
        self,
        worms: list[WormState],
        drift_score: float,
        defense_load: float,
        infection_rate: float,
    ) -> list[SimulationEvent]:
        self.state = self.intelligence.compute(
            worms,
            drift_score,
            defense_load,
            infection_rate,
        )
        action = self.policy.decide(self.state)

        events = [
            SimulationEvent(
                0,
                "SWARM_BEHAVIOR",
                None,
                details={
                    "action": action,
                    "cohesion": self.state.cohesion,
                    "entropy": self.state.entropy,
                    "pressure": self.state.pressure,
                    "expansion": self.state.expansion,
                    "stealth_bias": self.state.stealth_bias,
                    "aggression_bias": self.state.aggression_bias,
                },
            )
        ]
        events.extend(self.evolution.evolve(worms, self.state, self.rng))
        return events
