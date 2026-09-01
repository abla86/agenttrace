from agenttrace.api import ActionCapability, AgentPhase, AuditLog, PolicyEngine, ToolManifest, merkle_root
from .util import make_node


def kube_node_probe(node_name: str, status: str):
    content = f"Node {node_name} status {status}"
    node = make_node(f"kube-node-{node_name}", content)
    node_hash = node.node_hash
    audit = AuditLog()
    audit.append("kube.node", {"name": node_name, "status": status, "hash": node_hash})
    nodes = {node.node_id: node}
    manifest = ToolManifest(name="kube-node", schema={}, capabilities=(ActionCapability.READ,), version="0.1.0")
    engine = PolicyEngine()
    engine.registry.register(manifest)
    decision = engine.evaluate(nodes, AgentPhase.EXECUTION, ActionCapability.READ, [node.node_id], manifest)
    return {"nodes": nodes, "audit": audit, "merkle": merkle_root([node_hash]), "decision": decision}
