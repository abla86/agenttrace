from __future__ import annotations

from typing import Any

from .view_model import WarRoomViewModel
from .worm_visualization import build_worm_visuals


def _effect_for_worm(worm_id: str | None, events: tuple[dict[str, Any], ...]) -> str:
    if worm_id is None:
        return "idle"
    for event in reversed(events):
        if event.get("worm_id") != worm_id:
            continue
        event_type = str(event.get("type", ""))
        details = event.get("details", {})
        if "DEFENSE_TRIGGERED" in event_type or "DEFENSE_TRAP_TRIGGERED" in event_type:
            return "evade"
        if "PROPAGATION" in event_type:
            return "replicate"
        if "WORM_MUTATED" in event_type:
            mutation = str(details.get("mutation", ""))
            if mutation in {"stealth", "evade_defense"}:
                return "hide"
            return "mutate"
        if "WORM_MOVED" in event_type:
            return "probe"
    return "idle"


def build_animated_worms(view: WarRoomViewModel) -> list[dict[str, Any]]:
    base = build_worm_visuals(view)
    events = view.recent_events
    animated: list[dict[str, Any]] = []
    for worm in base:
        effect = _effect_for_worm(worm.get("id"), events)
        speed = float(worm.get("speed", 0.0))
        stealth = float(worm.get("stealth", 0.0))
        mutation_level = min(1.0, max(0.0, float(worm.get("radius", 4.0)) / 12.0))
        animated.append(
            {
                **worm,
                "effect": effect,
                "glow": min(24.0, 4.0 + mutation_level * 20.0),
                "render_speed": max(0.1, speed),
                "opacity": max(0.05, 1.0 - stealth),
                "pulse": effect in {"attack", "mutate", "replicate"},
            }
        )
    return animated
