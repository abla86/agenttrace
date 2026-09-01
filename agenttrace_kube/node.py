from agenttrace.api import ActionCapability, AgentPhase, AuditLog, PolicyEngine, ToolManifest, merkle_root
from .util import make_node


def kube_node_probe(node_name: str, status: str):
    content = f"Node {node_name} status {status}"
    node = make_node(f"kube-node-{node_name}", content)
    audit = AuditLog()
    audit.append("kube.node", {"name": node_name, "status": status, "node_hash": node.node_hash})
    nodes = {node.node_id: node}
    manifest = ToolManifest("kube-node", {"name": {"type": "string"}, "status": {"type": "string"}}, (ActionCapability.READ,), "0.1.0")
    engine = PolicyEngine()
    engine.registry.register(manifest)
    decision = engine.evaluate(nodes, AgentPhase.EXECUTION, ActionCapability.READ, (node.node_id,), manifest)
    return {"nodes": nodes, "audit": audit, "merkle": merkle_root([node.node_hash]), "decision": decision}
