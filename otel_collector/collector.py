from dataclasses import dataclass
from threading import Lock
from typing import Protocol
from agenttrace.api import AuditLog, TaintLabel, TraceNode, merkle_root

class SpanLike(Protocol):
    name: str
    context: object

@dataclass(frozen=True)
class SpanRecord:
    name: str
    span_id: str

class AgentTraceCollector:
    def __init__(self) -> None:
        self.nodes: dict[str, TraceNode] = {}
        self.audit = AuditLog()
        self._lock = Lock()

    def consume_span(self, span: SpanLike) -> TraceNode:
        span_id = str(span.context.span_id)
        node = TraceNode(span_id, TaintLabel.TOOL_OUTPUT_UNTRUSTED, span.name, ())
        with self._lock:
            self.nodes[node.node_id] = node
            self.audit.append("otel.span", {"span": span.name, "span_id": span_id, "node_hash": node.node_hash})
        return node

    def finalize(self) -> dict:
        with self._lock:
            nodes = dict(self.nodes)
            audit = self.audit
        return {"nodes": nodes, "audit": audit, "merkle": merkle_root(node.node_hash for node in nodes.values())}
