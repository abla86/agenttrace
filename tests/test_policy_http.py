from starlette.testclient import TestClient

from core_integration.http import app


def test_health():
    response = TestClient(app).get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_evaluate():
    response = TestClient(app).post(
        "/evaluate",
        json={"tool_name": "azure-monitor", "content": "CPU=42.0"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["decision"] == "ALLOW"
    assert body["reason"] == "POLICY_ALLOWED"
    assert len(body["node_hash"]) == 64
    assert len(body["tool_fingerprint"]) == 64
    assert len(body["audit_root"]) == 64
