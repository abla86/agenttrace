from __future__ import annotations
import hashlib,json
from dataclasses import dataclass,field
from enum import Enum
from typing import Iterable
class TaintLabel(str,Enum):
 SYSTEM_TRUSTED="SYSTEM_TRUSTED"; USER_INTENT="USER_INTENT"; RAG_UNTRUSTED="RAG_UNTRUSTED"; INTERNAL_SECRET="INTERNAL_SECRET"
class AgentPhase(str,Enum):
 PLANNING="PLANNING"; RETRIEVING="RETRIEVING"; EXECUTION="EXECUTION"
class ActionCapability(str,Enum):
 READ="READ"; WRITE="WRITE"; NETWORK="NETWORK"
@dataclass(frozen=True)
class TraceNode:
 node_id:str; taint:TaintLabel; content:str; parent_ids:tuple[str,...]=(); node_hash:str=field(init=False)
 def __post_init__(self):
  p={"node_id":self.node_id,"taint":self.taint.value,"content":self.content,"parents":self.parent_ids}
  object.__setattr__(self,"node_hash",hashlib.sha256(json.dumps(p,sort_keys=True,separators=(",",":")).encode()).hexdigest())
@dataclass(frozen=True)
class ToolManifest:
 name:str; schema:dict; capabilities:frozenset[ActionCapability]
 def canonical(self): return json.dumps({"name":self.name,"schema":self.schema,"capabilities":sorted(c.value for c in self.capabilities)},sort_keys=True,separators=(",",":")).encode()
 @property
 def leaf_hash(self): return hashlib.sha256(self.canonical()).hexdigest()
def merkle_root(manifests:Iterable[ToolManifest])->str:
 leaves=sorted((m.name,m.leaf_hash) for m in manifests)
 if not leaves:return hashlib.sha256(b"").hexdigest()
 level=[hashlib.sha256(f"{n}:{h}".encode()).hexdigest() for n,h in leaves]
 while len(level)>1:
  if len(level)%2: level.append(level[-1])
  level=[hashlib.sha256((level[i]+level[i+1]).encode()).hexdigest() for i in range(0,len(level),2)]
 return level[0]
@dataclass(frozen=True)
class Decision: allowed:bool; reason:str; risk:float
class AgentSecurityEngine:
 def __init__(self): self.tools={}; self.baseline_merkle_root=merkle_root(())
 def register_tool(self,manifest): self.tools[manifest.name]=manifest; self.baseline_merkle_root=merkle_root(self.tools.values())
 def verify_tools(self,observed): return merkle_root(observed)==self.baseline_merkle_root
 def authorize(self,*,phase,action,sources,tool_integrity_valid=True):
  if not tool_integrity_valid:return Decision(False,"TOOL_INTEGRITY_DRIFT",1.0)
  if phase!=AgentPhase.EXECUTION and action in {ActionCapability.WRITE,ActionCapability.NETWORK}: return Decision(False,"PHASE_CAPABILITY_DENIED",.9)
  for s in sources:
   if s.taint==TaintLabel.INTERNAL_SECRET and action==ActionCapability.NETWORK:return Decision(False,f"SECRET_NETWORK_FLOW:{s.node_id}",1.0)
   if s.taint==TaintLabel.RAG_UNTRUSTED and action in {ActionCapability.WRITE,ActionCapability.NETWORK}:return Decision(False,f"UNTRUSTED_AUTHORITY:{s.node_id}",.95)
  return Decision(True,"AUTHORIZED",0.0)
