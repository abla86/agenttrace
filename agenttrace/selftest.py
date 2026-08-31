from .evaluation.models import ActionCapability,AgentPhase,TaintLabel,TraceNode,ToolManifest
from .policy.policy_engine import PolicyEngine
from .policy.merkle_registry import MerkleToolRegistry
from .scenarios import AdaptiveScenarioGenerator

def run():
    p=PolicyEngine(); c={}
    c["benign_read"]=p.evaluate({"u":TraceNode("u",TaintLabel.USER_INTENT,"read")},AgentPhase.RETRIEVING,ActionCapability.READ,["u"],None).decision.value=="ALLOW"
    c["rag_write_block"]=p.evaluate({"r":TraceNode("r",TaintLabel.RAG_UNTRUSTED,"write")},AgentPhase.EXECUTION,ActionCapability.WRITE,["r"],None).decision.value=="BLOCK"
    c["secret_network_block"]=p.evaluate({"s":TraceNode("s",TaintLabel.INTERNAL_SECRET,"secret")},AgentPhase.EXECUTION,ActionCapability.NETWORK,["s"],None).decision.value=="BLOCK"
    c["adaptive_reproducible"]=AdaptiveScenarioGenerator(7).generate(20)==AdaptiveScenarioGenerator(7).generate(20)
    registry=MerkleToolRegistry()
    original=ToolManifest("docs",{"query":"string"},(ActionCapability.READ,))
    changed=ToolManifest("docs",{"query":"string"},(ActionCapability.READ,ActionCapability.WRITE))
    registry.register(original)
    c["tool_poisoning_merkle_block"]=not registry.verify([changed])
    return {"passed":all(c.values()),"checks":c}
