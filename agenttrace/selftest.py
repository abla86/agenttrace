from .evaluation.models import (
    ActionCapability,
    AgentPhase,
    TaintLabel,
    ToolManifest,
    TraceNode,
)
from .policy.merkle_registry import MerkleToolRegistry
from .policy.policy_engine import PolicyEngine
from .scenarios import AdaptiveScenarioGenerator


def run():
    policy = PolicyEngine()
    checks = {}
    checks["benign_read"] = (
        policy.evaluate(
            {"u": TraceNode("u", TaintLabel.USER_INTENT, "read")},
            AgentPhase.RETRIEVING,
            ActionCapability.READ,
            ["u"],
            None,
        ).decision.value
        == "ALLOW"
    )
    checks["rag_write_block"] = (
        policy.evaluate(
            {"r": TraceNode("r", TaintLabel.RAG_UNTRUSTED, "write")},
            AgentPhase.EXECUTION,
            ActionCapability.WRITE,
            ["r"],
            None,
        ).decision.value
        == "BLOCK"
    )
    checks["secret_network_block"] = (
        policy.evaluate(
            {"s": TraceNode("s", TaintLabel.INTERNAL_SECRET, "secret")},
            AgentPhase.EXECUTION,
            ActionCapability.NETWORK,
            ["s"],
            None,
        ).decision.value
        == "BLOCK"
    )
    checks["adaptive_reproducible"] = (
        AdaptiveScenarioGenerator(7).generate(20)
        == AdaptiveScenarioGenerator(7).generate(20)
    )
    registry = MerkleToolRegistry()
    original = ToolManifest(
        "docs",
        {"query": "string"},
        (ActionCapability.READ,),
    )
    changed = ToolManifest(
        "docs",
        {"query": "string"},
        (ActionCapability.READ, ActionCapability.WRITE),
    )
    registry.register(original)
    checks["tool_poisoning_merkle_block"] = not registry.verify([changed])
    return {"passed": all(checks.values()), "checks": checks}
