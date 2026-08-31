from __future__ import annotations

from dataclasses import dataclass, replace
from uuid import uuid4

from .models import DefenseWall, Mutation, SimulationEvent, WormState


class DeterministicRng:
    def __init__(self, seed: int = 1) -> None:
        self.state = seed & 0xFFFFFFFF

    def next(self) -> float:
        self.state = (1664525 * self.state + 1013904223) & 0xFFFFFFFF
        return self.state / 0x100000000

    def choice(self, values: tuple[str, ...]) -> str:
        return values[int(self.next() * len(values)) % len(values)]


@dataclass(frozen=True)
class MutationConfig:
    base_rate: float = 0.10
    drift_factor: float = 0.50
    max_mutations_per_tick: int = 8

    def __post_init__(self) -> None:
        if not 0.0 <= self.base_rate <= 1.0:
            raise ValueError("base_rate must be between 0 and 1")
        if self.drift_factor < 0.0:
            raise ValueError("drift_factor must be non-negative")
        if self.max_mutations_per_tick < 0:
            raise ValueError("max_mutations_per_tick must be non-negative")


class MutationEngine:
    def __init__(self, config: MutationConfig | None = None) -> None:
        self.config = config or MutationConfig()

    def mutation_probability(self, drift_score: float) -> float:
        normalized_drift = max(0.0, min(1.0, drift_score / 100.0))
        return min(1.0, self.config.base_rate * (1.0 + self.config.drift_factor * normalized_drift))

    def mutate(self, worm: WormState, rng: DeterministicRng, drift_score: float = 0.0) -> tuple[WormState, str] | None:
        if rng.next() > self.mutation_probability(drift_score):
            return None

        kind = rng.choice(("speed", "stealth", "aggression"))
        magnitude = round(0.05 + rng.next() * 0.15, 4)
        updated = replace(worm, mutation_level=min(1.0, worm.mutation_level + magnitude))
        if kind == "speed":
            updated = replace(updated, energy=min(100.0, updated.energy + 2.0))
        elif kind == "stealth":
            updated = replace(updated, stealth=min(1.0, updated.stealth + magnitude))
        else:
            updated = replace(updated, aggression=min(1.0, updated.aggression + magnitude))
        updated.mutations = [*worm.mutations, Mutation(kind, magnitude)]
        return updated, kind


class WormEngine:
    def __init__(self, rng: DeterministicRng | None = None, mutation_config: MutationConfig | None = None) -> None:
        self.rng = rng or DeterministicRng()
        self.mutations = MutationEngine(mutation_config)
        self.worms: list[WormState] = []

    def spawn(self, **kwargs: object) -> WormState:
        worm = WormState(id=str(kwargs.pop("id", uuid4())), **kwargs)  # type: ignore[arg-type]
        self.worms.append(worm)
        return worm

    def tick(self, drift_score: float = 0.0) -> list[SimulationEvent]:
        events: list[SimulationEvent] = []
        mutation_count = 0
        for index, worm in enumerate(self.worms):
            if worm.health <= 0 or worm.energy <= 0:
                continue
            dx = 1 if self.rng.next() >= 0.5 else -1
            dy = 1 if self.rng.next() >= 0.5 else -1
            if worm.strategy == "aggressive":
                dx *= 2
                dy *= 2
            elif worm.strategy == "erratic":
                dx *= 3
                dy *= 3
            worm.x += dx
            worm.y += dy
            worm.energy = max(0.0, worm.energy - 1.0)
            events.append(SimulationEvent(0, "WORM_MOVED", worm.id, details={"x": worm.x, "y": worm.y}))

            if mutation_count >= self.mutations.config.max_mutations_per_tick:
                continue
            result = self.mutations.mutate(worm, self.rng, drift_score)
            if result is not None:
                updated, mutation = result
                self.worms[index] = updated
                mutation_count += 1
                events.append(
                    SimulationEvent(
                        0,
                        "WORM_MUTATED",
                        updated.id,
                        details={"mutation": mutation, "drift_score": drift_score},
                    )
                )
        return events


class DefenseEngine:
    def __init__(self) -> None:
        self.walls: list[DefenseWall] = []

    def add_firewall(self, x: float, y: float, strength: float = 1.0) -> DefenseWall:
        wall = DefenseWall(str(uuid4()), "firewall", x, y, strength)
        self.walls.append(wall)
        return wall

    def add_trap(self, x: float, y: float, strength: float = 1.0) -> DefenseWall:
        wall = DefenseWall(str(uuid4()), "trap", x, y, strength)
        self.walls.append(wall)
        return wall

    def apply(self, worms: list[WormState]) -> list[SimulationEvent]:
        events: list[SimulationEvent] = []
        for worm in worms:
            for wall in self.walls:
                if abs(worm.x - wall.x) > 0.01 or abs(worm.y - wall.y) > 0.01:
                    continue
                if wall.kind == "firewall":
                    worm.energy = max(0.0, worm.energy - 5.0 * wall.strength)
                    events.append(SimulationEvent(0, "DEFENSE_TRIGGERED", worm.id, wall.id))
                else:
                    worm.energy = 0.0
                    worm.health = max(0.0, worm.health - 10.0 * wall.strength)
                    events.append(SimulationEvent(0, "DEFENSE_TRAP_TRIGGERED", worm.id, wall.id))
        return events


class InfectionEngine:
    def __init__(self, rng: DeterministicRng | None = None) -> None:
        self.rng = rng or DeterministicRng()

    def tick(self, worms: list[WormState]) -> list[SimulationEvent]:
        events: list[SimulationEvent] = []
        for i, source in enumerate(worms):
            for target in worms[i + 1:]:
                if abs(source.x - target.x) >= 2 or abs(source.y - target.y) >= 2:
                    continue
                if self.rng.next() >= 0.3:
                    continue
                target.mutations = [*target.mutations, *source.mutations[:2]]
                target.mutation_level = min(1.0, target.mutation_level + 0.05)
                events.append(SimulationEvent(0, "PROPAGATION_SIMULATED", source.id, target.id))
        return events


class ArenaEngine:
    def __init__(self, seed: int = 1, mutation_config: MutationConfig | None = None) -> None:
        self.rng = DeterministicRng(seed)
        self.worms = WormEngine(self.rng, mutation_config)
        self.defense = DefenseEngine()
        self.infection = InfectionEngine(self.rng)
        self.sequence = 0
        self.events: list[SimulationEvent] = []
        self.drift_score = 0.0

    def tick(self) -> list[SimulationEvent]:
        emitted = self.worms.tick(self.drift_score)
        emitted.extend(self.defense.apply(self.worms.worms))
        emitted.extend(self.infection.tick(self.worms.worms))
        normalized: list[SimulationEvent] = []
        for event in emitted:
            self.sequence += 1
            normalized.append(replace(event, sequence=self.sequence))
        self.events.extend(normalized)
        return normalized

    def set_drift_score(self, drift_score: float) -> None:
        self.drift_score = max(0.0, min(100.0, float(drift_score)))

    def snapshot(self) -> dict[str, object]:
        return {"worms": self.worms.worms, "defenses": self.defense.walls, "sequence": self.sequence}
