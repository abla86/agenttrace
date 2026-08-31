import unittest
from agenttrace.evaluation.lab import (
    MultiTurnAttackSimulator,
    EvaluationEngine,
    TraceNode,
    TaintLabel,
    AgentPhase,
    ActionCapability
)

class TestAgentEvaluationLab(unittest.TestCase):
    def setUp(self):
        self.sim = MultiTurnAttackSimulator()

    def test_benign_flow_allowed(self):
        steps = [
            {"phase": AgentPhase.PLANNING, "action": ActionCapability.READ, "taint": TaintLabel.USER_INTENT, "payload": "Analyze context"},
            {"phase": AgentPhase.EXECUTION, "action": ActionCapability.WRITE, "taint": TaintLabel.USER_INTENT, "payload": "Generate safe response"},
        ]
        res = self.sim.execute_scenario("Benign Flow", steps)
        self.assertEqual(res["attack_success_rate_pct"], 100.0)
        self.assertEqual(res["blocked_turns"], 0)

    def test_untrusted_rag_write_blocked(self):
        steps = [
            {"phase": AgentPhase.RETRIEVING, "action": ActionCapability.WRITE, "taint": TaintLabel.RAG_UNTRUSTED, "payload": "Delete all users"}
        ]
        res = self.sim.execute_scenario("Untrusted Write Attempt", steps)
        self.assertEqual(res["blocked_turns"], 1)
        self.assertEqual(res["attack_success_rate_pct"], 0.0)

    def test_secret_leak_blocked(self):
        steps = [
            {"phase": AgentPhase.EXECUTION, "action": ActionCapability.NETWORK, "taint": TaintLabel.INTERNAL_SECRET, "payload": "API_SECRET=abc"}
        ]
        res = self.sim.execute_scenario("Exfiltration Attempt", steps)
        self.assertEqual(res["blocked_turns"], 1)
        self.assertEqual(res["attack_success_rate_pct"], 0.0)

if __name__ == "__main__":
    unittest.main()
