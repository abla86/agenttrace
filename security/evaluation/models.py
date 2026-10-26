import hashlib
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


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
    parent_ids: tuple[str, ...] = ()

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
    schema: dict[str, Any]
    capabilities: tuple[ActionCapability, ...]
    version: str = "1"


@dataclass(frozen=True)
class PolicyDecision:
    decision: Decision
    reason: str
    phase: AgentPhase
    action: ActionCapability
    source_ids: tuple[str, ...]
    tool_name: str | None = None


@dataclass
class EvaluationResult:
    scenario: str
    decisions: list[PolicyDecision] = field(default_factory=list)

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
