from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List

from .scenes import SceneManager, default_scene_manager, Scene
from .species import SpeciesRegistry, default_species_registry, Species
from .threats import AttackEngine, MultiSwarmPolicy


@dataclass
class ThreatEntity:
    id: str
    species_id: str
    kind: str
    scene_id: str
    attack_profile: str
    genome: Dict[str, float] = field(default_factory=dict)


@dataclass(frozen=True)
class ThreatEvent:
    kind: str
    entity_id: str
    scene_id: str
    action: str
    details: dict


class MultiSpeciesEngine:
    def __init__(self, species: SpeciesRegistry | None = None) -> None:
        self.species = species or default_species_registry()
        self.entities: List[ThreatEntity] = []

    def spawn(self, species_id: str, scene_id: str, entity_id: str) -> ThreatEntity:
        spec = self.species.get(species_id)
        if spec is None:
            raise ValueError(f"unknown species: {species_id}")
        entity = ThreatEntity(
            id=entity_id,
            species_id=spec.id,
            kind=spec.kind,
            scene_id=scene_id,
            attack_profile=spec.attack_profile,
            genome=dict(spec.genome_defaults),
        )
        self.entities.append(entity)
        return entity

    def by_scene(self, scene_id: str) -> tuple[ThreatEntity, ...]:
        return tuple(e for e in self.entities if e.scene_id == scene_id)


class ThreatRuntime:
    """Deterministic, non-networked threat scenario runtime."""

    def __init__(
        self,
        species: SpeciesRegistry | None = None,
        scenes: SceneManager | None = None,
    ) -> None:
        self.species_engine = MultiSpeciesEngine(species)
        self.scenes = scenes or default_scene_manager()
        self.attack = AttackEngine()
        self.policy = MultiSwarmPolicy()

    def tick(self, metrics: dict) -> list[ThreatEvent]:
        events: list[ThreatEvent] = []
        for entity in self.species_engine.entities:
            scene = self.scenes.get(entity.scene_id)
            if scene is None:
                continue

            attack_result = self.attack.execute(entity, scene, metrics)
            action = self.policy.decide(entity, scene, metrics)
            events.append(
                ThreatEvent(
                    kind="THREAT_BEHAVIOR",
                    entity_id=entity.id,
                    scene_id=scene.id,
                    action=action,
                    details={"attack": attack_result, "species": entity.species_id},
                )
            )
        return events
