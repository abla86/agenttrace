import unittest

from agenttrace.evaluation.models import (
    ActionCapability,
    AgentPhase,
    TaintLabel,
    TraceNode,
)
from agenttrace.policy.policy_engine import PolicyEngine
from agenttrace.scenarios import AdaptiveScenarioGenerator


class AdaptiveLabTests(unittest.TestCase):
    def setUp(self):
        self.policy = PolicyEngine()

    def test_rag_privilege_block(self):
        node = TraceNode("r", TaintLabel.RAG_UNTRUSTED, "attempt")
        decision = self.policy.evaluate(
            {"r": node},
            AgentPhase.EXECUTION,
            ActionCapability.WRITE,
            ["r"],
            None,
        )
        self.assertEqual(decision.decision.value, "BLOCK")

    def test_secret_network_block(self):
        node = TraceNode("s", TaintLabel.INTERNAL_SECRET, "secret")
        decision = self.policy.evaluate(
            {"s": node},
            AgentPhase.EXECUTION,
            ActionCapability.NETWORK,
            ["s"],
            None,
        )
        self.assertEqual(decision.decision.value, "BLOCK")

    def test_adaptive_generation_reproducible(self):
        self.assertEqual(
            AdaptiveScenarioGenerator(19).generate(30),
            AdaptiveScenarioGenerator(19).generate(30),
        )
