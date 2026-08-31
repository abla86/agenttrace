from __future__ import annotations

from typing import Any

from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route

from .api import WarRoomRuntime, get_runtime


def _runtime(request) -> WarRoomRuntime:
    return get_runtime()


async def state_endpoint(request) -> JSONResponse:
    return JSONResponse(_runtime(request).state())


async def events_endpoint(request) -> JSONResponse:
    return JSONResponse(list(_runtime(request).events()))


async def proposals_endpoint(request) -> JSONResponse:
    return JSONResponse(list(_runtime(request).proposals()))


async def tick_endpoint(request) -> JSONResponse:
    return JSONResponse(_runtime(request).tick())


async def reset_endpoint(request) -> JSONResponse:
    return JSONResponse(_runtime(request).reset())


async def promote_endpoint(request) -> JSONResponse:
    payload: dict[str, Any] = await request.json()
    proposal_id = payload.get("proposal_id")
    if not isinstance(proposal_id, str) or not proposal_id:
        return JSONResponse({"error": "proposal_id is required"}, status_code=400)
    try:
        return JSONResponse(_runtime(request).promote(proposal_id))
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
]

app = Starlette(routes=routes)
