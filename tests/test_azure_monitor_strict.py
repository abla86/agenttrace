from agenttrace.api import ActionCapability, AgentPhase, Decision, PolicyDecision, TaintLabel, TraceNode
from agenttrace_azure.monitor import azure_monitor_probe


def test_azure_monitor_probe_strict():
    result = azure_monitor_probe(42.0)
    nodes = result["nodes"]
    assert isinstance(nodes, dict) and len(nodes) == 1
    node_id, node = next(iter(nodes.items()))
    assert node_id == "azure-cpu"
    assert isinstance(node, TraceNode)
    assert node.node_id == "azure-cpu"
    assert node.taint is TaintLabel.TOOL_OUTPUT_UNTRUSTED
    assert node.content == "CPU=42.0"
    assert node.parent_ids == ()
    assert result["merkle"]
    assert isinstance(result["decision"], PolicyDecision)
    assert result["decision"].decision is Decision.ALLOW
    assert result["decision"].action is ActionCapability.READ
    assert result["decision"].phase is AgentPhase.EXECUTION
    event = result["audit"].events[0]
    assert event.event_type == "azure.monitor.cpu"
    assert event.payload["hash"] == node.node_hash
