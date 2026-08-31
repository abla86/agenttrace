from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
import hashlib
import hmac
import os
import time
from typing import Iterable


class Role(str, Enum):
    ADMIN = "admin"
    OPERATOR = "operator"
    VIEWER = "viewer"


class PlatformMode(str, Enum):
    ENTERPRISE = "enterprise"
    ARENA = "arena"
    LOCKDOWN = "lockdown"


@dataclass(frozen=True)
class AuthContext:
    subject: str
    role: Role


class AccessDenied(PermissionError):
    pass


class LockdownController:
    def __init__(self) -> None:
        self._locked = False
        self._reason = ""
        self._changed_at = time.time()

    @property
    def locked(self) -> bool:
        return self._locked

    @property
    def reason(self) -> str:
        return self._reason

    def enable(self, reason: str = "manual") -> None:
        self._locked = True
        self._reason = reason[:256]
        self._changed_at = time.time()

    def disable(self, actor: AuthContext) -> None:
        if actor.role is not Role.ADMIN:
            raise AccessDenied("ADMIN_REQUIRED_TO_EXIT_LOCKDOWN")
        self._locked = False
        self._reason = ""
        self._changed_at = time.time()

    def authorize_execution(self) -> None:
        if self._locked:
            raise AccessDenied("SYSTEM_LOCKDOWN")


class ReplayGuard:
    def __init__(self, ttl_seconds: float = 30.0) -> None:
        self.ttl_seconds = ttl_seconds
        self._seen: dict[str, float] = {}

    def accept(self, request_id: str) -> bool:
        now = time.time()
        stale = [key for key, ts in self._seen.items() if now - ts > self.ttl_seconds]
        for key in stale:
            self._seen.pop(key, None)
        if request_id in self._seen:
            return False
        self._seen[request_id] = now
        return True


def canonical_request(parts: Iterable[str]) -> str:
    return "\n".join(parts)


def request_digest(parts: Iterable[str]) -> str:
    return hashlib.sha256(canonical_request(parts).encode("utf-8")).hexdigest()


def sign_internal_message(payload: bytes, secret: bytes | None = None) -> str:
    key = secret or os.environ.get("AGENTTRACE_INTERNAL_SECRET", "").encode("utf-8")
    if not key:
        raise RuntimeError("AGENTTRACE_INTERNAL_SECRET_NOT_CONFIGURED")
    return hmac.new(key, payload, hashlib.sha256).hexdigest()


def verify_internal_message(payload: bytes, signature: str, secret: bytes | None = None) -> bool:
    expected = sign_internal_message(payload, secret)
    return hmac.compare_digest(expected, signature)


def require_role(actor: AuthContext, allowed: set[Role]) -> None:
    if actor.role not in allowed:
        raise AccessDenied("ROLE_NOT_ALLOWED")


def require_mode(mode: PlatformMode, actor: AuthContext) -> None:
    if mode is PlatformMode.ARENA:
        require_role(actor, {Role.ADMIN, Role.OPERATOR})
    elif mode is PlatformMode.LOCKDOWN:
        require_role(actor, {Role.ADMIN})


@dataclass(frozen=True)
class SecurityHealth:
    status: str
    lockdown: bool
    mode: PlatformMode
    replay_cache_size: int
    internal_secret_configured: bool


def health(controller: LockdownController, replay_guard: ReplayGuard, mode: PlatformMode) -> SecurityHealth:
    configured = bool(os.environ.get("AGENTTRACE_INTERNAL_SECRET"))
    status = "DEGRADED" if not configured else "LOCKED" if controller.locked else "OK"
    return SecurityHealth(
        status=status,
        lockdown=controller.locked,
        mode=mode,
        replay_cache_size=len(replay_guard._seen),
        internal_secret_configured=configured,
    )
