from agenttrace.simulation.autonomy import DefenseProposal
from agenttrace.simulation.drift import DriftState
from agenttrace.simulation.proposal_runtime import ProposalRuntime
from agenttrace.simulation.proposal_view import to_proposal_view
from agenttrace.simulation.proposals import ProposalEngine
from agenttrace.simulation.state import SimulationState


def _state(score: float = 75.0) -> SimulationState:
    drift = DriftState(
        pressure=80.0,
        injury_rate=10.0,
        active_worms=2,
        defense_triggers=0,
        propagation_events=1,
        score=score,
        status="HIGH" if score >= 70 else "ELEVATED",
    )
    return SimulationState(tick=7, worms=(), defenses=(), drift=drift, events=())


def test_runtime_creates_single_enriched_proposal() -> None:
    state = _state()
    runtime = ProposalRuntime()
    decisions = runtime.evaluate(state, lambda proposal: True)
    assert len(decisions) == 1
    view = to_proposal_view(decisions[0].proposal)
    assert view["code"].startswith("DEF_HIGH_000007_")
    assert "autonomy_proposal" in view["tags"]
    assert view["risk_level"] == "high"
    assert view["state"] == "PROMOTED"
    assert view["can_promote"] is True


def test_unapproved_proposal_cannot_be_promoted() -> None:
    state = _state()
    runtime = ProposalRuntime()
    decisions = runtime.evaluate(state, lambda proposal: False)
    assert decisions[0].approved is False
    assert decisions[0].proposal.proposal.approved is False
    assert to_proposal_view(decisions[0].proposal)["can_promote"] is False


def test_proposal_engine_risk_bands() -> None:
    state = _state(45.0)
    proposal = DefenseProposal(
        proposal_id="P-000001",
        reason="review",
        action="review_simulation_defense_coverage",
        parameters={"review_threshold": 45.0},
        metrics_snapshot=state.drift,
    )
    item = ProposalEngine.create(state, proposal)
    assert item.risk_level == "medium"
    assert item.code.startswith("REVIEW_MEDIUM_")
