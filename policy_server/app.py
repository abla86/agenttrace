from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from agenttrace.api import ActionCapability, AgentPhase, PolicyEngine, ToolManifest, TraceNode, TaintLabel

app = FastAPI(title="AgentTrace Policy Server")
engine = PolicyEngine()

class ToolRegistration(BaseModel):
    name: str
    schema: dict = Field(default_factory=dict)
    capabilities: tuple[ActionCapability, ...] = (ActionCapability.READ,)
    version: str = "0.1.0"

class EvalRequest(BaseModel):
    tool_name: str
    version: str = "0.1.0"
    content: str
    action: ActionCapability = ActionCapability.READ
    phase: AgentPhase = AgentPhase.EXECUTION

class EvalResponse(BaseModel):
    decision: str
    reason: str
    phase: AgentPhase
    action: ActionCapability
    source_ids: tuple[str, ...]
    tool_name: str | None

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

@app.post("/tools/register")
def register_tool(req: ToolRegistration) -> dict[str, str]:
    manifest = ToolManifest(req.name, req.schema, req.capabilities, req.version)
    return {"fingerprint": engine.registry.register(manifest)}

@app.post("/evaluate", response_model=EvalResponse)
def evaluate(req: EvalRequest) -> EvalResponse:
    manifest = ToolManifest(req.tool_name, {}, (req.action,), req.version)
    if not engine.registry.verify(manifest):
        raise HTTPException(status_code=409, detail="TOOL_MANIFEST_INVALID")
    node = TraceNode("req-node", TaintLabel.TOOL_OUTPUT_UNTRUSTED, req.content, ())
    decision = engine.evaluate({node.node_id: node}, req.phase, req.action, (node.node_id,), manifest)
    return EvalResponse(
        decision=decision.decision.value,
        reason=decision.reason,
        phase=decision.phase,
        action=decision.action,
        source_ids=decision.source_ids,
        tool_name=decision.tool_name,
    )
