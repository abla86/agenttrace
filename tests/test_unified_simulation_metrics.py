from agenttrace.simulation.controller import SimulationController


def test_controller_exposes_unified_drift_metrics() -> None:
    controller = SimulationController(seed=7)
    controller.arena.worms.spawn(id="w1", x=5.0, y=5.0)

    step = controller.tick()

    assert 0.0 <= step.drift.defense_load <= 100.0
    assert 0.0 <= step.drift.infection_rate <= 100.0
    assert 0.0 <= step.drift.autonomy_level <= 100.0
    assert step.state.drift == step.drift


def test_mutation_engine_uses_previous_drift_score() -> None:
    controller = SimulationController(seed=7)
    controller.arena.worms.spawn(id="w1", x=5.0, y=5.0)

    controller.drift = controller.drift.__class__(
        pressure=0.0,
        injury_rate=0.0,
        active_worms=1,
        defense_triggers=0,
        propagation_events=0,
        score=100.0,
        status="HIGH",
    )

    step = controller.tick()

    assert step.state.tick > 0
    assert step.drift.score >= 0.0
