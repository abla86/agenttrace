from __future__ import annotations

from collections import Counter

from .core import AgentTrace


class TraceAnalysis:
    """Read-only summaries over the events recorded in an :class:`AgentTrace`."""

    def __init__(self, trace: AgentTrace) -> None:
        self._trace = trace

    def count_events(self) -> int:
        return len(self._trace.events)

    def event_types(self) -> dict[str, int]:
        """Number of events per ``event_type``."""
        return dict(Counter(event.event_type for event in self._trace.events))

    def severity_distribution(self) -> dict[str, int]:
        """Number of events per ``payload["severity"]`` (events without one are skipped)."""
        return dict(
            Counter(
                str(event.payload["severity"])
                for event in self._trace.events
                if "severity" in event.payload
            )
        )
