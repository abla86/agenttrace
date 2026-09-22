"""AgentTrace policy gateway exposed as an MCP server.

This example is intentionally small: AgentTrace remains the policy/audit layer,
while MCP provides the interoperability boundary for agent clients such as
Google ADK. No production credentials or external systems are contacted.
"""

from __future__ import annotations

from agenttrace.api import (
    ActionCapability,
    AgentPhase,
    EvaluationLab,
    TaintLabel,
    ToolManifest,
)
from mcp.server import MCPServer

mcp = MCPServer("agenttrace-policy-gateway")
lab = EvaluationLab()


def _evaluate(
    *,
    node_id: str,
    taint: TaintLabel,
    content: str,
    action: ActionCapability,
    tool: ToolManifest,
):
    lab.add_node(node_id, taint, content)
    return lab.evaluate(
        scenario=f"mcp:{tool.name}",
        phase=AgentPhase.EXECUTION,
        action=action,
        source_ids=[node_id],
        tool=tool,
    )


READ_TOOL = ToolManifest(
    name="read_evidence",
    schema={"type": "object", "properties": {"query": {"type": "string"}}},
    capabilities=(ActionCapability.READ,),
)

WRITE_TOOL = ToolManifest(
    name="save_review_note",
    schema={
        "type": "object",
        "properties": {
            "note": {"type": "string"},
            "provenance": {"type": "string"},
        },
    },
    capabilities=(ActionCapability.WRITE,),
)


@mcp.tool()
def read_evidence(query: str) -> dict:
    """Read synthetic evidence after AgentTrace policy evaluation."""
    result = _evaluate(
        node_id="mcp-read",
        taint=TaintLabel.USER_INTENT,
        content=query,
        action=ActionCapability.READ,
        tool=READ_TOOL,
    )
    decision = result.decisions[0]

    return {
        "decision": decision.decision.value,
        "reason": decision.reason,
        "tool": READ_TOOL.name,
        "result": "Synthetic evidence context only."
        if decision.decision.value == "ALLOW"
        else None,
        "audit_root": lab.audit_root(),
    }


@mcp.tool()
def save_review_note(note: str, provenance: str = "USER_INTENT") -> dict:
    """Write a synthetic review note only when AgentTrace authorizes it."""
    taint = TaintLabel(provenance)
    result = _evaluate(
        node_id="mcp-write",
        taint=taint,
        content=note,
        action=ActionCapability.WRITE,
        tool=WRITE_TOOL,
    )
    decision = result.decisions[0]

    return {
        "decision": decision.decision.value,
        "reason": decision.reason,
        "tool": WRITE_TOOL.name,
        "persisted": decision.decision.value == "ALLOW",
        "audit_root": lab.audit_root(),
    }


if __name__ == "__main__":
    # MCP SDK v2 uses Streamable HTTP for this example.
    mcp.run(transport="streamable-http", stateless_http=True, json_response=True)
