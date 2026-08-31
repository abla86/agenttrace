import argparse,json
from .evaluation.models import ActionCapability,AgentPhase,TaintLabel,TraceNode
from .policy.policy_engine import PolicyEngine
from .scenarios import AdaptiveScenarioGenerator

def demo():
    policy=PolicyEngine(); events=[]
    for i,scenario in enumerate(AdaptiveScenarioGenerator().generate(10),1):
        step=scenario[0]
        node=TraceNode(f"N{i}",step.taint,step.payload)
        decision=policy.evaluate({"N"+str(i):node},step.phase,step.action,["N"+str(i)],None)
        events.append({"step":i,"attack_type":step.attack_type.value,"mutation":step.payload.split("[")[-1].rstrip("]"),"decision":decision.decision.value,"reason":decision.reason})
    blocked=sum(e["decision"]=="BLOCK" for e in events)
    return {"events":events,"total":len(events),"blocked":blocked,"attack_success_rate_pct":(len(events)-blocked)/len(events)*100 if events else 0}

def main():
    p=argparse.ArgumentParser(prog="agenttrace"); s=p.add_subparsers(dest="command",required=True)
    s.add_parser("demo"); s.add_parser("self-test")
    a=p.parse_args()
    if a.command=="demo": print(json.dumps(demo(),indent=2))
    else:
        from .selftest import run
        print(json.dumps(run(),indent=2))
if __name__=="__main__": main()
