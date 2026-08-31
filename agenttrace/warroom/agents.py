from __future__ import annotations

from collections.abc import Iterable
from typing import Any

ALLOWED_STATES = {"idle", "monitoring", "investigating", "responding", "error"}


def build_agent_grid(view: Any, events: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    """Build read-only agent cards from War-Room simulation events."""
    latest: dict[str, dict[str, Any]] = {}

    for index, event in enumerate(events):
        details = event.get("details", {})
        if not isinstance(details, dict):
            details = {}
        agent_id = str(details.get("agent_id", details.get("agent", "simulation")))
        state = str(details.get("state", "monitoring"))
        if state not in ALLOWED_STATES:
            state = "error"

        health_raw = details.get("health", 100)
        try:
            health = max(0, min(100, float(health_raw)))
        except (TypeError, ValueError):
            health = 0.0

        latest[agent_id] = {
            "id": agent_id,
            "name": str(details.get("name", agent_id)),
            "role": str(details.get("role", "simulation")),
            "state": state,
            "lastAction": str(details.get("label", event.get("type", "unknown"))),
            "health": health,
            "sequence": event.get("sequence", index),
        }

    return sorted(latest.values(), key=lambda item: str(item["id"]))
