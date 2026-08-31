from agenttrace.simulation.controller import SimulationController
from agenttrace.warroom.dashboard import build_dashboard_payload
from agenttrace.warroom.view_model import build_warroom_view


def test_dashboard_contains_live_metrics_and_visualizations() -> None:
    controller = SimulationController(seed=7)
    step = controller.tick()
    view = build_warroom_view(step)
    payload = build_dashboard_payload(view)

    assert {"metrics", "drift", "wormHeatmap", "defenseCoverage"} <= payload.keys()
    assert {"incidentTimeline", "agents", "threat"} <= payload.keys()
    assert len(payload["wormHeatmap"]) == 20
    assert len(payload["wormHeatmap"][0]) == 20


def test_dashboard_uses_controller_state_without_mutation() -> None:
    controller = SimulationController(seed=7)
    step = controller.tick()
    view = build_warroom_view(step)
    before = tuple(view.recent_events)

    build_dashboard_payload(view)

    assert tuple(view.recent_events) == before
