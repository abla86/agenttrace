from starlette.testclient import TestClient

from core_integration.http import app


client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_evaluate():
    response = client.post(
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


def test_evaluate_rejects_malformed_json():
    response = client.post(
        "/evaluate",
        content=b'{"tool_name":',
        headers={"content-type": "application/json"},
    )

    assert response.status_code == 400
    assert response.json() == {"error": "request body must be valid JSON"}


def test_evaluate_rejects_non_object_json():
    response = client.post("/evaluate", json=["azure-monitor", "CPU=42.0"])

    assert response.status_code == 400
    assert response.json() == {"error": "request body must be a JSON object"}


def test_evaluate_rejects_missing_or_invalid_fields():
    for payload, message in [
        ({"content": "CPU=42.0"}, "tool_name must be a non-empty string"),
        ({"tool_name": "   ", "content": "CPU=42.0"}, "tool_name must be a non-empty string"),
        ({"tool_name": "azure-monitor"}, "content must be a string"),
        ({"tool_name": "azure-monitor", "content": 42}, "content must be a string"),
    ]:
        response = client.post("/evaluate", json=payload)
        assert response.status_code == 400
        assert response.json() == {"error": message}
