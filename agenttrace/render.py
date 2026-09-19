from __future__ import annotations

import json
from typing import Any

from .core import AgentTrace


class TraceRenderer:
    """Serialise an :class:`AgentTrace` as JSON or human-readable text."""

    def __init__(self, trace: AgentTrace) -> None:
        self._trace = trace

    def to_dict(self) -> dict[str, Any]:
        return {
            "states": [{"name": s.name, "data": dict(s.data)} for s in self._trace.states],
            "events": [
                {"event_type": e.event_type, "payload": dict(e.payload)}
                for e in self._trace.events
            ],
        }

    def to_json(self, indent: int | None = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent, sort_keys=True, default=str)

    def to_text(self) -> str:
        lines = [
            f"[STATE] {s.name}: {json.dumps(dict(s.data), sort_keys=True, default=str)}"
            for s in self._trace.states
        ]
        lines += [
            f"[EVENT] {e.event_type}: {json.dumps(dict(e.payload), sort_keys=True, default=str)}"
            for e in self._trace.events
        ]
        return "\n".join(lines)
