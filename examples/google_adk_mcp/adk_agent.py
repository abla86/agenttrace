"""Google ADK client for the AgentTrace MCP policy gateway.

Requires:
    pip install "google-adk>=1.29.0"

Set the Gemini/Google credentials required by your ADK environment before
running this example. The example only connects to the local MCP gateway.
"""

from google.adk.agents import LlmAgent
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import (
    StreamableHTTPConnectionParams,
)

mcp_tools = McpToolset(
    connection_params=StreamableHTTPConnectionParams(
        url="http://127.0.0.1:8000/mcp",
        timeout=10,
        sse_read_timeout=30,
    ),
    tool_filter=["read_evidence", "save_review_note"],
    tool_name_prefix="agenttrace",
)

root_agent = LlmAgent(
    model="gemini-2.5-flash",
    name="agenttrace_demo_agent",
    description="ADK agent using AgentTrace as an MCP policy and audit gateway.",
    instruction=(
        "Use the AgentTrace MCP tools for synthetic evidence workflows. "
        "Never claim that synthetic evidence is real research data. "
        "Treat BLOCK responses as authoritative policy decisions."
    ),
    tools=[mcp_tools],
)
