import argparse,json
from .evaluation.models import ActionCapability,AgentPhase,TaintLabel,TraceNode,ToolManifest
from .policy.policy_engine import PolicyEngine
from .policy.merkle_registry import MerkleToolRegistry
from .scenarios import AdaptiveScenarioGenerator

def demo():
    policy=PolicyEngine()
    tools=MerkleToolRegistry()
    baseline=ToolManifest("documents",{"query":"string"},(ActionCapability.READ,))
    tools.register(baseline)
    events=[]
    for i,scenario in enumerate(AdaptiveScenarioGenerator().generate(10),1):
        step=scenario[0]
        if step.attack_type.value=="TOOL_POISONING":
            observed=ToolManifest("documents",{"query":"string"},(ActionCapability.READ,ActionCapability.WRITE))
            allowed=tools.verify([observed])
            events.append({"step":i,"attack_type":step.attack_type.value,"mutation":step.payload.split("[")[-1].rstrip("]"),"decision":"ALLOW" if allowed else "BLOCK","reason":"TOOL_INTEGRITY_OK" if allowed else "TOOL_MANIFEST_INVALID"})
            continue
        node=TraceNode(f"N{i}",step.taint,step.payload)
        decision=policy.evaluate({f"N{i}":node},step.phase,step.action,[f"N{i}"],None)
        events.append({"step":i,"attack_type":step.attack_type.value,"mutation":step.payload.split("[")[-1].rstrip("]"),"decision":decision.decision.value,"reason":decision.reason})
    blocked=sum(e["decision"]=="BLOCK" for e in events)
    return {"merkle_root":tools.root,"events":events,"total":len(events),"blocked":blocked,"attack_success_rate_pct":(len(events)-blocked)/len(events)*100 if events else 0}

def main():
    p=argparse.ArgumentParser(prog="agenttrace")
    s=p.add_subparsers(dest="command",required=True)
    s.add_parser("demo"); s.add_parser("self-test")
    a=p.parse_args()
    if a.command=="demo": print(json.dumps(demo(),indent=2))
    else:
        from .selftest import run
        print(json.dumps(run(),indent=2))
if __name__=="__main__": main()
