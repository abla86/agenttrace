from fastapi import FastAPI
from pydantic import BaseModel
from agenttrace.api import ActionCapability, AgentPhase, Decision, PolicyDecision
from .engine import evaluate_alerts

app = FastAPI(title="AgentTrace Alert Engine")

class DecisionRequest(BaseModel):
    decision: Decision
    reason: str
    phase: AgentPhase
    action: ActionCapability
    source_ids: tuple[str, ...] = ()
    tool_name: str | None = None
    attack: bool = False

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

@app.post("/alerts")
def alerts(req: DecisionRequest) -> dict:
    decision = PolicyDecision(req.decision, req.reason, req.phase, req.action, req.source_ids, req.tool_name, req.attack)
    return {"alerts": evaluate_alerts(decision)}
