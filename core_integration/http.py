from __future__ import annotations

import json

from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route

from .policy_server import EvaluationRequest, PolicyService


service = PolicyService()


async def health(_: Request) -> JSONResponse:
    return JSONResponse({"status": "ok"})


async def evaluate(request: Request) -> JSONResponse:
    body = await request.json()
    evaluation = service.evaluate(
        EvaluationRequest(
            tool_name=body["tool_name"],
            content=body["content"],
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
