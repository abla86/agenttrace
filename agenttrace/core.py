from __future__ import annotations

from collections.abc import Callable, Mapping
from threading import RLock
from typing import Any

from .events import AgentEvent
from .state import AgentState

EventListener = Callable[[AgentEvent], None]
StateListener = Callable[[AgentState], None]


class AgentTrace:
    """Dependency-free state/event trace with a stable integration API.

    The trace owns history and notifies consumers. It deliberately knows
    nothing about a UI, War-Room, HTTP server, or other application.
    """

    def __init__(self) -> None:
        self._states: list[AgentState] = []
        self._events: list[AgentEvent] = []
        self._listeners: list[EventListener] = []
        self._state_listeners: list[StateListener] = []
        self._lock = RLock()

    @property
    def states(self) -> tuple[AgentState, ...]:
        with self._lock:
            return tuple(self._states)

    @property
    def events(self) -> tuple[AgentEvent, ...]:
        with self._lock:
            return tuple(self._events)

    def add_state(self, name: str, data: Mapping[str, Any] | None = None) -> AgentState:
        state = AgentState(name, dict(data or {}))
        with self._lock:
            self._states.append(state)
            state_listeners = tuple(self._state_listeners)

        for listener in state_listeners:
            listener(state)
        return state

    def add_event(
        self, event_type: str, payload: Mapping[str, Any] | None = None
    ) -> AgentEvent:
        event = AgentEvent(event_type, dict(payload or {}))
        with self._lock:
            self._events.append(event)
            listeners = tuple(self._listeners)

        for listener in listeners:
            listener(event)
        return event

    def subscribe(self, callback: EventListener) -> Callable[[], None]:
        """Subscribe to future events and return an unsubscribe callback."""
        with self._lock:
            if callback not in self._listeners:
                self._listeners.append(callback)

        def unsubscribe() -> None:
            with self._lock:
                if callback in self._listeners:
                    self._listeners.remove(callback)

        return unsubscribe

    on_event = subscribe

    def subscribe_states(self, callback: StateListener) -> Callable[[], None]:
        """Subscribe to future state snapshots and return an unsubscribe callback."""
        with self._lock:
            if callback not in self._state_listeners:
                self._state_listeners.append(callback)

        def unsubscribe() -> None:
            with self._lock:
                if callback in self._state_listeners:
                    self._state_listeners.remove(callback)

        return unsubscribe

    def clear(self) -> None:
        with self._lock:
            self._states.clear()
            self._events.clear()
