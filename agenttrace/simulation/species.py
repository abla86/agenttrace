from __future__ import annotations

from dataclasses import dataclass, field
from typing import Mapping

SpeciesKind = str


@dataclass(frozen=True)
class Species:
    id: str
    kind: SpeciesKind
    genome_defaults: Mapping[str, float] = field(default_factory=dict)
    behavior_profile: str = "default"
    attack_profile: str = "none"


class SpeciesRegistry:
    def __init__(self) -> None:
        self._species: dict[str, Species] = {}

    def register(self, species: Species) -> None:
        if not species.id:
            raise ValueError("species id must not be empty")
        if species.id in self._species:
            raise ValueError(f"species already registered: {species.id}")
        self._species[species.id] = species

    def get(self, species_id: str) -> Species | None:
        return self._species.get(species_id)

    def all(self) -> tuple[Species, ...]:
        return tuple(self._species.values())


DEFAULT_SPECIES = (
    Species(
        id="worm_basic",
        kind="worm",
        genome_defaults={
            "aggression": 0.3,
            "stealth": 0.4,
            "adaptability": 0.5,
            "resilience": 0.3,
            "replication": 2.0,
        },
        behavior_profile="worm_swarm",
        attack_profile="infection",
    ),
    Species(
        id="virus_fast",
        kind="virus",
        genome_defaults={
            "aggression": 0.6,
            "stealth": 0.2,
            "adaptability": 0.7,
            "resilience": 0.1,
            "replication": 8.0,
        },
        behavior_profile="virus_spread",
        attack_profile="memory_pressure",
    ),
    Species(
        id="botnet_node",
        kind="bot",
        genome_defaults={
            "aggression": 0.1,
            "stealth": 0.8,
            "adaptability": 0.4,
            "resilience": 0.6,
            "replication": 1.0,
        },
        behavior_profile="botnet_sync",
        attack_profile="scan_pressure",
    ),
    Species(
        id="dos_agent",
        kind="dos",
        genome_defaults={
            "aggression": 0.9,
            "stealth": 0.1,
            "adaptability": 0.2,
            "resilience": 0.4,
            "replication": 0.0,
        },
        behavior_profile="dos_pressure",
        attack_profile="dos_pressure",
    ),
)


def default_species_registry() -> SpeciesRegistry:
    registry = SpeciesRegistry()
    for species in DEFAULT_SPECIES:
        registry.register(species)
    return registry
