from agenttrace.warroom.agents import build_agent_grid
from agenttrace.warroom.incidents import build_incident_timeline


def test_incident_timeline_normalizes_invalid_stage_and_severity() -> None:
    events = [
        {
            "sequence": 1,
            "type": "defense.trigger",
            "tick": 4,
            "details": {
                "stage": "CONTAIN",
                "severity": "high",
                "agent": "defense-1",
                "label": "Threat contained",
            },
        },
        {
            "sequence": 2,
            "type": "unknown",
            "tick": 5,
            "details": {"stage": "INVALID", "severity": "INVALID"},
        },
    ]

    result = build_incident_timeline(events)

    assert result[0]["stage"] == "CONTAIN"
    assert result[0]["severity"] == "high"
    assert result[1]["stage"] == "ANALYZE"
    assert result[1]["severity"] == "medium"


def test_agent_grid_keeps_latest_agent_status() -> None:
    events = [
        {"sequence": 1, "type": "agent.start", "details": {"agent_id": "a1", "state": "idle", "health": 90}},
        {"sequence": 2, "type": "agent.respond", "details": {"agent_id": "a1", "state": "responding", "health": 75}},
    ]

    result = build_agent_grid(object(), events)

    assert len(result) == 1
    assert result[0]["state"] == "responding"
    assert result[0]["health"] == 75.0
