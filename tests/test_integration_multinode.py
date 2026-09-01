from agenttrace.api import merkle_root
from agenttrace_azure.monitor import azure_monitor_probe
from agenttrace_kube.pod import kube_pod_probe


def test_multinode_integration():
    azure = azure_monitor_probe(42.0)
    kube = kube_pod_probe("api", "Running")
    all_nodes = {**azure["nodes"], **kube["nodes"]}
    assert set(all_nodes) == {"azure-cpu", "kube-api"}
    root = merkle_root(node.node_hash for node in all_nodes.values())
    assert root == merkle_root([all_nodes["azure-cpu"].node_hash, all_nodes["kube-api"].node_hash])
    assert root
