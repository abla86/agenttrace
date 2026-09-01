from agenttrace.api import ActionCapability, AgentPhase, AuditLog, PolicyEngine, ToolManifest, merkle_root
from .util import make_node


def kube_pod_probe(pod_name: str, phase: str):
    content = f"Pod {pod_name} phase {phase}"
    node = make_node(f"kube-{pod_name}", content)
    node_hash = node.node_hash
    audit = AuditLog()
    audit.append("kube.pod", {"name": pod_name, "phase": phase, "hash": node_hash})
    nodes = {node.node_id: node}
    manifest = ToolManifest(name="kube-pod", schema={}, capabilities=(ActionCapability.READ,), version="0.1.0")
    engine = PolicyEngine()
    engine.registry.register(manifest)
    decision = engine.evaluate(nodes, AgentPhase.EXECUTION, ActionCapability.READ, [node.node_id], manifest)
    return {"nodes": nodes, "audit": audit, "merkle": merkle_root([node_hash]), "decision": decision}
