from typing import Any, Dict, List

from agenttrace.audit.audit_log import AuditLog
from agenttrace.evaluation.models import (
    ActionCapability,
    AgentPhase,
    EvaluationResult,
    TaintLabel,
    ToolManifest,
    TraceNode,
)
from agenttrace.policy.policy_engine import PolicyEngine


class EvaluationLab:

    def __init__(self):
        self.nodes: Dict[str, TraceNode] = {}
        self.policy = PolicyEngine()
        self.audit = AuditLog()

    def add_node(
        self,
        node_id: str,
        taint: TaintLabel,
        content: str,
        parent_ids: tuple[str, ...] = (),
    ) -> TraceNode:
        node = TraceNode(
            node_id=node_id,
            taint=taint,
            content=content,
            parent_ids=parent_ids,
        )
        self.nodes[node_id] = node

        self.audit.append(
            "TRACE_NODE",
            {
                "node_id": node.node_id,
                "taint": node.taint.value,
                "parent_ids": list(node.parent_ids),
            },
        )

        return node

    def evaluate(
        self,
        scenario: str,
        phase: AgentPhase,
        action: ActionCapability,
        source_ids: List[str],
        tool: ToolManifest | None = None,
    ) -> EvaluationResult:

        decision = self.policy.evaluate(
            self.nodes,
            phase,
            action,
            source_ids,
            tool,
        )

        self.audit.append(
            "POLICY_DECISION",
            {
                "decision": decision.decision.value,
                "reason": decision.reason,
                "phase": decision.phase.value,
                "action": decision.action.value,
                "source_ids": list(decision.source_ids),
                "tool_name": decision.tool_name,
            },
        )

        return EvaluationResult(
            scenario=scenario,
            decisions=[decision],
        )

    def audit_root(self) -> str:
        return self.audit.root()
