import unittest
from agenttrace.evaluation.models import ActionCapability,AgentPhase,TaintLabel,TraceNode
from agenttrace.policy.policy_engine import PolicyEngine
from agenttrace.scenarios import AdaptiveScenarioGenerator

class AdaptiveLabTests(unittest.TestCase):
    def setUp(self): self.policy=PolicyEngine()
    def test_rag_privilege_block(self):
        n=TraceNode("r",TaintLabel.RAG_UNTRUSTED,"attempt")
        d=self.policy.evaluate({"r":n},AgentPhase.EXECUTION,ActionCapability.WRITE,["r"],None)
        self.assertEqual(d.decision.value,"BLOCK")
    def test_secret_network_block(self):
        n=TraceNode("s",TaintLabel.INTERNAL_SECRET,"secret")
        d=self.policy.evaluate({"s":n},AgentPhase.EXECUTION,ActionCapability.NETWORK,["s"],None)
        self.assertEqual(d.decision.value,"BLOCK")
    def test_adaptive_generation_reproducible(self):
        self.assertEqual(AdaptiveScenarioGenerator(19).generate(30),AdaptiveScenarioGenerator(19).generate(30))
