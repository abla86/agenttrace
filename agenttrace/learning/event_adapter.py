from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from agenttrace.learning.tutorial import Explanation, TutorialEngine


@dataclass(frozen=True)
class ContextualExplanation:
    event_type: str
    explanation: Explanation
    metadata: dict[str, Any]


class TutorialEventAdapter:
    """Bridges canonical security events to the learning layer.

    The adapter is read-only: it explains an event and never changes
    policy, authorization, runtime state, or audit state.
    """

    def __init__(self, engine: TutorialEngine | None = None) -> None:
        self.engine = engine or TutorialEngine()

    def explain(
        self,
        event_type: str,
        metadata: dict[str, Any] | None = None,
    ) -> ContextualExplanation | None:
        explanation = self.engine.explain_event(event_type)
        if explanation is None:
            return None
        return ContextualExplanation(
            event_type=event_type,
            explanation=explanation,
            metadata=dict(metadata or {}),
        )
