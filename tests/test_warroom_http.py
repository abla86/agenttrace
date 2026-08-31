from __future__ import annotations

from starlette.testclient import TestClient

from agenttrace.warroom.http import app


def test_state_endpoint_returns_unified_view() -> None:
    client = TestClient(app)
    response = client.get("/simulation/state")
    assert response.status_code == 200
    body = response.json()
    assert {"tick", "arena", "drift", "worms", "defenses", "proposals", "recent_events"} <= body.keys()


def test_tick_endpoint_advances_same_runtime() -> None:
    client = TestClient(app)
    before = client.get("/simulation/state").json()["tick"]
    after = client.post("/simulation/tick").json()["tick"]
    assert after > before


def test_missing_proposal_is_not_promoted() -> None:
    client = TestClient(app)
    response = client.post("/simulation/proposal/promote", json={"proposal_id": "missing"})
    assert response.status_code == 404


def test_reset_restores_runtime_tick_sequence() -> None:
    client = TestClient(app)
    client.post("/simulation/tick")
    response = client.post("/simulation/reset")
    assert response.status_code == 200
    assert response.json()["tick"] == 1
