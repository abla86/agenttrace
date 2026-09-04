import hashlib
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

    @property
    def node_hash(self) -> str:
        canonical = (
            f"{self.node_id}|{self.taint.value}|{self.content}|"
            f"{','.join(sorted(self.parent_ids))}"
        )
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


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
    attack: bool = False


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
    def attack_decisions(self) -> List[PolicyDecision]:
        return [d for d in self.decisions if d.attack]

    @property
    def attack_successes(self) -> int:
        return sum(d.attack and d.decision == Decision.ALLOW for d in self.decisions)

    @property
    def attack_attempts(self) -> int:
        return len(self.attack_decisions)

    @property
    def attack_success_rate(self) -> float:
        """Percentage of explicitly tagged attack attempts that were allowed."""
        if not self.attack_decisions:
            return 0.0
        return self.attack_successes / self.attack_attempts * 100.0

    @property
    def detection_rate(self) -> float:
        """Percentage of explicitly tagged attacks that were blocked."""
        if not self.attack_decisions:
            return 0.0
        blocked = sum(d.attack and d.decision == Decision.BLOCK for d in self.decisions)
        return blocked / self.attack_attempts * 100.0

    @property
    def benign_decisions(self) -> List[PolicyDecision]:
        return [d for d in self.decisions if not d.attack]

    @property
    def benign_false_positive_rate(self) -> float:
        """Percentage of explicitly benign decisions that were blocked."""
        if not self.benign_decisions:
            return 0.0
        blocked = sum(d.decision == Decision.BLOCK for d in self.benign_decisions)
        return blocked / len(self.benign_decisions) * 100.0
