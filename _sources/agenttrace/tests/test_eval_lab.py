import unittest

from agenttrace.evaluation.lab import (
    ActionCapability,
    AgentPhase,
    MultiTurnAttackSimulator,
    TaintLabel,
    ToolManifestRegistry,
    merkle_root,
)


class TestAgentEvaluationLab(unittest.TestCase):

    def test_merkle_root_changes_when_leaf_changes(self):
        root_a = merkle_root(["a", "b", "c"])
        root_b = merkle_root(["a", "X", "c"])

        self.assertNotEqual(root_a, root_b)

    def test_benign_flow_allowed(self):
        sim = MultiTurnAttackSimulator()

        result = sim.execute_scenario(
            "Benign Flow",
            [
                {
                    "phase": AgentPhase.PLANNING,
                    "action": ActionCapability.READ,
                    "taint": TaintLabel.USER_INTENT,
                    "payload": "Analyze context",
                },
                {
                    "phase": AgentPhase.EXECUTION,
                    "action": ActionCapability.WRITE,
                    "taint": TaintLabel.USER_INTENT,
                    "payload": "Create report",
                },
            ],
        )

        self.assertEqual(result.blocked_steps, 0)
        self.assertFalse(result.attack_success)

    def test_untrusted_rag_write_blocked(self):
        sim = MultiTurnAttackSimulator()

        result = sim.execute_scenario(
            "Untrusted RAG Write",
            [
                {
                    "phase": AgentPhase.EXECUTION,
                    "action": ActionCapability.WRITE,
                    "taint": TaintLabel.RAG_UNTRUSTED,
                    "payload": "Delete all users",
                }
            ],
        )

        self.assertEqual(result.blocked_steps, 1)
        self.assertFalse(result.attack_success)

    def test_secret_network_flow_blocked(self):
        sim = MultiTurnAttackSimulator()

        result = sim.execute_scenario(
            "Secret Exfiltration",
            [
                {
                    "phase": AgentPhase.EXECUTION,
                    "action": ActionCapability.NETWORK,
                    "taint": TaintLabel.INTERNAL_SECRET,
                    "payload": "API_SECRET=classified",
                }
            ],
        )

        self.assertEqual(result.blocked_steps, 1)
        self.assertFalse(result.attack_success)

    def test_phase_escalation_blocked(self):
        sim = MultiTurnAttackSimulator()

        result = sim.execute_scenario(
            "Premature Write",
            [
                {
                    "phase": AgentPhase.PLANNING,
                    "action": ActionCapability.WRITE,
                    "taint": TaintLabel.USER_INTENT,
                    "payload": "Write before execution",
                }
            ],
        )

        self.assertEqual(result.blocked_steps, 1)

    def test_tool_manifest_drift_detected(self):
        registry = ToolManifestRegistry()

        registry.register_tool(
            "fetch_docs",
            {"query": "string"},
            [ActionCapability.READ],
        )

        self.assertTrue(
            registry.verify_tool_integrity(
                "fetch_docs",
                {"query": "string"},
                [ActionCapability.READ],
            )
        )

        self.assertFalse(
            registry.verify_tool_integrity(
                "fetch_docs",
                {"query": "string"},
                [
                    ActionCapability.READ,
                    ActionCapability.WRITE,
                ],
            )
        )

    def test_unknown_tool_is_invalid(self):
        registry = ToolManifestRegistry()

        self.assertFalse(
            registry.verify_tool_integrity(
                "unknown",
                {},
                [ActionCapability.READ],
            )
        )

    def test_trace_root_is_tamper_evident(self):
        sim = MultiTurnAttackSimulator()

        result = sim.execute_scenario(
            "Trace",
            [
                {
                    "phase": AgentPhase.EXECUTION,
                    "action": ActionCapability.READ,
                    "taint": TaintLabel.USER_INTENT,
                    "payload": "Original",
                }
            ],
        )

        original_root = result.trace_root

        sim.nodes["N_1"] = type(sim.nodes["N_1"])(
            node_id="N_1",
            taint=TaintLabel.USER_INTENT,
            content="Tampered",
        )

        self.assertNotEqual(original_root, sim._trace_root())


if __name__ == "__main__":
    unittest.main()
