import argparse,json
from .core import *
from .scenarios import AdaptiveScenarioGenerator
def demo():
 e=AgentSecurityEngine(); e.register_tool(ToolManifest("documents",{"query":"string"},frozenset({ActionCapability.READ}))); events=[]
 for i,s in enumerate(AdaptiveScenarioGenerator().generate(5),1):
  x=s[0]; d=e.authorize(phase=x.phase,action=x.action,sources=[TraceNode(f"N{i}",x.taint,x.payload)]); events.append({"step":i,"attack_type":x.attack_type.value,"mutation":x.payload.split("[")[-1].rstrip("]"),"allowed":d.allowed,"reason":d.reason,"risk":d.risk})
 return {"baseline_merkle_root":e.baseline_merkle_root,"events":events,"blocked":sum(not x["allowed"] for x in events),"total":len(events)}
def main():
 p=argparse.ArgumentParser(prog="agenttrace"); s=p.add_subparsers(dest="command",required=True); s.add_parser("self-test"); d=s.add_parser("demo"); d.add_argument("--json",action="store_true"); a=p.parse_args()
 if a.command=="self-test":
  from .selftest import run; print(json.dumps(run(),indent=2))
 else:
  r=demo(); print(json.dumps(r,indent=2) if a.json else f"Blocked {r['blocked']}/{r['total']} scenarios")
if __name__=="__main__":main()
