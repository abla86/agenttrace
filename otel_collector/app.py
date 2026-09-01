from fastapi import FastAPI
from pydantic import BaseModel
from .collector import AgentTraceCollector, SpanRecord

app = FastAPI(title="AgentTrace OTel Collector")
collector = AgentTraceCollector()

class SpanRequest(BaseModel):
    name: str
    span_id: str

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

@app.post("/spans")
def consume_span(req: SpanRequest) -> dict[str, str]:
    collector.consume_span(SpanRecord(req.name, req.span_id))
    return {"status": "accepted", "span_id": req.span_id}

@app.get("/finalize")
def finalize() -> dict:
    result = collector.finalize()
    return {
        "nodes": {k: {"node_id": n.node_id, "taint": n.taint.value, "content": n.content, "parent_ids": n.parent_ids, "node_hash": n.node_hash} for k, n in result["nodes"].items()},
        "merkle": result["merkle"],
        "audit": [{"sequence": e.sequence, "event_type": e.event_type, "payload": e.payload, "digest": e.digest()} for e in result["audit"].events],
    }
