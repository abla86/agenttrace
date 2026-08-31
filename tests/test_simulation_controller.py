from agenttrace.simulation.controller import SimulationController


def test_tick_only_observes_and_proposes_without_promotion() -> None:
    controller = SimulationController(seed=7)
    controller.arena.worms.spawn(id="w1", x=5.0, y=5.0)

    before = len(controller.arena.defense.walls)
    step = controller.tick()

    assert step.state.tick == controller.arena.sequence
    assert len(controller.arena.defense.walls) == before


def test_explicit_promotion_can_change_simulation_defense() -> None:
    controller = SimulationController(seed=7)
    controller.arena.worms.spawn(id="w1", x=5.0, y=5.0)

    proposal = controller.autonomy.propose(
        controller.tick().state,
        {
            "action": "increase_simulation_defense_coverage",
            "parameters": {"coverage_delta": 0.10},
            "reason": "test promotion",
        },
    )
    assert proposal is not None

    before = len(controller.arena.defense.walls)
    controller.promote(proposal)
    assert len(controller.arena.defense.walls) == before + 1


def test_unsupported_proposal_is_rejected() -> None:
    controller = SimulationController(seed=7)
    state = controller.tick().state
    proposal = controller.autonomy.propose(
        state,
        {
            "action": "execute_external_command",
            "parameters": {},
            "reason": "must never be allowed",
        },
    )
    assert proposal is not None
    try:
        controller.promote(proposal)
    except PermissionError:
        pass
    else:
        raise AssertionError("unsupported proposals must not be promoted")
