from .evaluation.models import ActionCapability,AgentPhase,TaintLabel,TraceNode
from .policy.policy_engine import PolicyEngine
from .scenarios import AdaptiveScenarioGenerator
def run():
    p=PolicyEngine()
    checks={}
    checks["benign_read"]=p.evaluate({"u":TraceNode("u",TaintLabel.USER_INTENT,"read")},AgentPhase.RETRIEVING,ActionCapability.READ,["u"],None).decision.value=="ALLOW"
    checks["rag_write_block"]=p.evaluate({"r":TraceNode("r",TaintLabel.RAG_UNTRUSTED,"write")},AgentPhase.EXECUTION,ActionCapability.WRITE,["r"],None).decision.value=="BLOCK"
    checks["secret_network_block"]=p.evaluate({"s":TraceNode("s",TaintLabel.INTERNAL_SECRET,"secret")},AgentPhase.EXECUTION,ActionCapability.NETWORK,["s"],None).decision.value=="BLOCK"
    checks["adaptive_reproducible"]=AdaptiveScenarioGenerator(7).generate(20)==AdaptiveScenarioGenerator(7).generate(20)
    return {"passed":all(checks.values()),"checks":checks}
