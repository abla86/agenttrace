from agenttrace.api import AuditLog, TraceNode, merkle_root
from agenttrace_azure.monitor import azure_monitor_probe
from agenttrace_kube.pod import kube_pod_probe


def _audit_events(audit: AuditLog) -> list[dict]:
    return [{"sequence": e.sequence, "event_type": e.event_type, "payload": e.payload, "digest": e.digest()} for e in audit.events]


def enterprise_integration() -> dict:
    azure = azure_monitor_probe(42.0)
    kube = kube_pod_probe("api", "Running")
    nodes: dict[str, TraceNode] = {**azure["nodes"], **kube["nodes"]}
    return {
        "nodes": nodes,
        "merkle": merkle_root(node.node_hash for node in nodes.values()),
        "azure_decision": azure["decision"],
        "kube_decision": kube["decision"],
        "azure_audit": _audit_events(azure["audit"]),
        "kube_audit": _audit_events(kube["audit"]),
    }
