from __future__ import annotations

from typing import Any, Dict, List, Mapping, Sequence

from agenttrace.audit.audit_log import AuditLog, merkle_root
from agenttrace.evaluation.models import (
    ActionCapability,
    AgentPhase,
    Decision,
    EvaluationResult,
    TaintLabel,
    ToolManifest,
    TraceNode,
)
from agenttrace.policy.policy_engine import PolicyEngine
from agenttrace.policy.tool_registry import ToolManifestRegistry


class EvaluationLab:
    """Deterministic policy evaluation lab with auditable trace events."""

    def __init__(self) -> None:
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
                "node_hash": node.node_hash,
            },
        )
        return node

    def evaluate(
        self,
        scenario: str,
        phase: AgentPhase,
        action: ActionCapability,
        source_ids: Sequence[str],
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
                "scenario": scenario,
                "decision": decision.decision.value,
                "reason": decision.reason,
                "phase": decision.phase.value,
                "action": decision.action.value,
                "source_ids": list(decision.source_ids),
                "tool_name": decision.tool_name,
            },
        )
        return EvaluationResult(scenario=scenario, decisions=[decision])

    def audit_root(self) -> str:
        return self.audit.root()

    def trace_events(self) -> List[dict[str, Any]]:
        return [
            {
                "sequence": event.sequence,
                "event_type": event.event_type,
                "payload": event.payload,
                "digest": event.digest(),
            }
            for event in self.audit.events
        ]


class MultiTurnAttackSimulator:
    """Runs bounded attack scenarios without executing attack payloads."""

    def __init__(self) -> None:
        self.nodes: Dict[str, TraceNode] = {}
        self.turns: List[Dict[str, Any]] = []
        self.registry = ToolManifestRegistry()
        self.audit = AuditLog()

    def _trace_root(self) -> str:
        leaves = [
            f"{node.node_id}:{node.node_hash}"
            for node in sorted(self.nodes.values(), key=lambda n: n.node_id)
        ]
        return merkle_root(leaves)

    @staticmethod
    def _tool_from_step(step: Mapping[str, Any]) -> ToolManifest | None:
        tool = step.get("tool")
        if isinstance(tool, ToolManifest):
            return tool
        if not isinstance(tool, Mapping):
            return None
        try:
            caps = tuple(
                ActionCapability(value)
                for value in tool.get("capabilities", [])
            )
            return ToolManifest(
                name=str(tool["name"]),
                schema=dict(tool.get("schema", {})),
                capabilities=caps,
                version=str(tool.get("version", "1")),
            )
        except (KeyError, TypeError, ValueError):
            return None

    def execute_scenario(
        self,
        scenario_name: str,
        steps: Sequence[Mapping[str, Any]],
    ) -> Dict[str, Any]:
        self.nodes.clear()
        self.turns.clear()
        self.audit = AuditLog()
        blocked_turns = 0

        for idx, step in enumerate(steps, start=1):
            node_id = str(step.get("node_id", f"N_{idx}"))
            parent_ids = tuple(step.get("parent_ids", ()))
            node = TraceNode(
                node_id=node_id,
                taint=step["taint"],
                content=str(step.get("payload", "")),
                parent_ids=parent_ids,
            )
            self.nodes[node_id] = node

            self.audit.append(
                "TRACE_NODE",
                {
                    "turn": idx,
                    "node_id": node_id,
                    "taint": node.taint.value,
                    "parent_ids": list(parent_ids),
                    "node_hash": node.node_hash,
                },
            )

            tool = self._tool_from_step(step)
            if tool is not None and step.get("register_tool", False):
                self.registry.register(tool)
                self.audit.append(
                    "TOOL_REGISTERED",
                    {
                        "turn": idx,
                        "tool_name": tool.name,
                        "fingerprint": self.registry.get_fingerprint(tool.name),
                    },
                )

            tool_valid = bool(step.get("tool_valid", True))
            if tool is not None:
                tool_valid = tool_valid and self.registry.verify(tool)

            if not tool_valid:
                decision_value = Decision.BLOCK
                reason = "TOOL_MANIFEST_INVALID"
                tool_name = tool.name if tool else None
            else:
                policy = PolicyEngine(self.registry)
                pd = policy.evaluate(
                    self.nodes,
                    step["phase"],
                    step["action"],
                    [node_id],
                    tool,
                )
                decision_value = pd.decision
                reason = pd.reason
                tool_name = pd.tool_name

            allowed = decision_value == Decision.ALLOW
            if not allowed:
                blocked_turns += 1

            event_type = "ATTACK_ALLOWED" if allowed else "ATTACK_BLOCKED"
            self.audit.append(
                event_type,
                {
                    "turn": idx,
                    "node_id": node_id,
                    "action": step["action"].value,
                    "phase": step["phase"].value,
                    "reason": reason,
                    "tool_name": tool_name,
                },
            )

            self.turns.append(
                {
                    "turn": idx,
                    "node_id": node_id,
                    "parent_ids": list(parent_ids),
                    "action": step["action"].value,
                    "phase": step["phase"].value,
                    "allowed": allowed,
                    "decision": decision_value.value,
                    "reason": reason,
                    "tool_name": tool_name,
                }
            )

        total_turns = len(self.turns)
        attack_success = (
            bool(self.turns)
            and blocked_turns == 0
            and "benign" not in scenario_name.lower()
        )

        return {
            "scenario": scenario_name,
            "total_turns": total_turns,
            "blocked_turns": blocked_turns,
            "allowed_turns": total_turns - blocked_turns,
            "attack_success_rate_pct": (
                (total_turns - blocked_turns) / total_turns * 100.0
                if total_turns
                else 0.0
            ),
            "attack_success": attack_success,
            "drift_detected": blocked_turns > 0,
            "trace_root": self._trace_root(),
            "audit_root": self.audit.root(),
            "turn_log": list(self.turns),
            "events": [
                {
                    "sequence": event.sequence,
                    "event_type": event.event_type,
                    "payload": event.payload,
                    "digest": event.digest(),
                }
                for event in self.audit.events
            ],
        }
