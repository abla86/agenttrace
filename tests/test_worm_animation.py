from agenttrace.simulation.controller import SimulationController
from agenttrace.warroom.view_model import build_warroom_view
from agenttrace.warroom.worm_animation import build_animated_worms


def test_mutation_event_drives_mutate_effect() -> None:
    controller = SimulationController(seed=7)
    controller.arena.worms.spawn(id="w1", x=5.0, y=5.0)
    step = controller.tick()
    view = build_warroom_view(step)

    view.recent_events = tuple(
        [
            {
                "sequence": 1,
                "type": "WORM_MUTATED",
                "worm_id": "w1",
                "details": {"mutation": "speed"},
            }
        ]
    )

    animated = build_animated_worms(view)
    assert animated[0]["effect"] == "mutate"
    assert animated[0]["pulse"] is True


def test_defense_event_drives_evade_effect() -> None:
    controller = SimulationController(seed=7)
    controller.arena.worms.spawn(id="w1", x=5.0, y=5.0)
    step = controller.tick()
    view = build_warroom_view(step)
    view.recent_events = tuple(
        [
            {
                "sequence": 1,
                "type": "DEFENSE_TRIGGERED",
                "worm_id": "w1",
                "details": {},
            }
        ]
    )

    animated = build_animated_worms(view)
    assert animated[0]["effect"] == "evade"
