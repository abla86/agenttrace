import unittest

from agenttrace.evaluation.integrity import (
    drift_score,
    evaluate_integrity,
    request_hash,
)


class TestIntegrityMetrics(unittest.TestCase):
    def test_request_hash_is_deterministic(self):
        request = {"tool": "search", "action": "READ", "args": {"q": "abc"}}
        self.assertEqual(request_hash(request), request_hash(dict(request)))

    def test_evaluation_state_mutation_is_flagged(self):
        report = evaluate_integrity(
            [
                {"actor": "agent", "action": "modify_score", "target": "score"},
            ]
        )
        self.assertLess(report.score, 1.0)
        self.assertTrue(report.findings)
        self.assertEqual(report.findings[0].rule_id, "EVAL-STATE-MUTATION")

    def test_clean_evaluation_is_clean(self):
        report = evaluate_integrity(
            [{"actor": "grader", "action": "record_result", "target": "result"}]
        )
        self.assertEqual(report.score, 1.0)
        self.assertEqual(report.findings, ())

    def test_drift_score_is_reproducible(self):
        baseline = {"action": "READ", "phase": "EXECUTION", "tool": "search"}
        observed = {"action": "NETWORK", "phase": "EXECUTION", "tool": "search"}
        self.assertEqual(
            drift_score(baseline, observed, fields=("action", "phase", "tool")),
            1 / 3,
        )


if __name__ == "__main__":
    unittest.main()
