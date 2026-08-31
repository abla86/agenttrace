import sqlite3
import json
import time
from typing import Dict, Any, List, Optional
from dataclasses import asdict
from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route
from agenttrace.evaluation.lab import (
    TraceNode,
    TaintLabel,
    AgentPhase,
    ActionCapability,
    EvaluationEngine,
    ToolManifestRegistry
)

class SQLiteTraceStore:
    def __init__(self, db_path: str = "agenttrace_audit.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS audit_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp REAL,
                    node_id TEXT,
                    taint TEXT,
                    phase TEXT,
                    action TEXT,
                    allowed INTEGER,
                    reason TEXT,
                    content_hash TEXT
                )
            """)
            conn.commit()

    def log_event(self, node: TraceNode, phase: AgentPhase, action: ActionCapability, allowed: bool, reason: str):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO audit_events (timestamp, node_id, taint, phase, action, allowed, reason, content_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (time.time(), node.node_id, node.taint.value, phase.value, action.value, int(allowed), reason, node.node_hash)
            )
            conn.commit()

    def get_recent_traces(self, limit: int = 50) -> List[Dict[str, Any]]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("SELECT * FROM audit_events ORDER BY id DESC LIMIT ?", (limit,))
            return [dict(r) for r in cursor.fetchall()]

store = SQLiteTraceStore()
registry = ToolManifestRegistry()
nodes_state: Dict[str, TraceNode] = {}

async def intercept_tool_call(request):
    try:
        body = await request.json()
        node_id = body.get("node_id", f"node_{int(time.time()*1000)}")
        taint = TaintLabel(body.get("taint", "USER_INTENT"))
        phase = AgentPhase(body.get("phase", "EXECUTION"))
        action = ActionCapability(body.get("action", "READ"))
        content = body.get("content", "")
        tool_name = body.get("tool_name")
        current_schema = body.get("schema", {})
        current_caps = [ActionCapability(c) for c in body.get("capabilities", [action.value])]

        node = TraceNode(node_id=node_id, taint=taint, content=content)
        nodes_state[node_id] = node

        tool_valid = True
        if tool_name:
            tool_valid = registry.verify_tool_integrity(tool_name, current_schema, current_caps)

        allowed, reason = EvaluationEngine.evaluate(
            nodes=nodes_state,
            phase=phase,
            action=action,
            source_ids=[node_id],
            tool_valid=tool_valid
        )

        store.log_event(node, phase, action, allowed, reason)

        return JSONResponse({
            "allowed": allowed,
            "decision": "ALLOW" if allowed else "BLOCK",
            "reason": reason,
            "node_hash": node.node_hash,
            "timestamp": time.time()
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

async def list_audit_log(request):
    traces = store.get_recent_traces()
    return JSONResponse({"count": len(traces), "traces": traces})

routes = [
    Route("/v1/gateway/intercept", intercept_tool_call, methods=["POST"]),
    Route("/v1/gateway/audit", list_audit_log, methods=["GET"])
]

app = Starlette(routes=routes)
