import hashlib
import json
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Tuple

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

@dataclass(frozen=True)
class TraceNode:
    node_id: str
    taint: TaintLabel
    content: str
    parent_ids: Tuple[str, ...] = ()
    node_hash: str = field(init=False)

    def __post_init__(self):
        h = hashlib.sha256(f"{self.node_id}:{self.taint.value}:{self.content}".encode("utf-8")).hexdigest()[:12]
        object.__setattr__(self, "node_hash", h)

class EvaluationEngine:
    @staticmethod
    def evaluate(nodes: Dict[str, TraceNode], phase: AgentPhase, action: ActionCapability, source_ids: List[str]) -> Tuple[bool, str]:
        if phase != AgentPhase.EXECUTION and action in (ActionCapability.WRITE, ActionCapability.NETWORK):
            return False, f"FSM Block: Action '{action.value}' not permitted in phase '{phase.value}'"

        for sid in source_ids:
            node = nodes.get(sid)
            if node and node.taint == TaintLabel.RAG_UNTRUSTED and action in (ActionCapability.WRITE, ActionCapability.NETWORK):
                return False, f"IFC Block: Untrusted taint from '{sid}' cannot authorize '{action.value}'"
            if node and node.taint == TaintLabel.INTERNAL_SECRET and action == ActionCapability.NETWORK:
                return False, f"Leak Block: Secret node '{sid}' cannot flow to network"

        return True, "Authorized"

class MultiTurnAttackSimulator:
    def __init__(self):
        self.nodes: Dict[str, TraceNode] = {}
        self.turns: List[Dict[str, Any]] = []

    def execute_scenario(self, scenario_name: str, steps: List[Dict[str, Any]]) -> Dict[str, Any]:
        blocked_turns = 0
        total_turns = len(steps)

        for idx, step in enumerate(steps, start=1):
            nid = f"N_{idx}"
            node = TraceNode(node_id=nid, taint=step["taint"], content=step["payload"])
            self.nodes[nid] = node

            is_valid, reason = EvaluationEngine.evaluate(
                nodes=self.nodes,
                phase=step["phase"],
                action=step["action"],
                source_ids=[nid],
            )

            if not is_valid:
                blocked_turns += 1

            self.turns.append({
                "turn": idx,
                "action": step["action"].value,
                "phase": step["phase"].value,
                "allowed": is_valid,
                "reason": reason,
            })

        asr = ((total_turns - blocked_turns) / total_turns) * 100.0 if total_turns > 0 else 0.0
        return {
            "scenario": scenario_name,
            "total_turns": total_turns,
            "blocked_turns": blocked_turns,
            "attack_success_rate_pct": asr,
            "drift_detected": blocked_turns > 0,
            "turn_log": self.turns,
        }
