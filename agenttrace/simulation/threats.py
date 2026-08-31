from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from .models import SimulationEvent


class ThreatSpecies(str, Enum):
    WORM = "worm"
    VIRUS = "virus"
    BOT = "bot"
    DOS_AGENT = "dos_agent"


class ThreatPattern(str, Enum):
    SCAN = "scan"
    EXPLOIT = "exploit"
    LATERAL_MOVEMENT = "lateral_movement"
    EXFILTRATION = "exfiltration"
    DOS = "dos"


@dataclass(frozen=True)
class ThreatProfile:
    species: ThreatSpecies
    pattern: ThreatPattern
    intensity: float
    duration_ticks: int
    target: str

    def __post_init__(self) -> None:
        if not 0.0 <= self.intensity <= 1.0:
            raise ValueError("intensity must be between 0 and 1")
        if self.duration_ticks < 1:
            raise ValueError("duration_ticks must be positive")


@dataclass(frozen=True)
class SceneProfile:
    id: str
    capacity: float
    latency: float
    defense_level: float

    def __post_init__(self) -> None:
        for name, value in (
            ("capacity", self.capacity),
            ("latency", self.latency),
            ("defense_level", self.defense_level),
        ):
            if not 0.0 <= value <= 1.0:
                raise ValueError(f"{name} must be between 0 and 1")


class ThreatSimulationEngine:
    """Simulates bounded, non-network threat pressure inside the lab."""

    def evaluate(self, profile: ThreatProfile, scene: SceneProfile) -> SimulationEvent:
        pressure = min(
            1.0,
            profile.intensity * 0.7
            + (1.0 - scene.capacity) * 0.2
            + scene.latency * 0.1
            - scene.defense_level * 0.4,
        )
        pressure = max(0.0, pressure)
        return SimulationEvent(
            0,
            "THREAT_SIMULATED",
            details={
                "species": profile.species.value,
                "pattern": profile.pattern.value,
                "target": profile.target,
                "duration_ticks": profile.duration_ticks,
                "intensity": profile.intensity,
                "scene_id": scene.id,
                "pressure": pressure,
                "safe_simulation": True,
            },
        )


class SceneManager:
    def __init__(self) -> None:
        self.scenes: dict[str, SceneProfile] = {}

    def register(self, scene: SceneProfile) -> None:
        self.scenes[scene.id] = scene

    def get(self, scene_id: str) -> SceneProfile:
        try:
            return self.scenes[scene_id]
        except KeyError as exc:
            raise KeyError(f"Unknown simulation scene: {scene_id}") from exc

    def list(self) -> tuple[SceneProfile, ...]:
        return tuple(self.scenes.values())
