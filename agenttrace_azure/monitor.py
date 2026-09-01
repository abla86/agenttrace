from agenttrace.api import ActionCapability, AgentPhase, AuditLog, PolicyEngine, ToolManifest, merkle_root
from .util import make_node


def azure_monitor_probe(cpu_value: float):
    content = f"CPU={cpu_value}"
    node = make_node("azure-cpu", content)
    audit = AuditLog()
    audit.append("azure.monitor.cpu", {"value": cpu_value, "node_hash": node.node_hash})
    nodes = {node.node_id: node}
    manifest = ToolManifest("azure-monitor", {"cpu": {"type": "number"}}, (ActionCapability.READ,), "0.1.0")
    engine = PolicyEngine()
    engine.registry.register(manifest)
    decision = engine.evaluate(nodes, AgentPhase.EXECUTION, ActionCapability.READ, (node.node_id,), manifest)
    return {"nodes": nodes, "audit": audit, "merkle": merkle_root([node.node_hash]), "decision": decision}
