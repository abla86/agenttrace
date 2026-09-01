from agenttrace.api import ActionCapability, AgentPhase, Decision, TaintLabel
from core_integration.policy_server import EvaluationRequest, PolicyService


def test_trace_tool_policy_audit_merkle_end_to_end():
    result = PolicyService().evaluate(
        EvaluationRequest(
            tool_name="azure-monitor",
            content="CPU=42.0",
            action=ActionCapability.READ,
            phase=AgentPhase.EXECUTION,
            taint=TaintLabel.TOOL_OUTPUT_UNTRUSTED,
        )
    )

    assert result.decision.decision is Decision.ALLOW
    assert result.decision.reason == "POLICY_ALLOWED"
    assert result.decision.source_ids == ("request-node",)
    assert result.decision.tool_name == "azure-monitor"
    assert len(result.node_hash) == 64
    assert len(result.tool_fingerprint) == 64
    assert len(result.audit_root) == 64


def test_untrusted_source_is_blocked_for_privileged_action():
    result = PolicyService().evaluate(
        EvaluationRequest(
            tool_name="network-tool",
            content="untrusted result",
            action=ActionCapability.NETWORK,
            phase=AgentPhase.EXECUTION,
            taint=TaintLabel.TOOL_OUTPUT_UNTRUSTED,
        )
    )

    assert result.decision.decision is Decision.BLOCK
    assert result.decision.reason == "UNTRUSTED_DATA_CANNOT_AUTHORIZE_ACTION"


def test_secret_cannot_flow_to_network():
    result = PolicyService().evaluate(
        EvaluationRequest(
            tool_name="network-tool",
            content="secret",
            action=ActionCapability.NETWORK,
            phase=AgentPhase.EXECUTION,
            taint=TaintLabel.INTERNAL_SECRET,
        )
    )

    assert result.decision.decision is Decision.BLOCK
    assert result.decision.reason == "SECRET_TO_NETWORK_FLOW_DENIED"
