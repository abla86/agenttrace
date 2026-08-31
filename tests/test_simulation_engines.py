from agenttrace.simulation.autonomy import AutonomyEngine
from agenttrace.simulation.drift import DriftEngine
from agenttrace.simulation.engines import ArenaEngine


def test_arena_is_reproducible_with_same_seed():
    a = ArenaEngine(seed=42)
    b = ArenaEngine(seed=42)
    a.worms.spawn(id="w1", strategy="aggressive")
    b.worms.spawn(id="w1", strategy="aggressive")
    a.defense.add_firewall(12, 12)
    b.defense.add_firewall(12, 12)

    assert a.tick() == b.tick()
    assert a.snapshot()["worms"] == b.snapshot()["worms"]


def test_drift_engine_produces_bounded_state():
    arena = ArenaEngine(seed=1)
    arena.worms.spawn(id="w1", health=20, strategy="seek")
    events = arena.tick()
    state = DriftEngine().update(arena.worms.worms, events)

    assert 0 <= state.score <= 100
    assert state.status in {"STABLE", "ELEVATED", "HIGH"}


def test_autonomy_only_proposes_changes():
    arena = ArenaEngine(seed=1)
    arena.worms.spawn(id="w1", health=1, strategy="seek")
    events = arena.tick()
    drift = DriftEngine().update(arena.worms.worms, events)
    before = list(arena.defense.walls)
    proposals = AutonomyEngine().propose(drift)

    assert arena.defense.walls == before
    for proposal in proposals:
        assert proposal.requires_explicit_promotion is True
