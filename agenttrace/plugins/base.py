from __future__ import annotations

from abc import ABC
from typing import TYPE_CHECKING

from ..events import AgentEvent

if TYPE_CHECKING:
    from ..core import AgentTrace


class AgentTracePlugin(ABC):
    """Optional extension point; concrete plugins live outside the core."""

    def on_load(self, trace: AgentTrace) -> None:
        del trace

    def on_event(self, event: AgentEvent) -> None:
        del event
