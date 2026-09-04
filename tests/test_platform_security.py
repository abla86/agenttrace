import os
import unittest

from agenttrace.security.platform import (
    AccessDenied,
    AuthContext,
    LockdownController,
    PlatformMode,
    ReplayGuard,
    Role,
    health,
    request_digest,
    require_mode,
    require_role,
    sign_internal_message,
    verify_internal_message,
)


class TestPlatformSecurity(unittest.TestCase):
    def test_role_enforcement(self):
        admin = AuthContext("a", Role.ADMIN)
        viewer = AuthContext("v", Role.VIEWER)
        require_role(admin, {Role.ADMIN})
        with self.assertRaises(AccessDenied):
            require_role(viewer, {Role.ADMIN})

    def test_arena_requires_operator_or_admin(self):
        require_mode(PlatformMode.ARENA, AuthContext("o", Role.OPERATOR))
        with self.assertRaises(AccessDenied):
            require_mode(PlatformMode.ARENA, AuthContext("v", Role.VIEWER))

    def test_lockdown_requires_admin_to_exit(self):
        controller = LockdownController()
        controller.enable("test")
        with self.assertRaises(AccessDenied):
            controller.disable(AuthContext("o", Role.OPERATOR))
        controller.disable(AuthContext("a", Role.ADMIN))
        controller.authorize_execution()

    def test_replay_guard_rejects_same_request_id(self):
        guard = ReplayGuard(ttl_seconds=30)
        self.assertTrue(guard.accept("req-1"))
        self.assertFalse(guard.accept("req-1"))

    def test_request_digest_is_deterministic(self):
        self.assertEqual(request_digest(["a", "b"]), request_digest(["a", "b"]))
        self.assertNotEqual(request_digest(["a", "b"]), request_digest(["b", "a"]))

    def test_internal_message_signature_requires_key_and_verifies(self):
        secret = b"local-test-secret"
        payload = b"security-event"
        signature = sign_internal_message(payload, secret)
        self.assertTrue(verify_internal_message(payload, signature, secret))
        self.assertFalse(verify_internal_message(b"tampered", signature, secret))

    def test_health_degraded_without_configured_secret(self):
        original = os.environ.pop("AGENTTRACE_INTERNAL_SECRET", None)
        try:
            result = health(LockdownController(), ReplayGuard(), PlatformMode.ENTERPRISE)
            self.assertEqual(result.status, "DEGRADED")
            self.assertFalse(result.internal_secret_configured)
        finally:
            if original is not None:
                os.environ["AGENTTRACE_INTERNAL_SECRET"] = original


if __name__ == "__main__":
    unittest.main()
