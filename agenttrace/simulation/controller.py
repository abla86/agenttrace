from __future__ import annotations

from dataclasses import dataclass

from .autonomy import AutonomyEngine, DefenseProposal
from .drift import DriftEngine, DriftState
from .engines import ArenaEngine
from .policy import SimulationPolicy
from .proposal_runtime import ProposalDecision, ProposalRuntime
from .state import SimulationState, build_simulation_state


@dataclass(frozen=True)
class ControllerStep:
    state: SimulationState
    drift: DriftState
    proposals: tuple[ProposalDecision, ...]


class SimulationController:
    """Coordinates simulation, measurement and bounded autonomy."""

    def __init__(self, seed: int = 1) -> None:
        self.arena = ArenaEngine(seed=seed)
        self.drift_engine = DriftEngine()
        self.autonomy = AutonomyEngine()
        self.proposals = ProposalRuntime(self.autonomy)
        self.policy = SimulationPolicy()
        self.drift = DriftState(0, 0, 0, 0, 0, 0, "STABLE")

    def tick(self) -> ControllerStep:
        self.arena.tick()
        self.drift = self.drift_engine.update(self.arena.worms.worms, self.arena.events)
        state = build_simulation_state(self.arena, self.drift)
        decisions = self.proposals.evaluate(state, self.policy.validate)
        return ControllerStep(state, self.drift, tuple(decisions))

    def promote(self, proposal: DefenseProposal) -> DefenseProposal:
        validated = self.autonomy.validate(proposal, self.policy.validate)
        return self.autonomy.promote(validated, lambda item: self._apply_promoted(item))

    def _apply_promoted(self, proposal: DefenseProposal) -> None:
        if proposal.action == "increase_simulation_defense_coverage":
            delta = proposal.parameters.get("coverage_delta", 0.0)
            if not self.policy.validate_coverage_delta(delta):
                raise PermissionError("Coverage delta exceeds simulation policy")
            # Promotion changes only simulation state. It does not mutate AgentTrace security policy.
            if self.arena.worms.worms:
                anchor = self.arena.worms.worms[0]
                self.arena.defense.add_firewall(anchor.x, anchor.y, strength=1.0 + delta)
        elif proposal.action == "review_simulation_defense_coverage":
            return
        else:
            raise PermissionError("Unsupported simulation proposal")
