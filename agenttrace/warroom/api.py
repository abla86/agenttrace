from __future__ import annotations

from dataclasses import asdict
from threading import Lock
from typing import Any

from agenttrace.simulation.autonomy import DefenseProposal
from agenttrace.simulation.controller import SimulationController
from agenttrace.warroom.view_model import build_warroom_view


class WarRoomRuntime:
    """Single process-local runtime shared by API handlers and the War-Room UI."""

    def __init__(self, seed: int = 1) -> None:
        self._lock = Lock()
        self.controller = SimulationController(seed=seed)
        self._last_step = self.controller.tick()

    def state(self) -> dict[str, Any]:
        with self._lock:
            return asdict(build_warroom_view(self._last_step))

    def tick(self) -> dict[str, Any]:
        with self._lock:
            self._last_step = self.controller.tick()
            return asdict(build_warroom_view(self._last_step))

    def reset(self, seed: int = 1) -> dict[str, Any]:
        with self._lock:
            self.controller = SimulationController(seed=seed)
            self._last_step = self.controller.tick()
            return asdict(build_warroom_view(self._last_step))

    def proposals(self) -> tuple[dict[str, Any], ...]:
        with self._lock:
            return tuple(
                asdict(decision.proposal)
                for decision in self._last_step.proposals
            )

    def events(self) -> tuple[dict[str, Any], ...]:
        with self._lock:
            return self._last_step.state.events

    def promote(self, proposal_id: str) -> dict[str, Any]:
        with self._lock:
            proposal = next(
                (
                    decision.proposal.proposal
                    for decision in self._last_step.proposals
                    if decision.proposal.proposal.proposal_id == proposal_id
                ),
                None,
            )
            if proposal is None:
                raise KeyError(proposal_id)
            promoted = self.controller.promote(proposal)
            self._last_step = self.controller.tick()
            return {
                "promoted": True,
                "proposal_id": promoted.proposal_id,
                "state": asdict(build_warroom_view(self._last_step)),
            }


_RUNTIME = WarRoomRuntime()


def get_runtime() -> WarRoomRuntime:
    return _RUNTIME
