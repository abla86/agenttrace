from agenttrace.api import Decision
from agenttrace_kube.node import kube_node_probe


def test_kube_node_probe_strict():
    result = kube_node_probe("worker-1", "Ready")
    node = result["nodes"]["kube-node-worker-1"]
    assert node.content == "Node worker-1 status Ready"
    assert result["audit"].events[0].payload["hash"] == node.node_hash
    assert result["decision"].decision is Decision.ALLOW
