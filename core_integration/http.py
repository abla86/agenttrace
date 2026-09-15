from __future__ import annotations

from typing import Any

from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route

from .policy_server import EvaluationRequest, PolicyService


service = PolicyService()


def _error(message: str) -> JSONResponse:
    return JSONResponse({"error": message}, status_code=400)


async def health(_: Request) -> JSONResponse:
    return JSONResponse({"status": "ok"})


async def evaluate(request: Request) -> JSONResponse:
    try:
        body: Any = await request.json()
    except ValueError:
        return _error("request body must be valid JSON")

    if not isinstance(body, dict):
        return _error("request body must be a JSON object")

    tool_name = body.get("tool_name")
    content = body.get("content")
    if not isinstance(tool_name, str) or not tool_name.strip():
        return _error("tool_name must be a non-empty string")
    if not isinstance(content, str):
        return _error("content must be a string")

    evaluation = service.evaluate(
        EvaluationRequest(
            tool_name=tool_name,
            content=content,
        )
    )
    decision = evaluation.decision
    return JSONResponse(
        {
            "decision": decision.decision.value,
            "reason": decision.reason,
            "phase": decision.phase.value,
            "action": decision.action.value,
            "source_ids": list(decision.source_ids),
            "tool_name": decision.tool_name,
            "node_hash": evaluation.node_hash,
            "tool_fingerprint": evaluation.tool_fingerprint,
            "audit_root": evaluation.audit_root,
        }
    )


app = Starlette(
    debug=False,
    routes=[
        Route("/health", health, methods=["GET"]),
        Route("/evaluate", evaluate, methods=["POST"]),
    ],
)
