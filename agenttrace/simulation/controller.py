from __future__ import annotations

from dataclasses import dataclass

from .autonomy import AutonomyEngine, DefenseProposal
from .drift import DriftEngine, DriftState
from .engines import ArenaEngine
from .policy import SimulationPolicy
from .proposal_runtime import ProposalDecision, ProposalRuntime
from .state import SimulationState, build_simulation_state
from .swarm import SwarmEngine
from .swarm_entities import SwarmWorldEngine


@dataclass(frozen=True)
class ControllerStep:
    state: SimulationState
    drift: DriftState
    proposals: tuple[ProposalDecision, ...]


class SimulationController:
    """Coordinates simulation, swarm ecology, measurement and bounded autonomy."""

    def __init__(self, seed: int = 1) -> None:
        self.arena = ArenaEngine(seed=seed)
        self.drift_engine = DriftEngine()
        self.autonomy = AutonomyEngine()
        self.proposals = ProposalRuntime(self.autonomy)
        self.policy = SimulationPolicy()
        self.swarm = SwarmEngine(seed=seed)
        self.world = SwarmWorldEngine(seed=seed)
        self.drift = DriftState(0, 0, 0, 0, 0, 0, "STABLE")

    def _snapshot(self) -> ControllerStep:
        state = build_simulation_state(self.arena, self.drift)
        decisions = self.proposals.evaluate(state, self.policy.validate)
        return ControllerStep(state, self.drift, tuple(decisions))

    def tick(self) -> ControllerStep:
        self.arena.set_drift_score(self.drift.score)
        self.arena.tick()

        self.drift = self.drift_engine.update(
            self.arena.worms.worms,
            self.arena.events,
            defense_count=len(self.arena.defense.walls),
            autonomy_level=self.drift.autonomy_level,
        )

        self.swarm.tick(
            self.arena.worms.worms,
            self.drift.score,
            self.drift.defense_load,
            self.drift.infection_rate,
        )

        self.world.tick(
            self.arena.worms.worms,
            self.drift.score,
            self.drift.defense_load,
            self.drift.infection_rate,
            self.drift.autonomy_level,
        )

        return self._snapshot()

    def snapshot(self) -> ControllerStep:
        return self._snapshot()

    def promote(self, proposal: DefenseProposal) -> DefenseProposal:
        validated = self.autonomy.validate(proposal, self.policy.validate)
        return self.autonomy.promote(validated, self._apply_promoted)

    def _apply_promoted(self, proposal: DefenseProposal) -> None:
        if proposal.action == "increase_simulation_defense_coverage":
            delta = proposal.parameters.get("coverage_delta", 0.0)
            if not self.policy.validate_coverage_delta(delta):
                raise PermissionError("Coverage delta exceeds simulation policy")
            if self.arena.worms.worms:
                anchor = self.arena.worms.worms[0]
                self.arena.defense.add_firewall(anchor.x, anchor.y, strength=1.0 + delta)
        elif proposal.action == "review_simulation_defense_coverage":
            return
        else:
            raise PermissionError("Unsupported simulation proposal")
