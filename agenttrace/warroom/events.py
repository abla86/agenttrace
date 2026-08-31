from __future__ import annotations

import asyncio
import json
from typing import Any

from starlette.websockets import WebSocket, WebSocketDisconnect

from .api import WarRoomRuntime, get_runtime


async def event_stream(websocket: WebSocket) -> None:
    """Stream snapshots from the single War-Room runtime."""
    await websocket.accept()
    runtime: WarRoomRuntime = get_runtime()
    last_sequence = -1

    try:
        while True:
            snapshot: dict[str, Any] = runtime.state()
            events = snapshot.get("recent_events", ())
            new_events = [
                event
                for event in events
                if int(event.get("sequence", -1)) > last_sequence
            ]
            if new_events:
                last_sequence = max(
                    int(event["sequence"])
                    for event in new_events
                    if "sequence" in event
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
