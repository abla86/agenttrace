from __future__ import annotations

from dataclasses import dataclass

from .state import SimulationState


@dataclass(frozen=True)
class ReplayFrame:
    sequence: int
    state: SimulationState


class ReplayBuffer:
    """Bounded replay buffer for deterministic simulation output."""

    def __init__(self, max_frames: int = 200) -> None:
        if max_frames < 1:
            raise ValueError("max_frames must be positive")
        self.max_frames = max_frames
        self._frames: list[ReplayFrame] = []

    def append(self, state: SimulationState) -> None:
        self._frames.append(ReplayFrame(state.tick, state))
        if len(self._frames) > self.max_frames:
            del self._frames[: len(self._frames) - self.max_frames]

    def frames(self) -> tuple[ReplayFrame, ...]:
        return tuple(self._frames)

    def latest(self) -> ReplayFrame | None:
        return self._frames[-1] if self._frames else None
