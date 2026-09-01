from dataclasses import dataclass
from agenttrace.api import Decision, PolicyDecision

@dataclass(frozen=True)
class AlertRule:
    name: str
    channel: str

RULES = (AlertRule("deny", "email"),)

def evaluate_alerts(decision: PolicyDecision, audit=None) -> list[dict[str, str]]:
    del audit
    if decision.decision != Decision.BLOCK:
        return []
    return [{"rule": rule.name, "channel": rule.channel, "message": f"Policy blocked: {decision.reason}"} for rule in RULES]
