from agenttrace.api import ActionCapability, AgentPhase, AuditLog, PolicyEngine, ToolManifest, merkle_root
from .util import make_node


def azure_resource_probe(name: str, resource_type: str):
    content = f"{name} ({resource_type})"
    node = make_node(f"azure-resource-{name}", content)
    audit = AuditLog()
    audit.append("azure.resource", {"name": name, "type": resource_type, "node_hash": node.node_hash})
    nodes = {node.node_id: node}
    manifest = ToolManifest("azure-resource", {"name": {"type": "string"}, "type": {"type": "string"}}, (ActionCapability.READ,), "0.1.0")
    engine = PolicyEngine()
    engine.registry.register(manifest)
    decision = engine.evaluate(nodes, AgentPhase.EXECUTION, ActionCapability.READ, (node.node_id,), manifest)
    return {"nodes": nodes, "audit": audit, "merkle": merkle_root([node.node_hash]), "decision": decision}
