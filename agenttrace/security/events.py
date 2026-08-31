from __future__ import annotations

from dataclasses import dataclass, asdict
from enum import Enum
from typing import Any


class SecurityEventType(str, Enum):
    ATTACK_CREATED = "ATTACK_CREATED"
    ATTACK_MUTATED = "ATTACK_MUTATED"
    ATTACK_PROPAGATED = "ATTACK_PROPAGATED"
    ATTACK_BLOCKED = "ATTACK_BLOCKED"
    ATTACK_ALLOWED = "ATTACK_ALLOWED"
    DEFENSE_TRIGGERED = "DEFENSE_TRIGGERED"
    TOOL_DRIFT = "TOOL_DRIFT"
    TAINT_FLOW = "TAINT_FLOW"
    POLICY_DECISION = "POLICY_DECISION"
    INTENT_DRIFT = "INTENT_DRIFT"
    BEHAVIOR_DRIFT = "BEHAVIOR_DRIFT"
    SYSTEM_DIAGNOSTIC = "SYSTEM_DIAGNOSTIC"
    DEFENSE_PROPOSAL = "DEFENSE_PROPOSAL"


@dataclass(frozen=True)
class SecurityEvent:
    event_id: str
    event_type: SecurityEventType
    timestamp: float
    source: str | None = None
    target: str | None = None
    severity: float = 0.0
    metadata: dict[str, Any] | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
