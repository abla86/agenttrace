from __future__ import annotations

from collections import Counter
from typing import Any

from .view_model import WarRoomViewModel


def build_metrics_panel(view: WarRoomViewModel) -> dict[str, float | int | str]:
    drift = view.drift
    return {
        "attackPressure": drift["active_worms"],
        "defenseCoverage": view.arena["defense_count"],
        "instability": drift.get("incident_rate", 0.0),
        "incidentRate": drift.get("incident_rate", 0.0),
        "healthIndex": drift.get("health_index", 100.0),
        "driftScore": drift.get("score", 0.0),
        "status": drift.get("status", "UNKNOWN"),
    }


def build_drift_series(view: WarRoomViewModel) -> list[dict[str, Any]]:
    series: list[dict[str, Any]] = []
    for event in view.recent_events:
        if event.get("type") not in {"drift.update", "drift_update"}:
            continue
        details = event.get("details", {})
        series.append({
            "sequence": event.get("sequence"),
            "tick": event.get("tick", event.get("sequence")),
            "driftScore": details.get("score", details.get("driftScore", view.drift.get("score", 0.0))),
            "healthIndex": details.get("health_index", details.get("healthIndex", view.drift.get("health_index", 100.0))),
        })
    return series


def build_worm_heatmap(view: WarRoomViewModel, size: int = 20) -> list[list[int]]:
    if size <= 0:
        raise ValueError("size must be positive")
    grid = [[0 for _ in range(size)] for _ in range(size)]
    for worm in view.worms:
        x, y = int(worm.get("x", -1)), int(worm.get("y", -1))
        if 0 <= x < size and 0 <= y < size:
            grid[y][x] += 1
    return grid


def build_defense_coverage(view: WarRoomViewModel, size: int = 20) -> list[list[int]]:
    if size <= 0:
        raise ValueError("size must be positive")
    grid = [[0 for _ in range(size)] for _ in range(size)]
    for defense in view.defenses:
        x, y = int(defense.get("x", -1)), int(defense.get("y", -1))
        if 0 <= x < size and 0 <= y < size:
            grid[y][x] = 1
    return grid


def build_visualization_payload(view: WarRoomViewModel) -> dict[str, Any]:
    return {
        "metrics": build_metrics_panel(view),
        "drift": build_drift_series(view),
        "wormHeatmap": build_worm_heatmap(view),
        "defenseCoverage": build_defense_coverage(view),
        "eventsByType": dict(Counter(event.get("type", "unknown") for event in view.recent_events)),
    }
