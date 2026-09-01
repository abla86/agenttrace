from __future__ import annotations

from dataclasses import dataclass, replace
from typing import Literal

from .engines import DeterministicRng
from .models import WormState

SpreadMode = Literal["memory", "tools", "rag", "chain", "encrypt"]
BehaviorAction = Literal["probe", "evade", "attack", "replicate", "hide"]


@dataclass(frozen=True)
class WormGenome:
    aggression: float = 0.20
    stealth: float = 0.10
    replication: int = 1
    spread: SpreadMode = "memory"
    resilience: float = 0.30
    adaptability: float = 0.30

    def bounded(self) -> "WormGenome":
        return replace(
            self,
            aggression=max(0.0, min(1.0, self.aggression)),
            stealth=max(0.0, min(1.0, self.stealth)),
            replication=max(1, min(10, self.replication)),
            resilience=max(0.0, min(1.0, self.resilience)),
            adaptability=max(0.0, min(1.0, self.adaptability)),
        )


@dataclass(frozen=True)
class WormPhenotype:
    speed: float
    detectability: float
    survivability: float
    mutation_rate: float


def express_genome(genome: WormGenome) -> WormPhenotype:
    g = genome.bounded()
    return WormPhenotype(
        speed=g.aggression * 1.5 + g.adaptability * 0.5,
        detectability=max(0.0, 1.0 - g.stealth),
        survivability=min(1.0, g.resilience + g.adaptability * 0.3),
        mutation_rate=min(1.0, g.adaptability * 0.4 + g.resilience * 0.1),
    )


@dataclass(frozen=True)
class WormBehavior:
    action: BehaviorAction
    intensity: float


def decide_behavior(
    genome: WormGenome,
    phenotype: WormPhenotype,
    drift_score: float,
) -> WormBehavior:
    normalized_drift = max(0.0, min(1.0, drift_score / 100.0))
    chaos = normalized_drift * genome.adaptability
    if chaos > 0.7:
        return WormBehavior("attack", genome.aggression)
    if phenotype.detectability < 0.3:
        return WormBehavior("evade", genome.stealth)
    if genome.replication > 5:
        return WormBehavior("replicate", genome.replication / 10.0)
    return WormBehavior("probe", 0.2)


def spread_probability(genome: WormGenome, phenotype: WormPhenotype) -> float:
    if genome.spread == "memory":
        return min(1.0, phenotype.speed * 0.1)
    if genome.spread == "tools":
        return min(1.0, genome.adaptability * 0.2)
    if genome.spread == "rag":
        return min(1.0, genome.stealth * 0.15)
    if genome.spread == "chain":
        return min(1.0, genome.replication * 0.05)
    return min(1.0, genome.resilience * 0.12)


def should_spread(genome: WormGenome, phenotype: WormPhenotype, rng: DeterministicRng) -> bool:
    return rng.next() < spread_probability(genome, phenotype)


class WormBiologyEngine:
    """Maps existing WormState to bounded genome/phenotype behavior models."""

    def __init__(self, rng: DeterministicRng | None = None) -> None:
        self.rng = rng or DeterministicRng()
        self._genomes: dict[str, WormGenome] = {}

    def genome_for(self, worm: WormState) -> WormGenome:
        genome = self._genomes.get(worm.id)
        if genome is not None:
            return genome
        genome = WormGenome(
            aggression=worm.aggression,
            stealth=worm.stealth,
            replication=1 + min(9, int(worm.mutation_level * 9)),
            resilience=max(0.0, min(1.0, worm.health / 100.0)),
            adaptability=max(0.0, min(1.0, worm.mutation_level)),
        ).bounded()
        self._genomes[worm.id] = genome
        return genome

    def evolve(self, worm: WormState, drift_score: float) -> tuple[WormState, WormGenome]:
        genome = self.genome_for(worm)
        phenotype = express_genome(genome)
        pressure = max(0.0, min(1.0, drift_score / 100.0)) * genome.adaptability
        updated = genome
        if pressure > 0.5 and self.rng.next() < phenotype.mutation_rate:
            updated = replace(updated, adaptability=min(1.0, updated.adaptability + 0.05))
        if pressure > 0.7 and self.rng.next() < phenotype.mutation_rate:
            updated = replace(updated, resilience=min(1.0, updated.resilience + 0.05))
        if pressure > 0.8 and self.rng.next() < phenotype.mutation_rate:
            updated = replace(updated, aggression=min(1.0, updated.aggression + 0.05))
        updated = updated.bounded()
        self._genomes[worm.id] = updated
        synced = replace(
            worm,
            aggression=updated.aggression,
            stealth=updated.stealth,
            mutation_level=max(worm.mutation_level, updated.adaptability),
        )
        return synced, updated

    def behavior(self, worm: WormState, drift_score: float) -> WormBehavior:
        genome = self.genome_for(worm)
        return decide_behavior(genome, express_genome(genome), drift_score)

    def interaction(self, a: WormState, b: WormState) -> tuple[WormState, WormState]:
        ga = self.genome_for(a)
        gb = self.genome_for(b)
        conflict = ga.aggression + gb.aggression + self.rng.next() * 0.2
        if conflict <= 1.2:
            return a, b
        pa = express_genome(ga)
        pb = express_genome(gb)
        if pa.survivability > pb.survivability:
            return a, replace(b, health=max(0.0, b.health - 5.0))
        return replace(a, health=max(0.0, a.health - 5.0)), b
