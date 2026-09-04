from agenttrace.simulation.drift import DriftState
from agenttrace.simulation.models import SimulationEvent
from agenttrace.simulation.replay import ReplayBuffer
from agenttrace.simulation.state import SimulationState
from agenttrace.simulation.visual_events import to_visual_event


def state(tick: int) -> SimulationState:
    drift = DriftState(0, 0, 0, 0, 0, 0, "STABLE")
    return SimulationState(tick, (), (), drift, ())


def test_replay_buffer_is_bounded_and_keeps_latest():
    replay = ReplayBuffer(max_frames=2)
    replay.append(state(1))
    replay.append(state(2))
    replay.append(state(3))
    assert [frame.sequence for frame in replay.frames()] == [2, 3]
    assert replay.latest() is not None
    assert replay.latest().sequence == 3


def test_visual_event_mapping_preserves_sequence_and_subjects():
    event = SimulationEvent(
        7,
        "DEFENSE_TRIGGERED",
        "worm-1",
        "wall-1",
        {"reason": "collision"},
    )
    visual = to_visual_event(event)
    assert visual.sequence == 7
    assert visual.kind == "defense_trigger"
    assert visual.subject_id == "worm-1"
    assert visual.target_id == "wall-1"
    assert visual.intensity == 0.9
    assert visual.details["reason"] == "collision"
