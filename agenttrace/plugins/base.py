from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

from ..events import AgentEvent

if TYPE_CHECKING:
    from ..core import AgentTrace


class AgentTracePlugin(ABC):
    """Optional extension point; concrete plugins live outside the core."""

    @abstractmethod
    def plugin_name(self) -> str:
        """Return a stable identifier for the plugin."""
        raise NotImplementedError

    def on_load(self, trace: AgentTrace) -> None:
        del trace

    def on_event(self, event: AgentEvent) -> None:
        del event
