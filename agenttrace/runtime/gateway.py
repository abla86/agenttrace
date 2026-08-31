from __future__ import annotations

import json
import sqlite3
import time
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
                    content_hash TEXT NOT NULL,
                    tool_name TEXT,
                    tool_fingerprint TEXT
                )
                """
            )
            columns = {
                row[1]
                for row in conn.execute("PRAGMA table_info(audit_events)").fetchall()
            }
            if "tool_name" not in columns:
                conn.execute("ALTER TABLE audit_events ADD COLUMN tool_name TEXT")
            if "tool_fingerprint" not in columns:
                conn.execute("ALTER TABLE audit_events ADD COLUMN tool_fingerprint TEXT")
            conn.commit()

    def log_event(
        self,
        node: TraceNode,
        phase: AgentPhase,
        action: ActionCapability,
        allowed: bool,
        reason: str,
        tool_name: str | None = None,
        tool_fingerprint: str | None = None,
    ) -> None:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """
                INSERT INTO audit_events
                (timestamp,node_id,taint,phase,action,allowed,reason,content_hash,
                 tool_name,tool_fingerprint)
                VALUES (?,?,?,?,?,?,?,?,?,?)
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
                    tool_name,
                    tool_fingerprint,
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
            {
                "registered": True,
                "tool": manifest.name,
                "fingerprint": fingerprint,
                "capabilities": [c.value for c in manifest.capabilities],
                "version": manifest.version,
            }
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
        parent_ids = tuple(str(x) for x in body.get("parent_ids", []))

        node = TraceNode(
            node_id=node_id,
            taint=taint,
            content=content,
            parent_ids=parent_ids,
        )
        nodes_state[node_id] = node

        tool: ToolManifest | None = None
        tool_fingerprint: str | None = None
        if tool_name:
            tool = ToolManifest(
                name=str(tool_name),
                schema=dict(body.get("schema", {})),
                capabilities=tuple(
                    ActionCapability(value)
                    for value in body.get("capabilities", [])
                ),
                version=str(body.get("version", "1")),
            )
            tool_fingerprint = registry.get_fingerprint(tool.name)

            # An intercepted call may only use a tool that is already registered.
            # The client cannot self-register a privileged manifest in the same call.
            if tool_fingerprint is None:
                reason = "TOOL_NOT_REGISTERED"
                store.log_event(
                    node,
                    phase,
                    action,
                    False,
                    reason,
                    tool.name,
                    None,
                )
                return JSONResponse(
                    {
                        "allowed": False,
                        "decision": "BLOCK",
                        "reason": reason,
                        "node_hash": node.node_hash,
                        "tool_name": tool.name,
                        "timestamp": time.time(),
                    },
                    status_code=403,
                )

        decision = PolicyEngine(registry).evaluate(
            nodes_state,
            phase,
            action,
            [node_id],
            tool,
        )

        allowed = decision.decision.value == "ALLOW"
        store.log_event(
            node,
            phase,
            action,
            allowed,
            decision.reason,
            decision.tool_name,
            tool_fingerprint,
        )

        return JSONResponse(
            {
                "allowed": allowed,
                "decision": decision.decision.value,
                "reason": decision.reason,
                "node_hash": node.node_hash,
                "parent_ids": list(parent_ids),
                "tool_name": decision.tool_name,
                "tool_fingerprint": tool_fingerprint,
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
