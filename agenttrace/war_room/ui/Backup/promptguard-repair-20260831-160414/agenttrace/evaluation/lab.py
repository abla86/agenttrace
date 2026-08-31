from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple


class TaintLabel(Enum):
    SYSTEM_TRUSTED = "SYSTEM_TRUSTED"
    USER_INTENT = "USER_INTENT"
    RAG_UNTRUSTED = "RAG_UNTRUSTED"
    INTERNAL_SECRET = "INTERNAL_SECRET"


class AgentPhase(Enum):
    PLANNING = "PLANNING"
    RETRIEVING = "RETRIEVING"
    EXECUTION = "EXECUTION"


class ActionCapability(Enum):
    READ = "READ"
    WRITE = "WRITE"
    NETWORK = "NETWORK"


def stable_sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def canonical_json(value: Any) -> str:
    return json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    )


def merkle_parent(left: str, right: str) -> str:
    return stable_sha256(f"{left}{right}")


def merkle_root(leaves: Sequence[str]) -> str:
    if not leaves:
        return stable_sha256("EMPTY")

    level = list(leaves)

    while len(level) > 1:
        if len(level) % 2:
            level.append(level[-1])

        level = [
            merkle_parent(level[i], level[i + 1])
            for i in range(0, len(level), 2)
        ]

    return level[0]


@dataclass(frozen=True)
class TraceNode:
    node_id: str
    taint: TaintLabel
    content: str
    parent_ids: Tuple[str, ...] = ()

    @property
    def node_hash(self) -> str:
        return stable_sha256(
            canonical_json(
                {
                    "node_id": self.node_id,
                    "taint": self.taint.value,
                    "content": self.content,
                    "parent_ids": list(self.parent_ids),
                }
            )
        )


@dataclass(frozen=True)
class ToolManifest:
    name: str
    schema: Dict[str, Any]
    capabilities: Tuple[ActionCapability, ...]

    @property
    def canonical(self) -> str:
        return canonical_json(
            {
                "name": self.name,
                "schema": self.schema,
                "capabilities": sorted(
                    capability.value for capability in self.capabilities
                ),
            }
        )

    @property
    def leaf_hash(self) -> str:
        return stable_sha256(self.canonical)


class ToolManifestRegistry:
    def __init__(self) -> None:
        self._manifests: Dict[str, ToolManifest] = {}

    def register_tool(
        self,
        tool_name: str,
        schema: Dict[str, Any],
        capabilities: Iterable[ActionCapability],
    ) -> str:
        manifest = ToolManifest(
            name=tool_name,
            schema=schema,
            capabilities=tuple(sorted(
                capabilities,
                key=lambda capability: capability.value,
            )),
        )
        self._manifests[tool_name] = manifest
        return manifest.leaf_hash

    def manifest_root(self) -> str:
        leaves = [
            self._manifests[name].leaf_hash
            for name in sorted(self._manifests)
        ]
        return merkle_root(leaves)

    def verify_tool_integrity(
        self,
        tool_name: str,
        current_schema: Dict[str, Any],
        current_capabilities: Iterable[ActionCapability],
    ) -> bool:
        registered = self._manifests.get(tool_name)

        if registered is None:
            return False

        current = ToolManifest(
            name=tool_name,
            schema=current_schema,
            capabilities=tuple(sorted(
                current_capabilities,
                key=lambda capability: capability.value,
            )),
        )

        return registered.leaf_hash == current.leaf_hash

    def snapshot(self) -> Dict[str, Any]:
        return {
            "root": self.manifest_root(),
            "tools": {
                name: {
                    "schema": manifest.schema,
                    "capabilities": [
                        capability.value
                        for capability in manifest.capabilities
                    ],
                    "leaf_hash": manifest.leaf_hash,
                }
                for name, manifest in sorted(self._manifests.items())
            },
        }


class EvaluationEngine:

    @staticmethod
    def evaluate(
        nodes: Dict[str, TraceNode],
        phase: AgentPhase,
        action: ActionCapability,
        source_ids: Sequence[str],
        tool_valid: bool = True,
    ) -> Tuple[bool, str]:

        if not tool_valid:
            return (
                False,
                "Tool provenance block: manifest is missing or has drifted",
            )

        if (
            phase != AgentPhase.EXECUTION
            and action in {
                ActionCapability.WRITE,
                ActionCapability.NETWORK,
            }
        ):
            return (
                False,
                f"FSM block: {action.value} is not permitted during "
                f"{phase.value}",
            )

        for source_id in source_ids:
            node = nodes.get(source_id)

            if node is None:
                return False, f"Source block: unknown source node '{source_id}'"

            if (
                node.taint == TaintLabel.RAG_UNTRUSTED
                and action in {
                    ActionCapability.WRITE,
                    ActionCapability.NETWORK,
                }
            ):
                return (
                    False,
                    f"IFC block: untrusted RAG source '{source_id}' "
                    f"cannot authorize {action.value}",
                )

            if (
                node.taint == TaintLabel.INTERNAL_SECRET
                and action == ActionCapability.NETWORK
            ):
                return (
                    False,
                    f"Leak block: secret source '{source_id}' "
                    f"cannot flow to NETWORK",
                )

        return True, "Authorized"


@dataclass
class EvaluationResult:
    scenario: str
    total_steps: int
    blocked_steps: int
    allowed_steps: int
    attack_success: bool
    turn_log: List[Dict[str, Any]]
    trace_root: str


class MultiTurnAttackSimulator:

    def __init__(self) -> None:
        self.nodes: Dict[str, TraceNode] = {}
        self.turns: List[Dict[str, Any]] = []
        self.registry = ToolManifestRegistry()

    def _trace_root(self) -> str:
        leaves = [
            self.nodes[node_id].node_hash
            for node_id in sorted(self.nodes)
        ]
        return merkle_root(leaves)

    def execute_scenario(
        self,
        scenario_name: str,
        steps: Sequence[Dict[str, Any]],
    ) -> EvaluationResult:

        self.nodes.clear()
        self.turns.clear()

        blocked = 0

        for index, step in enumerate(steps, start=1):
            node_id = f"N_{index}"

            parent_ids = tuple(step.get("parent_ids", ()))

            node = TraceNode(
                node_id=node_id,
                taint=step["taint"],
                content=step["payload"],
                parent_ids=parent_ids,
            )

            self.nodes[node_id] = node

            allowed, reason = EvaluationEngine.evaluate(
                nodes=self.nodes,
                phase=step["phase"],
                action=step["action"],
                source_ids=step.get("source_ids", [node_id]),
                tool_valid=step.get("tool_valid", True),
            )

            if not allowed:
                blocked += 1

            self.turns.append(
                {
                    "turn": index,
                    "node_id": node_id,
                    "phase": step["phase"].value,
                    "action": step["action"].value,
                    "taint": step["taint"].value,
                    "allowed": allowed,
                    "reason": reason,
                }
            )

        total = len(steps)
        allowed_steps = total - blocked

        # Attack success means an unsafe action was actually authorized.
        attack_success = any(
            item["allowed"]
            and (
                item["taint"] == TaintLabel.RAG_UNTRUSTED.value
                and item["action"]
                in {
                    ActionCapability.WRITE.value,
                    ActionCapability.NETWORK.value,
                }
            )
            for item in self.turns
        )

        return EvaluationResult(
            scenario=scenario_name,
            total_steps=total,
            blocked_steps=blocked,
            allowed_steps=allowed_steps,
            attack_success=attack_success,
            turn_log=self.turns,
            trace_root=self._trace_root(),
        )
