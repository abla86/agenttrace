from agenttrace.simulation.controller import SimulationController
from agenttrace.warroom.view_model import build_warroom_view


def test_warroom_view_is_derived_from_controller_step() -> None:
    controller = SimulationController(seed=7)
    controller.arena.worms.spawn(id="w1", x=5.0, y=5.0)

    step = controller.tick()
    view = build_warroom_view(step)

    assert view.tick == step.state.tick
    assert view.arena["worm_count"] == len(step.state.worms)
    assert view.arena["defense_count"] == len(step.state.defenses)
    assert view.drift["status"] == step.drift.status
    assert view.worms == step.state.worms
    assert view.defenses == step.state.defenses


def test_warroom_view_limits_recent_events() -> None:
    controller = SimulationController(seed=7)
    controller.arena.worms.spawn(id="w1", x=5.0, y=5.0)

    step = controller.tick()
    view = build_warroom_view(step, max_events=1)

    assert len(view.recent_events) <= 1
