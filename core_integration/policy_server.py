from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from agenttrace.api import (
    ActionCapability,
    AgentPhase,
    AuditLog,
    Decision,
    PolicyDecision,
    PolicyEngine,
    TaintLabel,
    ToolManifest,
    TraceNode,
)


@dataclass(frozen=True)
class EvaluationRequest:
    tool_name: str
    content: str
    action: ActionCapability = ActionCapability.READ
    phase: AgentPhase = AgentPhase.EXECUTION
    version: str = "1"
    taint: TaintLabel = TaintLabel.TOOL_OUTPUT_UNTRUSTED


@dataclass(frozen=True)
class EvaluationResponse:
    decision: PolicyDecision
    audit_root: str
    node_hash: str
    tool_fingerprint: str


class PolicyService:
    def __init__(self, engine: PolicyEngine | None = None) -> None:
        self.engine = engine or PolicyEngine()

    def evaluate(self, request: EvaluationRequest) -> EvaluationResponse:
        node = TraceNode(
            node_id="request-node",
            taint=request.taint,
            content=request.content,
            parent_ids=(),
        )
        nodes = {node.node_id: node}

        manifest = ToolManifest(
            name=request.tool_name,
            schema={},
            capabilities=(request.action,),
            version=request.version,
        )
        fingerprint = self.engine.registry.register(manifest)

        decision = self.engine.evaluate(
            nodes,
            request.phase,
            request.action,
            (node.node_id,),
            manifest,
        )

        audit = AuditLog()
        audit.append(
            "policy.evaluation",
            {
                "tool_name": request.tool_name,
                "tool_fingerprint": fingerprint,
                "node_id": node.node_id,
                "node_hash": node.node_hash,
                "decision": decision.decision.value,
                "reason": decision.reason,
                "phase": decision.phase.value,
                "action": decision.action.value,
            },
        )

        return EvaluationResponse(
            decision=decision,
            audit_root=audit.root(),
            node_hash=node.node_hash,
            tool_fingerprint=fingerprint,
        )


def evaluate_request(
    tool_name: str,
    content: str,
    *,
    action: ActionCapability = ActionCapability.READ,
    phase: AgentPhase = AgentPhase.EXECUTION,
    version: str = "1",
    taint: TaintLabel = TaintLabel.TOOL_OUTPUT_UNTRUSTED,
) -> EvaluationResponse:
    return PolicyService().evaluate(
        EvaluationRequest(
            tool_name=tool_name,
            content=content,
            action=action,
            phase=phase,
            version=version,
            taint=taint,
        )
    )
