from __future__ import annotations

from collections.abc import Iterable
from typing import Any


INCIDENT_STAGES = ("DETECT", "ANALYZE", "CONTAIN", "ERADICATE", "RECOVER")
SEVERITIES = ("low", "medium", "high", "critical")


def build_incident_timeline(events: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    """Normalize simulation/audit events into a War-Room incident timeline."""
    normalized: list[dict[str, Any]] = []
    for index, event in enumerate(events):
        event_type = str(event.get("type", "unknown"))
        details = event.get("details", {})
        if not isinstance(details, dict):
            details = {}

        stage = str(details.get("stage", "ANALYZE")).upper()
        if stage not in INCIDENT_STAGES:
            stage = "ANALYZE"

        severity = str(details.get("severity", "medium")).lower()
        if severity not in SEVERITIES:
            severity = "medium"

        normalized.append(
            {
                "id": str(event.get("event_id", event.get("sequence", index))),
                "stage": stage,
                "label": str(details.get("label", event_type)),
                "agent": str(details.get("agent", "simulation")),
                "timestamp": str(event.get("timestamp", event.get("tick", ""))),
                "severity": severity,
                "source_event_type": event_type,
            }
        )
    return normalized
