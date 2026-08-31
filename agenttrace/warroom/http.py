from __future__ import annotations

from typing import Any

from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route, WebSocketRoute

from .api import WarRoomRuntime, get_runtime
from .dashboard import build_dashboard_payload
from .events import event_stream
from .presentation import _view_from_dict
from .metrics import build_visualization_payload


def _runtime(request) -> WarRoomRuntime:
    return get_runtime()


def _dashboard_payload(raw: dict[str, Any]) -> dict[str, Any]:
    view = _view_from_dict(raw)
    payload = build_dashboard_payload(view)
    payload["visualizations"] = build_visualization_payload(view)
    payload["tick"] = view.tick
    payload["arena"] = view.arena
    payload["drift_state"] = view.drift
    payload["worms"] = list(view.worms)
    payload["defenses"] = list(view.defenses)
    payload["proposals"] = list(view.proposals)
    payload["events"] = list(view.recent_events)
    return payload


async def state_endpoint(request) -> JSONResponse:
    return JSONResponse(_dashboard_payload(_runtime(request).state()))


async def events_endpoint(request) -> JSONResponse:
    return JSONResponse(list(_runtime(request).events()))


async def proposals_endpoint(request) -> JSONResponse:
    return JSONResponse(list(_runtime(request).proposals()))


async def tick_endpoint(request) -> JSONResponse:
    return JSONResponse(_dashboard_payload(_runtime(request).tick()))


async def reset_endpoint(request) -> JSONResponse:
    return JSONResponse(_dashboard_payload(_runtime(request).reset()))


async def promote_endpoint(request) -> JSONResponse:
    payload: dict[str, Any] = await request.json()
    proposal_id = payload.get("proposal_id")
    if not isinstance(proposal_id, str) or not proposal_id:
        return JSONResponse({"error": "proposal_id is required"}, status_code=400)
    try:
        result = _runtime(request).promote(proposal_id)
        return JSONResponse({
            "promoted": result["promoted"],
            "proposal_id": result["proposal_id"],
            "state": _dashboard_payload(result["state"]),
        })
    except KeyError:
        return JSONResponse({"error": "proposal not found"}, status_code=404)
    except PermissionError as exc:
        return JSONResponse({"error": str(exc)}, status_code=403)


routes = [
    Route("/simulation/state", state_endpoint, methods=["GET"]),
    Route("/simulation/events", events_endpoint, methods=["GET"]),
    Route("/simulation/proposals", proposals_endpoint, methods=["GET"]),
    Route("/simulation/tick", tick_endpoint, methods=["POST"]),
    Route("/simulation/reset", reset_endpoint, methods=["POST"]),
    Route("/simulation/proposal/promote", promote_endpoint, methods=["POST"]),
    WebSocketRoute("/simulation/stream", event_stream),
]

app = Starlette(routes=routes)
