"""Stable public integration surface for AgentTrace.

The public API exposes core models and services without requiring
application-specific dashboards or infrastructure integrations.
"""

from .audit.audit_log import AuditEvent, AuditLog, merkle_root, sha256
from .evaluation.lab import EvaluationLab, MultiTurnAttackSimulator
from .evaluation.models import (
    ActionCapability,
    AgentPhase,
    Decision,
    EvaluationResult,
    PolicyDecision,
    TaintLabel,
    ToolManifest,
    TraceNode,
)
from .policy.policy_engine import PolicyEngine

__all__ = [
    "ActionCapability",
    "AgentPhase",
    "AuditEvent",
    "AuditLog",
    "Decision",
    "EvaluationLab",
    "EvaluationResult",
    "merkle_root",
    "MultiTurnAttackSimulator",
    "PolicyDecision",
    "PolicyEngine",
    "sha256",
    "TaintLabel",
    "ToolManifest",
    "TraceNode",
]
