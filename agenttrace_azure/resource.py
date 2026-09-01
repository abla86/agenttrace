from agenttrace.api import (
    ActionCapability,
    AgentPhase,
    AuditLog,
    PolicyEngine,
    ToolManifest,
    merkle_root,
)
from .util import make_node


def azure_resource_probe(name: str, rtype: str):
    content = f"{name} ({rtype})"
    node = make_node(f"azure-{name}", content)
    node_hash = node.node_hash

    audit = AuditLog()
    audit.append("azure.resource", {"name": name, "type": rtype, "hash": node_hash})

    nodes = {node.node_id: node}
    manifest = ToolManifest(
        name="azure-resource",
        schema={},
        capabilities=(ActionCapability.READ,),
        version="0.1.0",
    )

    engine = PolicyEngine()
    engine.registry.register(manifest)
    decision = engine.evaluate(
        nodes,
        AgentPhase.EXECUTION,
        ActionCapability.READ,
        [node.node_id],
        manifest,
    )

    return {
        "nodes": nodes,
        "audit": audit,
        "merkle": merkle_root([node_hash]),
        "decision": decision,
    }
