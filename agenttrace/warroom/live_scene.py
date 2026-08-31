from __future__ import annotations

from typing import Any

from .metrics import build_visualization_payload
from .view_model import WarRoomViewModel
from .worm_animation import build_animated_worms


def build_live_scene(view: WarRoomViewModel) -> dict[str, Any]:
    """Compose one read-only frame for the live War-Room renderer."""
    return {
        "tick": view.tick,
        "worms": build_animated_worms(view),
        "defenses": list(view.defenses),
        "proposals": list(view.proposals),
        "events": list(view.recent_events),
        "metrics": build_visualization_payload(view),
    }
