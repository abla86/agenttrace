from __future__ import annotations

from dataclasses import asdict
from typing import Any

from .view_model import WarRoomViewModel


def build_inspector(view: WarRoomViewModel, x: float, y: float) -> dict[str, Any]:
    worm = next(
        (item for item in view.worms if item.get("x") == x and item.get("y") == y),
        None,
    )
    defense = next(
        (item for item in view.defenses if item.get("x") == x and item.get("y") == y),
        None,
    )
    proposals = tuple(
        item
        for item in view.proposals
        if item.get("parameters", {}).get("x") == x
        or item.get("parameters", {}).get("y") == y
    )
    return {
        "cell": {"x": x, "y": y},
        "worm": worm,
        "defense": defense,
        "proposals": proposals,
        "empty": worm is None and defense is None,
    }
