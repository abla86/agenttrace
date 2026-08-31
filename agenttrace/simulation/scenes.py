from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Iterable, Tuple


@dataclass(frozen=True)
class Scene:
    id: str
    capacity: float
    defense_level: float
    latency: float
    allowed_species: Tuple[str, ...] = field(default_factory=tuple)


class SceneManager:
    def __init__(self, scenes: Iterable[Scene] = ()) -> None:
        self._scenes: Dict[str, Scene] = {}
        for scene in scenes:
            self.add(scene)

    def add(self, scene: Scene) -> None:
        if not scene.id:
            raise ValueError("scene id must not be empty")
        if scene.capacity < 0:
            raise ValueError("scene capacity must be non-negative")
        if scene.id in self._scenes:
            raise ValueError(f"scene already registered: {scene.id}")
        self._scenes[scene.id] = scene

    def get(self, scene_id: str) -> Scene | None:
        return self._scenes.get(scene_id)

    def all(self) -> tuple[Scene, ...]:
        return tuple(self._scenes.values())


DEFAULT_SCENES = (
    Scene(
        id="memory_scene",
        capacity=500,
        defense_level=0.3,
        latency=0.1,
        allowed_species=("worm_basic", "virus_fast"),
    ),
    Scene(
        id="network_scene",
        capacity=2000,
        defense_level=0.5,
        latency=0.3,
        allowed_species=("worm_basic", "botnet_node"),
    ),
    Scene(
        id="cloud_scene",
        capacity=5000,
        defense_level=0.7,
        latency=0.2,
        allowed_species=("virus_fast", "botnet_node"),
    ),
    Scene(
        id="dos_scene",
        capacity=10000,
        defense_level=0.9,
        latency=0.05,
        allowed_species=("dos_agent",),
    ),
)


def default_scene_manager() -> SceneManager:
    return SceneManager(DEFAULT_SCENES)
