from __future__ import annotations

from typing import Any

from .metrics import build_visualization_payload
from .view_model import WarRoomViewModel


def _severity(event: dict[str, Any]) -> str:
    event_type = str(event.get("type", ""))
    if "propagation" in event_type or "infection" in event_type:
        return "high"
    if "defense" in event_type or "anomaly" in event_type:
        return "medium"
    if "mutation" in event_type:
        return "low"
    return "low"


def _stage(event: dict[str, Any]) -> str:
    event_type = str(event.get("type", ""))
    if "infection" in event_type or "propagation" in event_type:
        return "DETECT"
    if "defense" in event_type:
        return "CONTAIN"
    if "mutation" in event_type or "drift" in event_type:
        return "ANALYZE"
    if "recover" in event_type:
        return "RECOVER"
    return "ANALYZE"


def build_incident_timeline(view: WarRoomViewModel) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    for event in view.recent_events:
        result.append(
            {
                "id": event.get("id", event.get("sequence")),
                "stage": _stage(event),
                "label": str(event.get("type", "UNKNOWN")),
                "agent": "SIMULATION",
                "tick": event.get("tick", event.get("sequence")),
                "timestamp": event.get("timestamp"),
                "severity": _severity(event),
            }
        )
    return result


def build_agent_grid(view: WarRoomViewModel) -> list[dict[str, Any]]:
    drift = view.drift
    health = float(drift.get("health_index", 100.0))
    risk = float(drift.get("score", 0.0))
    state = "error" if risk >= 80 else "responding" if risk >= 50 else "monitoring"
    return [
        {
            "id": "warroom-simulation",
            "name": "Simulation Engine",
            "role": "Deterministic threat simulation",
            "state": state,
            "lastAction": view.recent_events[-1].get("type") if view.recent_events else "idle",
            "health": max(0, min(100, health)),
        },
        {
            "id": "warroom-autonomy",
            "name": "Autonomy Engine",
            "role": "Bounded proposal generation",
            "state": "responding" if view.proposals else "monitoring",
            "lastAction": view.proposals[-1].get("code") if view.proposals else "monitoring",
            "health": max(0, min(100, 100 - risk)),
        },
    ]


def build_dashboard_payload(view: WarRoomViewModel) -> dict[str, Any]:
    visualization = build_visualization_payload(view)
    return {
        **visualization,
        "incidentTimeline": build_incident_timeline(view),
        "agents": build_agent_grid(view),
        "threat": {
            "score": view.drift.get("score", 0.0),
            "status": view.drift.get("status", "UNKNOWN"),
        },
    }
