import unittest
from agenttrace.core import *
from agenttrace.scenarios import AdaptiveScenarioGenerator
class AgentTraceTests(unittest.TestCase):
 def setUp(self): self.e=AgentSecurityEngine(); self.e.register_tool(ToolManifest("docs",{"query":"string"},frozenset({ActionCapability.READ})))
 def test_taint_blocks(self): self.assertFalse(self.e.authorize(phase=AgentPhase.EXECUTION,action=ActionCapability.WRITE,sources=[TraceNode("r",TaintLabel.RAG_UNTRUSTED,"x")]).allowed)
 def test_secret_network(self): self.assertFalse(self.e.authorize(phase=AgentPhase.EXECUTION,action=ActionCapability.NETWORK,sources=[TraceNode("s",TaintLabel.INTERNAL_SECRET,"x")]).allowed)
 def test_phase(self): self.assertFalse(self.e.authorize(phase=AgentPhase.PLANNING,action=ActionCapability.WRITE,sources=[TraceNode("u",TaintLabel.USER_INTENT,"x")]).allowed)
 def test_merkle(self):
  a=[ToolManifest("docs",{"query":"string"},frozenset({ActionCapability.READ}))]; b=[ToolManifest("docs",{"query":"string"},frozenset({ActionCapability.READ,ActionCapability.WRITE}))]; self.assertNotEqual(merkle_root(a),merkle_root(b))
 def test_reproducible(self): self.assertEqual(AdaptiveScenarioGenerator(11).generate(20),AdaptiveScenarioGenerator(11).generate(20))
