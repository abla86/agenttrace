from __future__ import annotations

import asyncio
import json
from typing import Any

from starlette.websockets import WebSocket, WebSocketDisconnect

from .api import WarRoomRuntime, get_runtime


def _event_sequence(event: dict[str, Any], fallback: int) -> int:
    value = event.get("sequence")
    if isinstance(value, int):
        return value
    return fallback


async def event_stream(websocket: WebSocket) -> None:
    """Stream new War-Room events from the single shared runtime."""
    await websocket.accept()
    runtime: WarRoomRuntime = get_runtime()
    last_sequence = -1

    try:
        while True:
            snapshot: dict[str, Any] = runtime.state()
            events = list(snapshot.get("recent_events", ()))
            sequenced = [
                (event, _event_sequence(event, index))
                for index, event in enumerate(events)
            ]
            new_events = [
                event
                for event, sequence in sequenced
                if sequence > last_sequence
            ]

            if new_events:
                last_sequence = max(
                    sequence for _, sequence in sequenced if sequence > last_sequence
                )
                await websocket.send_text(
                    json.dumps(
                        {
                            "type": "simulation.events",
                            "tick": snapshot["tick"],
                            "events": new_events,
                        }
                    )
                )

            await asyncio.sleep(0.2)
    except WebSocketDisconnect:
        return
