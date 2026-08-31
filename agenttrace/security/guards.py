from __future__ import annotations

from dataclasses import dataclass
from time import monotonic

from agenttrace.security.platform import AccessDenied, AuthContext, LockdownController, ReplayGuard, Role


class RequestRejected(ValueError):
    pass


@dataclass(frozen=True)
class RequestLimits:
    max_body_bytes: int = 256_000
    max_text_chars: int = 100_000


def validate_body_size(body: bytes, limits: RequestLimits = RequestLimits()) -> None:
    if len(body) > limits.max_body_bytes:
        raise RequestRejected("REQUEST_BODY_TOO_LARGE")


def validate_text_size(text: str, limits: RequestLimits = RequestLimits()) -> None:
    if len(text) > limits.max_text_chars:
        raise RequestRejected("TEXT_INPUT_TOO_LARGE")


class ExecutionGuard:
    def __init__(
        self,
        lockdown: LockdownController | None = None,
        replay: ReplayGuard | None = None,
    ) -> None:
        self.lockdown = lockdown or LockdownController()
        self.replay = replay or ReplayGuard()

    def authorize(
        self,
        actor: AuthContext,
        request_id: str,
        *,
        arena: bool = False,
        sandbox: bool = False,
        god_mode: bool = False,
    ) -> None:
        self.lockdown.authorize_execution()

        if not self.replay.accept(request_id):
            raise AccessDenied("REPLAY_DETECTED")

        if god_mode and actor.role is not Role.ADMIN:
            raise AccessDenied("ADMIN_REQUIRED_FOR_GOD_MODE")

        if arena and actor.role not in {Role.ADMIN, Role.OPERATOR}:
            raise AccessDenied("OPERATOR_REQUIRED_FOR_ARENA")

        if sandbox and actor.role not in {Role.ADMIN, Role.OPERATOR}:
            raise AccessDenied("OPERATOR_REQUIRED_FOR_SANDBOX")


def monotonic_timestamp() -> float:
    return monotonic()
