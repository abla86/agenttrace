from __future__ import annotations

import json
import sqlite3
import time
from dataclasses import asdict
from typing import Any, Dict, List

from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route

from agenttrace.evaluation.models import (
    ActionCapability,
    AgentPhase,
    TaintLabel,
    ToolManifest,
    TraceNode,
)
from agenttrace.policy.policy_engine import PolicyEngine
from agenttrace.policy.tool_registry import ToolManifestRegistry


class SQLiteTraceStore:
    def __init__(self, db_path: str = "agenttrace_audit.db") -> None:
        self.db_path = db_path
        self._init_db()

    def _init_db(self) -> None:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS audit_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp REAL NOT NULL,
                    node_id TEXT NOT NULL,
                    taint TEXT NOT NULL,
                    phase TEXT NOT NULL,
                    action TEXT NOT NULL,
                    allowed INTEGER NOT NULL,
                    reason TEXT NOT NULL,
                    content_hash TEXT NOT NULL
                )
                """
            )
            conn.commit()

    def log_event(
        self,
        node: TraceNode,
        phase: AgentPhase,
        action: ActionCapability,
        allowed: bool,
        reason: str,
    ) -> None:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """
                INSERT INTO audit_events
                (timestamp,node_id,taint,phase,action,allowed,reason,content_hash)
                VALUES (?,?,?,?,?,?,?,?)
                """,
                (
                    time.time(),
                    node.node_id,
                    node.taint.value,
                    phase.value,
                    action.value,
                    int(allowed),
                    reason,
                    node.node_hash,
                ),
            )
            conn.commit()

    def get_recent_traces(self, limit: int = 50) -> List[Dict[str, Any]]:
        limit = max(1, min(limit, 500))
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute(
                "SELECT * FROM audit_events ORDER BY id DESC LIMIT ?", (limit,)
            ).fetchall()
            return [dict(row) for row in rows]


store = SQLiteTraceStore()
registry = ToolManifestRegistry()
nodes_state: Dict[str, TraceNode] = {}


def _parse_manifest(body: Dict[str, Any]) -> ToolManifest:
    return ToolManifest(
        name=str(body["name"]),
        schema=dict(body.get("schema", {})),
        capabilities=tuple(
            ActionCapability(value) for value in body.get("capabilities", [])
        ),
        version=str(body.get("version", "1")),
    )


async def register_tool(request):
    try:
        body = await request.json()
        manifest = _parse_manifest(body)
        fingerprint = registry.register(manifest)
        return JSONResponse(
            {"registered": True, "tool": manifest.name, "fingerprint": fingerprint}
        )
    except (json.JSONDecodeError, KeyError, TypeError, ValueError) as exc:
        return JSONResponse({"error": str(exc)}, status_code=400)


async def intercept_tool_call(request):
    try:
        body = await request.json()
        node_id = str(body.get("node_id", f"node_{int(time.time() * 1000)}"))
        taint = TaintLabel(body.get("taint", TaintLabel.USER_INTENT.value))
        phase = AgentPhase(body.get("phase", AgentPhase.EXECUTION.value))
        action = ActionCapability(body.get("action", ActionCapability.READ.value))
        content = str(body.get("content", ""))
        tool_name = body.get("tool_name")

        node = TraceNode(node_id=node_id, taint=taint, content=content)
        nodes_state[node_id] = node

        tool = None
        if tool_name:
            tool = ToolManifest(
                name=str(tool_name),
                schema=dict(body.get("schema", {})),
                capabilities=tuple(
                    ActionCapability(value)
                    for value in body.get("capabilities", [action.value])
                ),
                version=str(body.get("version", "1")),
            )

        decision = PolicyEngine(registry).evaluate(
            nodes_state,
            phase,
            action,
            [node_id],
            tool,
        )
        store.log_event(
            node,
            phase,
            action,
            decision.decision.value == "ALLOW",
            decision.reason,
        )

        return JSONResponse(
            {
                "allowed": decision.decision.value == "ALLOW",
                "decision": decision.decision.value,
                "reason": decision.reason,
                "node_hash": node.node_hash,
                "tool_name": decision.tool_name,
                "timestamp": time.time(),
            }
        )
    except (json.JSONDecodeError, KeyError, TypeError, ValueError) as exc:
        return JSONResponse({"error": str(exc)}, status_code=400)


async def list_audit_log(request):
    try:
        limit = int(request.query_params.get("limit", "50"))
    except ValueError:
        limit = 50
    traces = store.get_recent_traces(limit)
    return JSONResponse({"count": len(traces), "traces": traces})


routes = [
    Route("/v1/gateway/tools/register", register_tool, methods=["POST"]),
    Route("/v1/gateway/intercept", intercept_tool_call, methods=["POST"]),
    Route("/v1/gateway/audit", list_audit_log, methods=["GET"]),
]

app = Starlette(routes=routes)
