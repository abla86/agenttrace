from __future__ import annotations

import unittest

from agenttrace.simulation.autonomy import AutonomyEngine
from agenttrace.simulation.drift import DriftState
from agenttrace.simulation.state import SimulationState


class TestAutonomyPipeline(unittest.TestCase):
    def _state(self, score: float) -> SimulationState:
        return SimulationState(
            tick=4,
            worms=(),
            defenses=(),
            drift=DriftState(
                pressure=score,
                injury_rate=0.0,
                active_worms=1,
                defense_triggers=0,
                propagation_events=0,
                score=score,
                status="HIGH" if score >= 70 else "ELEVATED",
            ),
            events=(),
        )

    def test_low_drift_creates_no_proposal(self) -> None:
        engine = AutonomyEngine()
        self.assertIsNone(engine.propose(self._state(20), engine.analyze(engine.observe(self._state(20)))))

    def test_high_drift_requires_validation_and_explicit_promotion(self) -> None:
        engine = AutonomyEngine()
        state = self._state(80)
        analysis = engine.analyze(engine.observe(state))
        proposal = engine.propose(state, analysis)
        self.assertIsNotNone(proposal)

        assert proposal is not None
        with self.assertRaises(PermissionError):
            engine.promote(proposal, lambda _: None)

        validated = engine.validate(proposal, lambda _: True)
        promoted: list[str] = []
        engine.promote(validated, lambda p: promoted.append(p.proposal_id))
        self.assertEqual(promoted, [validated.proposal_id])


if __name__ == "__main__":
    unittest.main()
