from agenttrace.simulation.controller import SimulationController
from agenttrace.warroom.live_scene import build_live_scene
from agenttrace.warroom.view_model import build_warroom_view


def test_live_scene_projects_authoritative_worms() -> None:
    controller = SimulationController(seed=7)
    controller.arena.worms.spawn(id="w1", x=4.0, y=6.0)

    step = controller.tick()
    view = build_warroom_view(step)
    scene = build_live_scene(view)

    assert scene["tick"] == step.state.tick
    assert scene["worms"]
    assert scene["worms"][0]["id"] == "w1"
    assert "speed" in scene["worms"][0]
    assert "stealth" in scene["worms"][0]


def test_live_scene_contains_same_defenses_and_events_as_view() -> None:
    controller = SimulationController(seed=7)
    controller.arena.worms.spawn(id="w1", x=4.0, y=6.0)

    step = controller.tick()
    view = build_warroom_view(step)
    scene = build_live_scene(view)

    assert scene["defenses"] == list(view.defenses)
    assert scene["events"] == list(view.recent_events)
    assert "metrics" in scene
