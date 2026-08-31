from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable

from .api import WarRoomRuntime, get_runtime

EventHandler = Callable[[dict], Awaitable[None] | None]


class WarRoomRunner:
    """Optional live loop over the shared War-Room runtime.

    The runner only advances the simulation through the existing runtime and
    never creates a second simulation state or controller.
    """

    def __init__(
        self,
        runtime: WarRoomRuntime | None = None,
        interval_seconds: float = 0.5,
    ) -> None:
        if interval_seconds <= 0:
            raise ValueError("interval_seconds must be positive")
        self.runtime = runtime or get_runtime()
        self.interval_seconds = interval_seconds
        self._task: asyncio.Task | None = None
        self._handlers: set[EventHandler] = set()

    def subscribe(self, handler: EventHandler) -> None:
        self._handlers.add(handler)

    def unsubscribe(self, handler: EventHandler) -> None:
        self._handlers.discard(handler)

    @property
    def running(self) -> bool:
        return self._task is not None and not self._task.done()

    async def _run(self) -> None:
        while True:
            snapshot = self.runtime.tick()
            for handler in tuple(self._handlers):
                result = handler(snapshot)
                if asyncio.iscoroutine(result):
                    await result
            await asyncio.sleep(self.interval_seconds)

    def start(self) -> None:
        if self.running:
            return
        self._task = asyncio.create_task(self._run())

    async def stop(self) -> None:
        if self._task is None:
            return
        task = self._task
        self._task = None
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
