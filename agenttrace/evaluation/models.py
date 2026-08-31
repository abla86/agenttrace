from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple


class TaintLabel(str, Enum):
    SYSTEM_TRUSTED = "SYSTEM_TRUSTED"
    USER_INTENT = "USER_INTENT"
    RAG_UNTRUSTED = "RAG_UNTRUSTED"
    TOOL_OUTPUT_UNTRUSTED = "TOOL_OUTPUT_UNTRUSTED"
    INTERNAL_SECRET = "INTERNAL_SECRET"


class AgentPhase(str, Enum):
    PLANNING = "PLANNING"
    RETRIEVING = "RETRIEVING"
    EXECUTION = "EXECUTION"


class ActionCapability(str, Enum):
    READ = "READ"
    WRITE = "WRITE"
    NETWORK = "NETWORK"


class Decision(str, Enum):
    ALLOW = "ALLOW"
    BLOCK = "BLOCK"


@dataclass(frozen=True)
class TraceNode:
    node_id: str
    taint: TaintLabel
    content: str
    parent_ids: Tuple[str, ...] = ()


@dataclass(frozen=True)
class ToolManifest:
    name: str
    schema: Dict[str, Any]
    capabilities: Tuple[ActionCapability, ...]
    version: str = "1"


@dataclass(frozen=True)
class PolicyDecision:
    decision: Decision
    reason: str
    phase: AgentPhase
    action: ActionCapability
    source_ids: Tuple[str, ...]
    tool_name: Optional[str] = None


@dataclass
class EvaluationResult:
    scenario: str
    decisions: List[PolicyDecision] = field(default_factory=list)

    @property
    def blocked(self) -> int:
        return sum(d.decision == Decision.BLOCK for d in self.decisions)

    @property
    def allowed(self) -> int:
        return sum(d.decision == Decision.ALLOW for d in self.decisions)

    @property
    def attack_success_rate(self) -> float:
        if not self.decisions:
            return 0.0
        return self.allowed / len(self.decisions) * 100.0
