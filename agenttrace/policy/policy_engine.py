from typing import Dict, Iterable

from agenttrace.evaluation.models import (
    ActionCapability,
    AgentPhase,
    Decision,
    PolicyDecision,
    TaintLabel,
    ToolManifest,
    TraceNode,
)
from agenttrace.policy.tool_registry import ToolManifestRegistry


class PolicyEngine:
    PRIVILEGED = {
        ActionCapability.WRITE,
        ActionCapability.NETWORK,
    }

    def __init__(self, registry: ToolManifestRegistry | None = None):
        self.registry = registry or ToolManifestRegistry()

    def evaluate(
        self,
        nodes: Dict[str, TraceNode],
        phase: AgentPhase,
        action: ActionCapability,
        source_ids: Iterable[str],
        tool: ToolManifest | None = None,
    ) -> PolicyDecision:
        sources = tuple(source_ids)

        if tool is not None:
            if not self.registry.verify(tool):
                return PolicyDecision(
                    Decision.BLOCK,
                    "TOOL_MANIFEST_INVALID",
                    phase,
                    action,
                    sources,
                    tool.name,
                )

            if action not in set(tool.capabilities):
                return PolicyDecision(
                    Decision.BLOCK,
                    "TOOL_CAPABILITY_NOT_GRANTED",
                    phase,
                    action,
                    sources,
                    tool.name,
                )

        if phase != AgentPhase.EXECUTION and action in self.PRIVILEGED:
            return PolicyDecision(
                Decision.BLOCK,
                "PHASE_CAPABILITY_DENIED",
                phase,
                action,
                sources,
                tool.name if tool else None,
            )

        for source_id in sources:
            node = nodes.get(source_id)
            if node is None:
                return PolicyDecision(
                    Decision.BLOCK,
                    "UNKNOWN_SOURCE",
                    phase,
                    action,
                    sources,
                    tool.name if tool else None,
                )

            if (
                node.taint
                in {TaintLabel.RAG_UNTRUSTED, TaintLabel.TOOL_OUTPUT_UNTRUSTED}
                and action in self.PRIVILEGED
            ):
                return PolicyDecision(
                    Decision.BLOCK,
                    "UNTRUSTED_DATA_CANNOT_AUTHORIZE_ACTION",
                    phase,
                    action,
                    sources,
                    tool.name if tool else None,
                )

            if (
                node.taint == TaintLabel.INTERNAL_SECRET
                and action == ActionCapability.NETWORK
            ):
                return PolicyDecision(
                    Decision.BLOCK,
                    "SECRET_TO_NETWORK_FLOW_DENIED",
                    phase,
                    action,
                    sources,
                    tool.name if tool else None,
                )

        return PolicyDecision(
            Decision.ALLOW,
            "POLICY_ALLOWED",
            phase,
            action,
            sources,
            tool.name if tool else None,
        )
