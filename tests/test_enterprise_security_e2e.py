from agenttrace.api import (
    ActionCapability,
    AgentPhase,
    AuditLog,
    Decision,
    PolicyEngine,
    TaintLabel,
    ToolManifest,
    TraceNode,
    merkle_root,
    sha256,
)
from agenttrace.security.guards import ExecutionGuard
from agenttrace.security.platform import AuthContext, Role


def test_enterprise_security_chain() -> None:
    tool = ToolManifest(
        name="policy-server",
        schema={"operation": "read"},
        capabilities=(ActionCapability.READ,),
        version="2.0.0",
    )
    engine = PolicyEngine()
    engine.registry.register(tool)

    trusted = TraceNode(
        "trusted-1",
        TaintLabel.SYSTEM_TRUSTED,
        "read-only request",
    )
    untrusted = TraceNode(
        "untrusted-1",
        TaintLabel.TOOL_OUTPUT_UNTRUSTED,
        "tool supplied instruction",
    )
    nodes = {
        trusted.node_id: trusted,
        untrusted.node_id: untrusted,
    }

    allowed = engine.evaluate(
        nodes,
        AgentPhase.EXECUTION,
        ActionCapability.READ,
        [trusted.node_id],
        tool,
    )
    blocked = engine.evaluate(
        nodes,
        AgentPhase.EXECUTION,
        ActionCapability.WRITE,
        [untrusted.node_id],
        None,
    )

    assert allowed.decision is Decision.ALLOW
    assert blocked.decision is Decision.BLOCK
    assert blocked.reason == "UNTRUSTED_DATA_CANNOT_AUTHORIZE_ACTION"

    audit = AuditLog()
    audit.append("policy.decision", {
        "decision": allowed.decision.value,
        "reason": allowed.reason,
        "source_ids": list(allowed.source_ids),
    })
    audit.append("policy.decision", {
        "decision": blocked.decision.value,
        "reason": blocked.reason,
        "source_ids": list(blocked.source_ids),
    })

    leaves = [
        sha256(trusted.node_hash.encode("utf-8")),
        sha256(untrusted.node_hash.encode("utf-8")),
        audit.root(),
    ]
    root = merkle_root(leaves)

    assert len(root) == 64
    assert audit.verify_event_count(2)

    guard = ExecutionGuard()
    actor = AuthContext("enterprise-test", Role.ADMIN)
    guard.authorize(actor, "enterprise-request-1")
    assert guard.replay.size == 1


def test_enterprise_security_rejects_replay() -> None:
    guard = ExecutionGuard()
    actor = AuthContext("enterprise-test", Role.OPERATOR)

    guard.authorize(actor, "request-1")

    try:
        guard.authorize(actor, "request-1")
    except PermissionError as exc:
        assert str(exc) == "REPLAY_DETECTED"
    else:
        raise AssertionError("replayed request was accepted")
