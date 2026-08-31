from agenttrace.simulation.controller import SimulationController


def test_controller_updates_swarm_ecosystem_without_breaking_snapshot() -> None:
    controller = SimulationController(seed=7)
    controller.arena.worms.spawn(id="w1")

    step = controller.tick()

    assert step.state is not None
    assert controller.swarm.state is not None
    assert controller.civilization.colonies
    assert controller.civilization.territories
    assert controller.civilization.civilizations


def test_controller_is_deterministic_for_same_seed() -> None:
    left = SimulationController(seed=19)
    right = SimulationController(seed=19)
    left.arena.worms.spawn(id="w1")
    right.arena.worms.spawn(id="w1")

    left_step = left.tick()
    right_step = right.tick()

    assert left_step.drift == right_step.drift
    assert left_step.state.events == right_step.state.events
    assert left_step.state.worms == right_step.state.worms
