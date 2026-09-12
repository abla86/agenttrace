from __future__ import annotations

from collections.abc import Callable
from typing import Protocol

from ..core import AgentTrace
from ..events import AgentEvent
from ..state import AgentState


class TraceSink(Protocol):
    """Consumer contract implemented by applications such as War-Room."""

    def push_state(self, state: AgentState) -> None: ...
    def push_event(self, event: AgentEvent) -> None: ...


def connect(trace: AgentTrace, sink: TraceSink) -> Callable[[], None]:
    """Connect a consumer without importing or depending on that consumer."""
    for state in trace.states:
        sink.push_state(state)

    return trace.subscribe(sink.push_event)
