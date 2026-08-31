from __future__ import annotations

from dataclasses import asdict
from typing import Any

from .agents import build_agent_grid
from .api import WarRoomRuntime, get_runtime
from .incidents import build_incident_timeline
from .inspector import build_inspector
from .view_model import WarRoomViewModel


def build_warroom_presentation(
    view: WarRoomViewModel,
    selection: tuple[float, float] | None = None,
) -> dict[str, Any]:
    """Build the complete read-only payload consumed by War-Room UI layers."""
    inspector = None
    if selection is not None:
        inspector = build_inspector(view, selection[0], selection[1])

    events = list(view.recent_events)
    return {
        "tick": view.tick,
        "arena": view.arena,
        "drift": view.drift,
        "worms": list(view.worms),
        "defenses": list(view.defenses),
        "proposals": list(view.proposals),
        "events": events,
        "incidents": build_incident_timeline(events),
        "agents": build_agent_grid(view, events),
        "inspector": inspector,
        "overlays": {
            "selection": inspector["cell"] if inspector else None,
            "proposal_count": len(view.proposals),
            "event_count": len(events),
            "incident_count": len(build_incident_timeline(events)),
        },
    }


def presentation_for_runtime(
    runtime: WarRoomRuntime | None = None,
    selection: tuple[float, float] | None = None,
) -> dict[str, Any]:
    runtime = runtime or get_runtime()
    payload = runtime.state()
    view = _view_from_dict(payload)
    return build_warroom_presentation(view, selection)


def _view_from_dict(payload: dict[str, Any]) -> WarRoomViewModel:
    return WarRoomViewModel(
        tick=payload["tick"],
        arena=payload["arena"],
        drift=payload["drift"],
        worms=tuple(payload["worms"]),
        defenses=tuple(payload["defenses"]),
        proposals=tuple(payload["proposals"]),
        recent_events=tuple(payload["recent_events"]),
    )
