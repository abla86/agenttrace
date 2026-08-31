from __future__ import annotations

from typing import Any

from .view_model import WarRoomViewModel
from agenttrace.simulation.worm_biology import express_genome, WormGenome


def build_worm_visuals(view: WarRoomViewModel, width: float = 400.0, height: float = 240.0) -> list[dict[str, Any]]:
    """Project the authoritative simulation worms into render-ready data.

    Coordinates are normalized to the requested canvas without introducing any
    new simulation randomness or changing simulation state.
    """
    if width <= 0 or height <= 0:
        raise ValueError("canvas dimensions must be positive")

    result: list[dict[str, Any]] = []
    for worm in view.worms:
        x = float(worm.get("x", 0.0))
        y = float(worm.get("y", 0.0))
        genome = WormGenome(
            aggression=float(worm.get("aggression", 0.0)),
            stealth=float(worm.get("stealth", 0.0)),
            replication=max(1, min(10, int(1 + float(worm.get("mutation_level", 0.0)) * 9))),
            resilience=max(0.0, min(1.0, float(worm.get("health", 100.0)) / 100.0)),
            adaptability=max(0.0, min(1.0, float(worm.get("mutation_level", 0.0)))),
        ).bounded()
        phenotype = express_genome(genome)
        result.append(
            {
                "id": worm.get("id"),
                "x": x,
                "y": y,
                "radius": 4.0 + phenotype.speed * 2.0,
                "opacity": max(0.05, phenotype.detectability),
                "speed": phenotype.speed,
                "stealth": genome.stealth,
                "health": worm.get("health"),
                "energy": worm.get("energy"),
                "mutations": worm.get("mutations", []),
            }
        )
    return result
